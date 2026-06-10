import LandingHeader from "./sections/LandingHeaderSection";
import HeroSection from "./sections/HeroSection";
import AboutSection from "./sections/AboutSection";
import ModulesSection from "./sections/ModulesSection";
import BenefitsSection from "./sections/BenefitsSection";
import ContactSection from "./sections/ContactSection";

import LandingFooterSection from "./sections/LandingFooterSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--secub-bg)] text-[var(--secub-text)]">
      <LandingHeader />

      <main>
        <HeroSection />
        <AboutSection />
        <ModulesSection />
        <BenefitsSection />
        <ContactSection />
       
        <LandingFooterSection />
      </main>
    </div>
  );
}