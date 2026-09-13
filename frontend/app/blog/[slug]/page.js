import { notFound } from 'next/navigation';
import Link from 'next/link';
import { blogArticles } from '../../../data/blogData';

export async function generateStaticParams() {
  return blogArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = blogArticles.find((a) => a.slug === slug);
  if (!article) return {};

  const url = `https://www.resumex.tech/blog/${slug}`;

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const article = blogArticles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const url = `https://www.resumex.tech/blog/${slug}`;

  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    author: { '@type': 'Organization', name: article.author },
    url,
  };

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.resumex.tech/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.resumex.tech/blog' },
      { '@type': 'ListItem', position: 3, name: article.title, item: url },
    ],
  };

  const articleStyles = `
    .article-body h2 {
      font-size: 1.55rem;
      font-weight: 700;
      color: #0A2540;
      margin-top: 3rem;
      margin-bottom: 1rem;
      line-height: 1.3;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(10,37,64,0.08);
    }
    .dark .article-body h2 {
      color: #f8fafc;
      border-color: rgba(255,255,255,0.08);
    }
    .article-body h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0A2540;
      margin-top: 2.5rem;
      margin-bottom: 0.4rem;
      line-height: 1.4;
    }
    .dark .article-body h3 {
      color: #f8fafc;
    }
    .article-body p {
      font-size: 1.05rem;
      line-height: 1.85;
      color: #374151;
      margin-bottom: 1rem;
    }
    .dark .article-body p {
      color: #d1d5db;
    }
    .article-body ul, .article-body ol {
      padding-left: 1.5rem;
      margin-bottom: 1.25rem;
    }
    .article-body ul { list-style-type: disc; }
    .article-body ol { list-style-type: decimal; }
    .article-body li {
      font-size: 1.05rem;
      line-height: 1.85;
      color: #374151;
      margin-bottom: 0.3rem;
    }
    .dark .article-body li { color: #d1d5db; }
    .article-body pre {
      background: rgba(10,37,64,0.04);
      border: 1px solid rgba(10,37,64,0.08);
      border-radius: 0.75rem;
      padding: 1.25rem 1.5rem;
      overflow-x: auto;
      margin: 1.25rem 0;
    }
    .dark .article-body pre {
      background: rgba(255,255,255,0.05);
      border-color: rgba(255,255,255,0.08);
    }
    .article-body pre code {
      font-size: 0.875rem;
      color: #0A2540;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      background: none;
      padding: 0;
      border-radius: 0;
    }
    .dark .article-body pre code { color: #e2e8f0; }
    .article-body code {
      background: rgba(10,37,64,0.06);
      color: #0A2540;
      padding: 0.15rem 0.45rem;
      border-radius: 0.3rem;
      font-size: 0.9rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .dark .article-body code {
      background: rgba(255,255,255,0.1);
      color: #f8fafc;
    }
    .article-body a {
      color: #0A2540;
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-color: rgba(10,37,64,0.3);
    }
    .dark .article-body a {
      color: #f8fafc;
      text-decoration-color: rgba(248,250,252,0.3);
    }
    .article-body blockquote {
      border-left: 3px solid rgba(10,37,64,0.2);
      padding: 0.75rem 1.25rem;
      margin: 1.5rem 0;
      color: #4B5E76;
      font-style: italic;
      line-height: 1.8;
      background: rgba(10,37,64,0.02);
      border-radius: 0 0.5rem 0.5rem 0;
    }
    .dark .article-body blockquote {
      border-color: rgba(255,255,255,0.2);
      color: #a1a1aa;
      background: rgba(255,255,255,0.03);
    }
    .article-body table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.95rem; }
    .article-body th { text-align: left; padding: 0.65rem 0.85rem; font-weight: 600; color: #0A2540; border-bottom: 2px solid rgba(10,37,64,0.1); }
    .dark .article-body th { color: #f8fafc; border-color: rgba(255,255,255,0.1); }
    .article-body td { padding: 0.65rem 0.85rem; color: #374151; border-bottom: 1px solid rgba(10,37,64,0.06); }
    .dark .article-body td { color: #d1d5db; border-color: rgba(255,255,255,0.06); }
  `;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f1115] text-[#0A2540] dark:text-[#f8fafc]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }} />
      <style dangerouslySetInnerHTML={{ __html: articleStyles }} />

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-10 text-sm font-medium text-[#4B5E76] dark:text-[#a1a1aa]">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="hover:text-[#0A2540] dark:hover:text-white transition-colors">Home</Link></li>
            <li><span className="text-[#4B5E76]/40 mx-1">/</span></li>
            <li><Link href="/blog" className="hover:text-[#0A2540] dark:hover:text-white transition-colors">Blog</Link></li>
            <li><span className="text-[#4B5E76]/40 mx-1">/</span></li>
            <li className="text-[#0A2540] dark:text-[#f8fafc] truncate max-w-[200px]" aria-current="page">{article.title}</li>
          </ol>
        </nav>

        {/* Article header */}
        <header className="mb-12 border-b border-[#0A2540]/10 dark:border-white/10 pb-10">
          <h1 className="text-3xl md:text-[2.6rem] font-bold tracking-tight text-[#0A2540] dark:text-[#f8fafc] leading-tight mb-5">
            {article.title}
          </h1>
          <div className="flex items-center gap-3 text-sm font-medium text-[#6B7280] dark:text-[#a1a1aa]">
            <time dateTime={article.date}>
              {new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
            <span className="border-l border-[#0A2540]/20 dark:border-white/20 h-4" />
            <span>By {article.author}</span>
          </div>
        </header>

        {/* Article body */}
        <article
          className="article-body"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Bottom CTA */}
        <div className="mt-16 pt-10 border-t border-[#0A2540]/10 dark:border-white/10">
          <div className="bg-[#0A2540]/[0.03] dark:bg-white/5 rounded-2xl p-8 text-center border border-[#0A2540]/[0.08] dark:border-white/10">
            <h3 className="text-xl font-semibold mb-3 text-[#0A2540] dark:text-[#f8fafc]">Ready to share your resume?</h3>
            <p className="text-[#4B5E76] dark:text-[#a1a1aa] mb-6 text-base">Create a professional resume link in seconds.</p>
            <Link
              href="/"
              className="inline-block rounded-xl bg-[#0A2540] dark:bg-white text-white dark:text-[#0A2540] px-6 py-3 font-semibold transition-transform hover:scale-105 shadow-sm"
            >
              Create Your Free Link
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
