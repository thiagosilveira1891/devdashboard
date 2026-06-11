import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { OpenSourceSection } from "@/components/landing/open-source-section";
import {
  ComparisonSection,
  CTASection,
  Footer,
} from "@/components/landing/sections";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navbar />
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <OpenSourceSection />
      <ComparisonSection />
      <CTASection />
      <Footer />
    </div>
  );
}
