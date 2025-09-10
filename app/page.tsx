// app/page.tsx
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col relative ">
      <main className="flex-grow bg-white dark:bg-gray-950 relative ">
        <div className="absolute top-6 left-6 ">
          <Link className="flex items-center gap-2 font-semibold" href="#">
            <div className="bg-gray-950 p-1">
              <Image
                src="/logo.png"
                alt="portal studio"
                width={25}
                height={25}
              />
            </div>

            <span className="text-lg font-bold tracking-tighter text-black dark:text-yellow-200 ">
              Portal Studio{" "}
              <span className="text-xs text-black/70 dark:text-white/70">
                v.0.0.1
              </span>
            </span>
          </Link>
        </div>
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
