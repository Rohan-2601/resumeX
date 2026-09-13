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
    title: `${article.title} | ResumeX`,
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
    author: {
      '@type': 'Organization',
      name: article.author,
    },
    url: url,
  };

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.resumex.tech/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://www.resumex.tech/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: url,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f1115] text-[#0A2540] dark:text-[#f8fafc]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <nav aria-label="Breadcrumb" className="mb-10 text-sm font-medium text-[#4B5E76] dark:text-[#a1a1aa]">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="hover:text-[#2563eb] dark:hover:text-[#60a5fa] transition-colors">Home</Link>
            </li>
            <li>
              <span className="mx-2 text-[#4B5E76]/50">/</span>
            </li>
            <li>
              <Link href="/blog" className="hover:text-[#2563eb] dark:hover:text-[#60a5fa] transition-colors">Blog</Link>
            </li>
            <li>
              <span className="mx-2 text-[#4B5E76]/50">/</span>
            </li>
            <li className="text-[#0A2540] dark:text-[#f8fafc]" aria-current="page">
              {article.title}
            </li>
          </ol>
        </nav>

        <header className="mb-12 border-b border-[#0A2540]/10 dark:border-white/10 pb-10">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0A2540] dark:text-[#f8fafc] leading-tight mb-6">
            {article.title}
          </h1>
          <div className="flex items-center text-sm font-medium text-[#6B7280] dark:text-[#a1a1aa]">
            <time dateTime={article.date}>
              {new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
            <span className="mx-3 border-l border-[#0A2540]/20 dark:border-white/20 h-4"></span>
            <span>By {article.author}</span>
          </div>
        </header>

        <article className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:text-[#0A2540] dark:prose-headings:text-[#f8fafc] prose-a:text-[#2563eb] dark:prose-a:text-[#60a5fa] prose-p:text-[#4B5E76] dark:prose-p:text-[#a1a1aa] prose-li:text-[#4B5E76] dark:prose-li:text-[#a1a1aa] prose-code:bg-[#0A2540]/5 dark:prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none max-w-none">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </article>
        
        <div className="mt-16 pt-10 border-t border-[#0A2540]/10 dark:border-white/10">
          <div className="bg-[#0A2540]/[0.02] dark:bg-white/5 rounded-2xl p-8 text-center border border-[#0A2540]/[0.08] dark:border-white/10">
            <h3 className="text-xl font-semibold mb-3 text-[#0A2540] dark:text-[#f8fafc]">Ready to share your resume?</h3>
            <p className="text-[#4B5E76] dark:text-[#a1a1aa] mb-6">Join thousands of professionals using our resume link generator.</p>
            <Link href="/" className="inline-block rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-3 font-medium transition-colors shadow-sm">
              Create Your Free Link Now
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
