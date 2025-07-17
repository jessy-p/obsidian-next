import Link from 'next/link';
import { getAllMarkdownFiles, type NoteData } from '@/lib/markdown';
import { siteConfig } from '@/config';
import LastReadWidget from '@/components/LastReadWidget';

interface Categories {
  [key: string]: NoteData[];
}

export default function HomePage() {
  const notes = getAllMarkdownFiles();
  
  // Group notes by category
  const categories: Categories = notes.reduce((acc, note) => {
    if (!acc[note.category]) {
      acc[note.category] = [];
    }
    acc[note.category].push(note);
    return acc;
  }, {} as Categories);

  return (
    <div className="container mx-auto px-6 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{siteConfig.siteName}</h1>
        <p className="text-gray-600 text-sm">{siteConfig.siteDescription}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          {Object.entries(categories).map(([category, categoryNotes]) => (
            <section key={category}>
              <h2 className="text-lg font-semibold mb-2 text-blue-600">
                📁 {category}/
              </h2>
              <div className="ml-4 space-y-1">
                {categoryNotes.map((note) => (
                  <div key={note.slug} className="flex items-center justify-between py-1 hover:bg-gray-50 transition-colors">
                    <Link 
                      href={`/${note.slug}`}
                      className="text-gray-900 hover:text-blue-600 transition-colors font-mono text-sm"
                    >
                      📄 {note.title}
                    </Link>
                    {note.tags.length > 0 && (
                      <div className="flex gap-1">
                        {note.tags.map((tag) => (
                          <span 
                            key={tag} 
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <LastReadWidget />
        </div>
      </div>
    </div>
  );
}