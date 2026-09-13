import Link from 'next/link';
import { blogArticles } from '../../data/blogData';

export const metadata = {
  title: 'Blog | ResumeX - Resume Link Generator',
  description: 'Read the latest tips on how to create a resume link, share your resume online, and send your resume to recruiters efficiently.',
  openGraph: {
    title: 'Blog | ResumeX - Resume Link Generator',
    description: 'Read the latest tips on how to create a resume link, share your resume online, and send your resume to recruiters efficiently.',
    url: 'https://www.resumex.tech/blog',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.resumex.tech/blog',
  },
};

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f1115] text-[#0A2540] dark:text-[#f8fafc]">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <header className="mb-16">
          <div className="mb-4 text-sm font-medium uppercase tracking-widest text-[#6B7280] dark:text-[#a1a1aa] flex items-center gap-2">
            <span className="h-px w-6 bg-[#0A2540]/10 dark:bg-white/10"></span>
            ResumeX Blog
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#0A2540] dark:text-[#f8fafc]">
            Career & Resume Tips
          </h1>
          <p className="mt-4 text-lg text-[#4B5E76] dark:text-[#a1a1aa]">
            Insights on how to effectively use a resume link generator and stand out to recruiters.
          </p>
        </header>

        <div className="space-y-12">
          {blogArticles.map((article) => (
            <article key={article.slug} className="group relative flex flex-col items-start overflow-hidden rounded-2xl border border-[#0A2540]/[0.08] dark:border-white/10 bg-white dark:bg-white/5 p-8 transition-all hover:border-[#0A2540]/20 dark:hover:border-white/20 hover:bg-[#0A2540]/[0.01] dark:hover:bg-white/10">
              <Link href={`/blog/${article.slug}`} className="absolute inset-0 z-10">
                <span className="sr-only">Read {article.title}</span>
              </Link>
              <div className="text-sm font-medium text-[#4B5E76] dark:text-[#a1a1aa] mb-3">
                {new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#0A2540] dark:text-[#f8fafc] mb-3 group-hover:text-[#0A2540]/70 dark:group-hover:text-white/70 transition-colors">
                {article.title}
              </h2>
              <p className="text-[#4B5E76] dark:text-[#a1a1aa] leading-relaxed">
                {article.description}
              </p>
              <div className="mt-6 font-medium text-[#0A2540]/60 dark:text-[#f8fafc]/60 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Read article <span aria-hidden="true">&rarr;</span>
              </div>
            </article>
          ))}
        </div>
        
        <div className="mt-16 pt-8 border-t border-[#0A2540]/10 dark:border-white/10 text-center">
          <Link href="/" className="blog-btn inline-block rounded-xl bg-[#0A2540] dark:bg-white px-6 py-3 font-medium transition-transform hover:scale-105">
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
