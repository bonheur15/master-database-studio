// components/landing/HeroSection.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";

export function HeroSection() {
  return (
    <section className="container mx-auto flex h-[calc(100vh-10rem)] md:h-[calc(100vh-20rem)] max-w-5xl flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50 ">
          The Modern Database Studio.
          <br />
          <span className=" text-4xl bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
            Simple, Secure, and Open-Source.
          </span>
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300"
      >
        Connect, query, and manage any database with one sleek tool. Your
        credentials are encrypted and stored locally.{" "}
        <b>No servers, no tracking, completely free.</b>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-10 flex items-center justify-center gap-x-6 "
      >
        <Button asChild size="lg" className="shadow-xl shadow-black/30">
          <Link href="/studio">
            Launch Studio <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="lg"
          className="shadow-xl shadow-black/30"
        >
          <a
            href="https://github.com/bonheur15/master-database-studio"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="mr-2 h-5 w-5" />
            View on GitHub
          </a>
        </Button>
      </motion.div>
    </section>
  );
}
