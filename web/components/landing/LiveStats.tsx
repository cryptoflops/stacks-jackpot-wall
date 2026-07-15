'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Trophy, MessageSquare, Coins, Users } from 'lucide-react';

const stats = [
  {
    label: 'Total STX Paid Out',
    value: '12,450',
    icon: Trophy,
    accent: 'from-[#5546FF] to-[#7B6FFF]',
    iconBg: 'bg-[#5546FF]/10 border-[#5546FF]/20 text-[#5546FF]',
  },
  {
    label: 'Total Wall Posts',
    value: '8,392',
    icon: MessageSquare,
    accent: 'from-[#fc6432] to-[#ff8a5c]',
    iconBg: 'bg-[#fc6432]/10 border-[#fc6432]/20 text-[#fc6432]',
  },
  {
    label: 'Current Pot',
    value: '845.20',
    icon: Coins,
    accent: 'from-amber-400 to-yellow-300',
    iconBg: 'bg-amber-400/10 border-amber-400/20 text-amber-400',
  },
  {
    label: 'Recent Winners',
    value: '842',
    icon: Users,
    accent: 'from-emerald-400 to-green-300',
    iconBg: 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function LiveStats() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      id="stats"
      className="relative w-full py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 z-10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 md:mb-18"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#5546FF] mb-4 block">
            Live Stats
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Jackpot Wall
            <br />
            <span className="bg-gradient-to-r from-[#5546FF] to-[#fc6432] bg-clip-text text-transparent">
              by the numbers
            </span>
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={cardVariants}
                className="glass-card group relative overflow-hidden !bg-white/[0.03] border border-white/[0.06] hover:border-[#5546FF]/20 transition-all duration-500 p-6 sm:p-8 flex flex-col items-center text-center gap-4"
              >
                {/* Accent gradient line at top */}
                <div
                  className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${stat.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center border shrink-0 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Value */}
                <div className="flex flex-col gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-xs sm:text-sm text-zinc-400 font-medium">
                    {stat.label}
                  </span>
                </div>

                {/* Bottom gradient accent on hover */}
                <div
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r ${stat.accent} rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500`}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
