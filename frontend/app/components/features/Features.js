import { FileTextIcon, LinkIcon, ActivityIcon, HistoryIcon } from "../icons/Icons";

export default function Features() {
  const coreFeatures = [
    {
      Icon: HistoryIcon,
      name: "Infinite Version Control",
      description: "Upload new PDFs without deleting the old ones. Rollback to any previous resume version instantly.",
      href: "/dashboard",
      cta: "Learn more",
      className: "lg:col-span-2 lg:row-span-2",
    },
    {
      Icon: LinkIcon,
      name: "Smart Tracking Links",
      description: "Create custom `/username/slug` URLs tailored to specific employers, locked to precise resume versions.",
      href: "/dashboard",
      cta: "Learn more",
      className: "lg:col-span-1",
    },
    {
      Icon: ActivityIcon,
      name: "Real-time Analytics",
      description: "Know exactly when and where your resume is viewed. Track sources, contacts, and engagement.",
      href: "/dashboard",
      cta: "Learn more",
      className: "lg:col-span-1",
    },
    {
      Icon: FileTextIcon,
      name: "Unified Container",
      description: "Keep all your profiles organized in a single managed container. Stop managing confusing file names.",
      href: "/dashboard",
      cta: "Learn more",
      className: "lg:col-span-2",
    },
  ];

  return (
    <section className="relative w-full py-24 bg-white overflow-hidden" id="features">
      {/* Soft Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 
                      w-[800px] h-[800px] 
                      bg-slate-100/50 
                      blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-slate-950">
            Everything You Need <br />
            <span className="text-slate-500">to Land the Job</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            ResumeX transforms your resume workflow into actionable insights, unlimited versions, and comprehensive tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-3 gap-6 auto-rows-max">
          {coreFeatures.map((feature) => (
            <div
              key={feature.name}
              className={`group rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 transition-all duration-300 hover:border-slate-300 hover:shadow-xl ${feature.className}`}
            >
              {/* Icon */}
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition-all duration-300 group-hover:scale-110">
                <feature.Icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-bold text-slate-950">{feature.name}</h3>
              <p className="mb-6 text-slate-600 leading-relaxed">
                {feature.description}
              </p>

              {/* CTA */}
              <a
                href={feature.href}
                className="inline-flex items-center text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                {feature.cta}
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
