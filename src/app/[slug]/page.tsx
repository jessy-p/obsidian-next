import { remark } from 'remark';
import html from 'remark-html';
import { getSlugToFileMap, readMarkdownFile, getTitleToSlugMap } from '@/lib/markdown';
import ReadingTracker from '@/components/ReadingTracker';

interface Params {
  slug: string;
}

interface NotePageProps {
  params: Promise<Params>;
}

export async function generateStaticParams() {
  const slugToFile = getSlugToFileMap();
  return Object.keys(slugToFile).map(slug => ({
    slug
  }));
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params;
  const slugToFile = getSlugToFileMap();
  const filePath = slugToFile[slug];
  
  if (!filePath) {
    return <div>Note not found</div>;
  }
  
  // Read and parse markdown file
  const { frontMatter, content } = readMarkdownFile(filePath);
  const title = frontMatter.title || slug;
  
  // Process internal links before markdown conversion
  const titleToSlug = getTitleToSlugMap();
  const processedContent = content.replace(/\[\[([^\]]+)\]\]/g, (match, linkText) => {
    const slug = titleToSlug[linkText.toLowerCase()];
    if (slug) {
      return `[${linkText}](/${slug})`;
    } else {
      return `<span class="text-red-500 font-mono">${linkText}</span>`;
    }
  });
  
  // Convert markdown to HTML
  const htmlContent = await remark()
    .use(html, { allowDangerousHtml: true })
    .process(processedContent);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ReadingTracker slug={slug} title={title} />
      <div className="prose prose-lg">
        <div dangerouslySetInnerHTML={{ __html: htmlContent.toString() }} />
      </div>
    </div>
  );
}