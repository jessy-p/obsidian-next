import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { siteConfig } from '@/config';
import { visit } from 'unist-util-visit';
import type { Node, Parent } from 'unist';
import type { Text, Link } from 'mdast';

export interface NoteData {
  slug: string;
  path: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
}

export interface SlugToFileMap {
  [key: string]: string;
}

export interface FrontMatter {
  title?: string;
  description?: string;
  tags?: string[];
  date?: string;
}

// Get all markdown files with full metadata
export function getAllMarkdownFiles(): NoteData[] {
  const contentDir = path.join(process.cwd(), siteConfig.contentPath);
  const files: NoteData[] = [];
  
  function scanDirectory(dir: string, relativePath: string = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const itemRelativePath = relativePath ? `${relativePath}/${item}` : item;
      
      if (fs.statSync(fullPath).isDirectory()) {
        scanDirectory(fullPath, itemRelativePath);
      } else if (item.endsWith('.md')) {
        const slug = itemRelativePath.replace('.md', '').replace('/', '-');
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(fileContent);
        
        files.push({
          slug,
          path: itemRelativePath,
          category: relativePath || 'general',
          title: data.title || slug,
          description: data.description || '',
          tags: data.tags || [],
          date: data.date || ''
        });
      }
    });
  }
  
  scanDirectory(contentDir);
  return files;
}

// Get slug to file mapping (for generateStaticParams)
export function getSlugToFileMap(): SlugToFileMap {
  const contentDir = path.join(process.cwd(), siteConfig.contentPath);
  const slugToFile: SlugToFileMap = {};
  
  function scanDirectory(dir: string, relativePath: string = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const itemRelativePath = relativePath ? `${relativePath}/${item}` : item;
      
      if (fs.statSync(fullPath).isDirectory()) {
        scanDirectory(fullPath, itemRelativePath);
      } else if (item.endsWith('.md')) {
        const slug = itemRelativePath.replace('.md', '').replace('/', '-');
        slugToFile[slug] = itemRelativePath;
      }
    });
  }
  
  scanDirectory(contentDir);
  return slugToFile;
}

// Read and parse a single markdown file
export function readMarkdownFile(filePath: string) {
  const fullPath = path.join(process.cwd(), siteConfig.contentPath, filePath);
  const fileContent = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContent);
  
  return {
    frontMatter: data as FrontMatter,
    content
  };
}

// Create a title-to-slug mapping for internal linking
export function getTitleToSlugMap(): { [key: string]: string } {
  const files = getAllMarkdownFiles();
  const titleToSlug: { [key: string]: string } = {};
  
  files.forEach(file => {
    // Map both title and filename to slug
    titleToSlug[file.title.toLowerCase()] = file.slug;
    titleToSlug[file.slug] = file.slug;
    
    // Also map the original file path (without .md extension)
    const originalPath = file.path.replace('.md', '');
    titleToSlug[originalPath.toLowerCase()] = file.slug;
    
    // Map just the filename without extension
    const filename = file.path.split('/').pop()?.replace('.md', '');
    if (filename) {
      titleToSlug[filename.toLowerCase()] = file.slug;
    }
  });
  
  return titleToSlug;
}

// Remark plugin to process [[internal links]]
export function remarkInternalLinks() {
  const titleToSlug = getTitleToSlugMap();
  
  return (tree: Node) => {
    visit(tree, 'text', (node: Text, index: number, parent: Parent) => {
      const text = node.value;
      const linkRegex = /\[\[([^\]]+)\]\]/g;
      
      if (!linkRegex.test(text)) return;
      
      if (!parent || !parent.children || index === null) return;
      
      const newNodes: Node[] = [];
      let lastIndex = 0;
      let match;
      
      // Reset regex
      linkRegex.lastIndex = 0;
      
      while ((match = linkRegex.exec(text)) !== null) {
        const [fullMatch, linkText] = match;
        const startIndex = match.index!;
        
        // Add text before the link
        if (startIndex > lastIndex) {
          newNodes.push({
            type: 'text',
            value: text.slice(lastIndex, startIndex)
          } as Text);
        }
        
        // Create the link
        const slug = titleToSlug[linkText.toLowerCase()];
        if (slug) {
          newNodes.push({
            type: 'link',
            url: `/${slug}`,
            children: [{
              type: 'text',
              value: linkText
            }]
          } as Link);
        } else {
          // Link target not found, render as plain text but styled
          newNodes.push({
            type: 'text',
            value: linkText,
            data: {
              hName: 'span',
              hProperties: {
                className: 'text-red-500 font-mono'
              }
            }
          } as Text);
        }
        
        lastIndex = startIndex + fullMatch.length;
      }
      
      // Add remaining text
      if (lastIndex < text.length) {
        newNodes.push({
          type: 'text',
          value: text.slice(lastIndex)
        } as Text);
      }
      
      // Replace the current node with new nodes
      parent.children.splice(index, 1, ...newNodes);
    });
  };
}