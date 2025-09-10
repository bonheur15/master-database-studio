// "use client";

// import { motion } from "framer-motion";
// import { ShieldCheck, Database, TerminalSquare, Share2 } from "lucide-react";

// const features = [
//   {
//     icon: <ShieldCheck className="h-8 w-8 text-blue-500" />,
//     title: "Secure & Local",
//     description:
//       "Credentials are AES-encrypted and stored only in your browser. Nothing is ever sent to a server.",
//   },
//   {
//     icon: <Database className="h-8 w-8 text-blue-500" />,
//     title: "Universal Connectivity",
//     description:
//       "Connect to MySQL, PostgreSQL, and MongoDB out-of-the-box, with more databases coming soon.",
//   },
//   {
//     icon: <TerminalSquare className="h-8 w-8 text-blue-500" />,
//     title: "Powerful Querying",
//     description:
//       "A full-featured query console with syntax highlighting and history for both SQL and MongoDB queries.",
//   },
//   {
//     icon: <Share2 className="h-8 w-8 text-blue-500" />,
//     title: "Free & Open-Source",
//     description:
//       "Built for the community, by the community. Completely free to use and self-host, with zero vendor lock-in.",
//   },
// ];

// const containerVariants = {
//   hidden: {},
//   visible: {
//     transition: {
//       staggerChildren: 0.2,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.5 },
//   },
// };

// export function FeaturesSection() {
//   return (
//     <section
//       id="features"
//       className="bg-white py-12 dark:bg-gray-950/50 md:py-0 md:mb-20"
//     >
//       <div className="container mx-auto max-w-6xl px-4">
//         <div className="mx-auto max-w-2xl text-center">
//           <h2 className=" font-bold tracking-tight text-gray-900 dark:text-gray-50 text-4xl">
//             Everything You Need to Manage Data
//           </h2>

//           <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
//             From Browse tables to writing complex queries, Master DB Studio
//             streamlines your workflow.
//           </p>
//         </div>
//         <motion.div
//           className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4"
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true, amount: 0.3 }}
//           variants={containerVariants}
//         >
//           {features.map((feature) => (
//             <motion.div
//               key={feature.title}
//               className="flex flex-col"
//               variants={itemVariants}
//             >
//               <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
//                 {feature.icon}
//               </div>
//               <h3 className="text-lg font-semibold leading-7 text-gray-900 dark:text-gray-50">
//                 {feature.title}
//               </h3>
//               <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
//                 {feature.description}
//               </p>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// }

"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Database, TerminalSquare, Share2 } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Secure & Local",
    description:
      "Credentials are AES-encrypted and stored only in your browser. Nothing is ever sent to a server.",
  },
  {
    icon: Database,
    title: "Universal Connectivity",
    description:
      "Connect to MySQL, PostgreSQL, and MongoDB out-of-the-box, with more databases coming soon.",
  },
  {
    icon: TerminalSquare,
    title: "Powerful Querying",
    description:
      "A full-featured query console with syntax highlighting and history for both SQL and MongoDB queries.",
  },
  {
    icon: Share2,
    title: "Free & Open-Source",
    description:
      "Built for the community, by the community. Completely free to use and self-host, with zero vendor lock-in.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-10">
      <div className="container mx-auto max-w-6xl px-6">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
            Everything You Need to Manage Data
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            From browsing tables to writing complex queries, Portal Studio
            streamlines your workflow.
          </p>
        </div>

        {/* Features Grid */}
        <motion.div
          className="mx-auto mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="flex flex-col items-start"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
