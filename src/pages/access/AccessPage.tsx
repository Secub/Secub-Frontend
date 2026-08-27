import CampusMosaic from "../../components/shared/CampusMosaic";
import AccessPanelSection from "./sections/AccessPanelSection";

export default function AccessPage() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div className="absolute -inset-5 -z-20 scale-105 blur-[5px]" aria-hidden="true">
        <CampusMosaic hideTitles layout="fill" className="h-full w-full" />
      </div>
      <div className="absolute inset-0 -z-10 bg-black/65" />

      <AccessPanelSection />
    </main>
  );
}
