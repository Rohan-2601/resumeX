import { Syne, Outfit } from "next/font/google";
import SiteHeader from "../components/navbar/SiteHeader";
import Footer from "../components/footer/Footer";

const headingFont = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const bodyFont = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Contact ResumeX",
  description: "Have a question, found a bug, or have feedback about ResumeX? Get in touch directly.",
};

export default function ContactPage() {
  return (
    <div className={`min-h-[100dvh] flex flex-col bg-[#fdfdfd] text-slate-900 ${bodyFont.className}`}>
      <SiteHeader />
      
      <main className="flex-1 mx-auto w-full max-w-4xl px-6 md:px-12 py-16 md:py-24">
        <div className="space-y-12">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-slate-500">
              Get in touch
            </p>
            <h1 className={`${headingFont.className} text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-slate-900`}>
              Contact
            </h1>
          </div>
          
          <div className="text-base md:text-lg leading-8 text-slate-600 font-medium max-w-2xl">
            <p>
              Have a question, found a bug, or have an idea for ResumeX?
            </p>
            <p className="mt-2">
              You can reach me directly and I'll get back to you.
            </p>
          </div>
          
          <div className="max-w-md">
            <p className="text-sm font-semibold text-slate-500 mb-2">Email me directly at</p>
            <p className={`${headingFont.className} text-lg font-medium text-slate-800 mb-6 break-all`}>
              rjha09307@gmail.com
            </p>
            
            <a
              href="mailto:rjha09307@gmail.com"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:text-white hover:shadow-md"
            >
              Email me
            </a>
          </div>

          <div className="mt-16 pt-8 border-t border-black/10">
             <p className="text-sm font-semibold text-slate-900 mb-6 tracking-wide">Connect on Socials</p>
             <div className="flex flex-wrap gap-6">
               <a href="https://x.com/rjha72" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-full after:origin-center after:scale-x-0 after:bg-slate-900 after:transition-transform after:duration-300 hover:after:scale-x-100">
                 Twitter
               </a>
               <a href="https://github.com/Rohan-2601/resumeX" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-full after:origin-center after:scale-x-0 after:bg-slate-900 after:transition-transform after:duration-300 hover:after:scale-x-100">
                 GitHub
               </a>
               <a href="https://www.linkedin.com/in/rohan-raj-5b5198294/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-full after:origin-center after:scale-x-0 after:bg-slate-900 after:transition-transform after:duration-300 hover:after:scale-x-100">
                 LinkedIn
               </a>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
