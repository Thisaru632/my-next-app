"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
}

export default function ScrollReveal({ 
  children, 
  delay = 0, 
  direction = "up", 
  distance = 50 
}: ScrollRevealProps) {
  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: direction === "left" ? distance : direction === "right" ? -distance : 0,
      y: direction === "up" ? distance : direction === "down" ? -distance : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.165, 0.84, 0.44, 1],
        delay,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={variants}
      className="smooth-animate"
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}
