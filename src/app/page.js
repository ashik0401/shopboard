"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full h-[400px] flex flex-col items-center justify-center ">
      <motion.h1
        className="text-5xl md:text-6xl font-bold text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <span className="text-red-600">Elevate</span>{" "}
        <span className="dark:text-white">Your Business</span>{" "}
        <span className="text-red-600">to New Heights</span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <Link href='/dashboard/products'>
        <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg transform transition-transform duration-300 hover:scale-105 cursor-pointer">
          Get Started
        </Button>
        </Link>
      </motion.div>
    </div>
  );
}
