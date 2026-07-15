'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MessageSquare, TrendingUp, Trophy } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: MessageSquare,
    title: 'Post to the Wall',
    description:
      'Share your message on-chain. Choose Free Post (0 STX) or Jackpot Entry (0.1 STX).',
    accent: 'from-[#5546FF] to-[#7B6FFF]',
    iconBg: 'bg-[#5546FF]/10 border-[#5546FF]/20 text-[#5546FF]',
  },
  {
    number: '02',
    icon: TrendingUp,
    title: 'Watch the Pot Grow',
    description:
      'Every Jackpot Entry adds 0.1 STX to the cumulative pot. Track it live.',
    accent: 'from-[#fc6432] to-[#ff8a5c]',
    iconBg: 'bg-[#fc6432]/10 border-[#fc6432]/20 text-[#fc6432]',
  },
  {
    number: '03',
    icon: Trophy,
    title: 'Win the Jackpot',
    description:
      'Every 10th poster wins 90% of the accumulated pot. Instant on-chain payout.',
    accent: 'from-amber-400 to-yellow-300',
    iconBg: 'bg-amber-400/10 border-amber-400/20 text-amber-400',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      className="relative w-full py-24 md:py-32 px-4 sm:px-6 lg:px-8 z-10"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#5546FF] mb-4 block">
            How It Works
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Three steps to
            <br />
            <span className="bg-gradient-to-r from-[#5546FF] to-[#fc6432] bg-clip-text text-transparent">
              on-chain fortune
            </span>
          </h2>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={cardVariants}
                className="glass-card group relative overflow-hidden !bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-8 md:p-10 flex flex-col gap-6 hover:border-[#5546FF]/20 transition-all duration-500"
              >
                {/* Accent gradient line at top */}
                <div
                  className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${step.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* Large step number */}
                <div className="flex items-start justify-between">
                  <span className="text-6xl md:text-7xl font-black text-white/5 leading-none select-none">
                    {step.number}
                  </span>
                  <div
                    className={`w-12 h-12 rounded-2xl ${step.iconBg} flex items-center justify-center border shrink-0 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Bottom gradient accent on hover */}
                <div
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r ${step.accent} rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500`}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
