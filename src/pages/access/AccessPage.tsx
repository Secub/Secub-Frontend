import AccessPanelSection from "./sections/AccessPanelSection";
import AccessVisualSection from "./sections/AccessVisualSection";

export default function AccessPage() {
  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <div className="mx-auto min-h-screen max-w-[1600px] lg:grid lg:grid-cols-[520px_minmax(0,1fr)] xl:grid-cols-[560px_minmax(0,1fr)]">
        <AccessPanelSection />
        <AccessVisualSection />
      </div>
    </div>
  );
}