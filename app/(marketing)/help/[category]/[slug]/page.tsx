import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getHelpArticle, getHelpCategories } from '@/lib/help';

interface ArticlePageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateStaticParams() {
  const categories = getHelpCategories();
  const params: { category: string; slug: string }[] = [];
  for (const cat of categories) {
    for (const article of cat.articles) {
      params.push({ category: cat.slug, slug: article.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { category, slug } = await params;
  const article = getHelpArticle(category, slug);
  if (!article) return {};
  return {
    title: `${article.title} – Help Center`,
    description: article.description,
  };
}

export default async function HelpArticlePage({ params }: ArticlePageProps) {
  const { category, slug } = await params;
  const article = getHelpArticle(category, slug);
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/help"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to Help Center
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>
      {article.description && (
        <p className="mt-2 text-lg text-muted-foreground">{article.description}</p>
      )}

      <hr className="my-8 border-border" />

      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <MDXRemote source={article.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </article>
    </div>
  );
}
