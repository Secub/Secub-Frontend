import CampusMosaic from "../../../components/shared/CampusMosaic";

export default function AccessVisualSection() {
  return (
    <section className="relative hidden min-h-screen overflow-hidden bg-[#f4f4f4] lg:block">
      <div className="absolute inset-0">
        <CampusMosaic
          hideTitles
          overlay={false}
          layout="fill"
          className="h-full w-full"
        />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.72)_28%,rgba(0,0,0,0.48)_52%,rgba(0,0,0,0.18)_72%,rgba(0,0,0,0)_100%)]" />

      <div className="absolute inset-0">
        <div className="absolute left-[4%] top-[15%] h-[180px] w-[130px] rotate-[-8deg] rounded-full bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.7)_0px,rgba(255,255,255,0.7)_2px,transparent_2px,transparent_11px)] opacity-35" />

        <div className="absolute right-[9%] top-[12%] h-[210px] w-[150px] rotate-[8deg] rounded-full bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.7)_0px,rgba(255,255,255,0.7)_2px,transparent_2px,transparent_11px)] opacity-35" />

        <div className="absolute left-[6%] bottom-[14%] h-[150px] w-[140px] rounded-[24px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.92)_0px,rgba(255,255,255,0.92)_2px,transparent_3px)] [background-size:24px_24px] opacity-68" />

        <div className="absolute left-[36%] top-[12%] flex gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <span
              key={`access-top-dot-${index}`}
              className="h-2.5 w-2.5 rounded-full bg-white/90"
            />
          ))}
        </div>

        <div className="absolute right-[8%] bottom-[18%] flex gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={`access-bottom-dot-${index}`}
              className="h-2.5 w-2.5 rounded-full bg-white/90"
            />
          ))}
        </div>

        <div className="absolute left-[23%] top-[44%] h-4 w-4 rounded-full bg-white shadow-[0_0_16px_7px_rgba(255,255,255,0.45)]" />
        <div className="absolute right-[24%] top-[50%] h-4 w-4 rounded-full bg-white shadow-[0_0_16px_7px_rgba(255,255,255,0.45)]" />

        <div className="absolute left-[18%] top-[9%] h-10 w-10 border border-white/35" />
        <div className="absolute right-[18%] bottom-[10%] h-10 w-10 rounded-full border border-white/35" />
        <div className="absolute right-[14%] top-[24%] h-0 w-0 border-b-[28px] border-l-[16px] border-r-[16px] border-b-white/40 border-l-transparent border-r-transparent" />
      </div>
    </section>
  );
}