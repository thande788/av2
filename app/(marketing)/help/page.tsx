import Link from 'next/link';
import { BookOpen, ChevronRight } from 'lucide-react';
import { getHelpCategories } from '@/lib/help';

export const metadata = {
  title: 'Help Center',
  description: 'Guides and resources for using Angel Touch Homecare portals',
};

export default function HelpCenterPage() {
  const categories = getHelpCategories();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="text-center mb-12">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
          <BookOpen className="size-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Help Center</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Guides and resources to help you get the most out of your portal
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <BookOpen className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">Help articles coming soon</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.slug}
              className="rounded-xl border p-6 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <h2 className="text-lg font-semibold">{category.title}</h2>
              <ul className="mt-4 space-y-2">
                {category.articles.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/help/${category.slug}/${article.slug}`}
                      className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ChevronRight className="size-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
