import LandingHeader from "./sections/LandingHeaderSection";
import HeroSection from "./sections/HeroSection";
import AboutSection from "./sections/AboutSection";
import ModulesSection from "./sections/ModulesSection";
import BenefitsSection from "./sections/BenefitsSection";
import ContactSection from "./sections/ContactSection";
import AccessibilitySection from "./sections/AccessibilitySection";
import LandingFooterSection from "./sections/LandingFooterSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-gray-1)]">
      <LandingHeader />

      <main>
        <HeroSection />
        <AboutSection />
        <ModulesSection />
        <BenefitsSection />
        <ContactSection />
        <AccessibilitySection />
        <LandingFooterSection />
      </main>
    </div>
  );
}