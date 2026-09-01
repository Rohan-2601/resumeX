import Image from "next/image";
import { Syne, Outfit } from "next/font/google";

const headingFont = Syne({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function PremiumFeatures() {
  const cards = [
    {
      label: "01 / BUILD",
      title: "BUILD IT ONCE.",
      description: "Your resume. Always ready.",
      image: "/card3.png",
      alt: "Workstation - Build",
    },
    {
      label: "02 / PERSONALIZE",
      title: "MAKE IT YOURS.",
      description: "Your story, your style.",
      image: "/card2.png",
      alt: "Neon Workstation - Personalize",
      zoomOut: true,
    },
    {
      label: "03 / STAND OUT",
      title: "NOT ANOTHER PDF.",
      description: "Make your first impression feel like you.",
      image: "/card1.png",
      alt: "Retro TV - Stand Out",
    },
  ];

  return (
    <section
      className={`${bodyFont.className} relative w-full overflow-hidden bg-[#fdfdfd] py-20 text-[#123F5B] md:py-32`}
      id="premium-features"
    >
      <div className="relative mx-auto max-w-[85rem] px-4 sm:px-6 md:px-10">
        <div className="mx-auto mb-16 max-w-3xl text-center md:mb-20">
          <h2 className={`${headingFont.className} text-balance text-3xl font-bold tracking-tight text-[#123F5B] md:text-4xl lg:text-5xl uppercase`}>
            A BETTER WAY TO SHOW UP.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg font-medium text-[#557083] sm:text-xl">
            Built for the way you share your work today...
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
          {cards.map((card) => (
            <div
              key={card.label}
              className="group relative flex flex-col overflow-hidden rounded-none border border-[#E5E7E3] bg-[#FFFFFF] transition-all duration-500 ease-out hover:-translate-y-[4px] h-[500px] sm:h-[540px] lg:h-[640px]"
            >
              {/* Image Area */}
              <div className="relative h-[74%] w-full overflow-hidden bg-[#F7F7F3]">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={`transition-transform duration-500 ease-out ${card.zoomOut ? 'object-fill group-hover:scale-[1.03]' : 'object-cover group-hover:scale-[1.03]'}`}
                />
              </div>

              {/* Text Area */}
              <div className="flex h-[26%] flex-col justify-center px-6 py-4 sm:px-8 sm:py-6">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#557083]">
                  {card.label}
                </p>
                <h3 className={`${headingFont.className} mb-1.5 text-[22px] font-bold tracking-tight text-[#123F5B] sm:text-[24px]`}>
                  {card.title}
                </h3>
                <p className="text-[14px] font-medium text-[#557083] sm:text-[15px]">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
