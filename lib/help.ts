import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface HelpArticle {
  slug: string;
  category: string;
  title: string;
  description: string;
  order: number;
  content: string;
}

export interface HelpCategory {
  slug: string;
  title: string;
  articles: Omit<HelpArticle, 'content'>[];
}

const HELP_DIR = path.join(process.cwd(), 'content', 'help');

/** Get all help articles across all categories */
export function getAllHelpArticles(): Omit<HelpArticle, 'content'>[] {
  const categories = fs
    .readdirSync(HELP_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const articles: Omit<HelpArticle, 'content'>[] = [];

  for (const category of categories) {
    const categoryDir = path.join(HELP_DIR, category);
    const files = fs.readdirSync(categoryDir).filter((f) => f.endsWith('.mdx'));

    for (const file of files) {
      const raw = fs.readFileSync(path.join(categoryDir, file), 'utf-8');
      const { data } = matter(raw);

      articles.push({
        slug: file.replace(/\.mdx$/, ''),
        category,
        title: (data.title as string) || file.replace(/\.mdx$/, ''),
        description: (data.description as string) || '',
        order: (data.order as number) || 0,
      });
    }
  }

  return articles.sort((a, b) => a.order - b.order);
}

/** Get grouped articles by category */
export function getHelpCategories(): HelpCategory[] {
  const articles = getAllHelpArticles();
  const categoryMap = new Map<string, Omit<HelpArticle, 'content'>[]>();

  for (const article of articles) {
    const list = categoryMap.get(article.category) ?? [];
    list.push(article);
    categoryMap.set(article.category, list);
  }

  const categoryTitles: Record<string, string> = {
    'getting-started': 'Getting Started',
    scheduling: 'Scheduling & Shifts',
    billing: 'Billing & Payments',
  };

  return Array.from(categoryMap.entries()).map(([slug, arts]) => ({
    slug,
    title: categoryTitles[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    articles: arts,
  }));
}

/** Get a single article by category + slug */
export function getHelpArticle(category: string, slug: string): HelpArticle | null {
  const filePath = path.join(HELP_DIR, category, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    slug,
    category,
    title: (data.title as string) || slug,
    description: (data.description as string) || '',
    order: (data.order as number) || 0,
    content,
  };
}
