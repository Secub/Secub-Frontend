import CampusMosaic from "../../components/shared/CampusMosaic";
import AccessPanelSection from "./sections/AccessPanelSection";

export default function AccessPage() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div className="absolute -inset-5 -z-20 scale-105 blur-[5px]" aria-hidden="true">
        <CampusMosaic hideTitles layout="fill" className="h-full w-full" />
      </div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(14,28,48,0.76),rgba(14,101,217,0.42),rgba(15,25,43,0.78))]" />

      <AccessPanelSection />
    </main>
  );
}
