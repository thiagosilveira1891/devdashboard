import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { OpenSourceSection } from "@/components/landing/open-source-section";
import { ProfilesSection } from "@/components/landing/profiles-section";
import {
  ComparisonSection,
  CTASection,
  Footer,
} from "@/components/landing/sections";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] selection:bg-[#6366F1]/40">
      <Navbar />
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <OpenSourceSection />
      <ProfilesSection />
      <ComparisonSection />
      <CTASection />
      <Footer />
    </div>
  );
}
