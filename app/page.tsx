// app/page.tsx
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col ">
      <main className="flex-grow bg-white dark:bg-gray-950 ">
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
