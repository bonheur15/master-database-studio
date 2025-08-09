// components/landing/FeaturesSection.tsx
"use client"; // Required for framer-motion animations

import { motion } from "framer-motion";
import { ShieldCheck, Database, TerminalSquare, Share2 } from "lucide-react";

const features = [
  {
    icon: <ShieldCheck className="h-8 w-8 text-blue-500" />,
    title: "Secure & Local",
    description:
      "Credentials are AES-encrypted and stored only in your browser. Nothing is ever sent to a server.",
  },
  {
    icon: <Database className="h-8 w-8 text-blue-500" />,
    title: "Universal Connectivity",
    description:
      "Connect to MySQL, PostgreSQL, and MongoDB out-of-the-box, with more databases coming soon.",
  },
  {
    icon: <TerminalSquare className="h-8 w-8 text-blue-500" />,
    title: "Powerful Querying",
    description:
      "A full-featured query console with syntax highlighting and history for both SQL and MongoDB queries.",
  },
  {
    icon: <Share2 className="h-8 w-8 text-blue-500" />,
    title: "Free & Open-Source",
    description:
      "Built for the community, by the community. Completely free to use and self-host, with zero vendor lock-in.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-white py-24 dark:bg-gray-950/50 sm:py-32"
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
            Everything You Need to Manage Data
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            From Browse tables to writing complex queries, Master DB Studio
            streamlines your workflow.
          </p>
        </div>
        <motion.div
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              className="flex flex-col"
              variants={itemVariants}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold leading-7 text-gray-900 dark:text-gray-50">
                {feature.title}
              </h3>
              <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
