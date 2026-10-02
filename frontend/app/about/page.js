import { Syne, Outfit } from "next/font/google";
import SiteHeader from "../components/navbar/SiteHeader";
import Footer from "../components/footer/Footer";
import Link from "next/link";

const headingFont = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const bodyFont = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "About ResumeX",
  description: "Learn why ResumeX was built and how it makes sharing and updating your resume easier.",
};

export default function AboutPage() {
  return (
    <div className={`min-h-[100dvh] flex flex-col bg-[#fdfdfd] text-slate-900 ${bodyFont.className}`}>
      <SiteHeader />
      
      <main className="flex-1 mx-auto max-w-4xl px-6 md:px-12 py-16 md:py-24 w-full">
        <div className="space-y-8">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-slate-500">
              The Story
            </p>
            <h1 className={`${headingFont.className} text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-slate-900`}>
              About ResumeX
            </h1>
          </div>
          
          <div className="space-y-6 text-base md:text-lg leading-8 text-slate-600 font-medium max-w-2xl">
            <p>
              ResumeX started with a simple problem — every time I updated my resume, I had to send the new PDF again to everyone I'd already shared it with.
            </p>
            <p>
              So I built ResumeX to make that easier.
            </p>
            <p>
              With ResumeX, you can create one resume link, share it anywhere, and update your resume whenever you want without changing the link. Previous versions are also kept, so you can go back to an older version whenever you need it.
            </p>
            <p>
              I'm building ResumeX as an independent developer and continuously improving it based on feedback from people using it.
            </p>
            <p className="font-semibold text-slate-900 text-xl mt-8">
              One resume link. Always updated.
            </p>
          </div>
          
          <div className="mt-16 pt-8 flex flex-col items-start gap-6">
            <Link
              href="/register"
              className="inline-flex items-center gap-3 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:text-white hover:shadow-md"
            >
              Create your resume link
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
