'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Clock } from 'lucide-react';

const posts = [
  {
    message: 'gm frens ☀️',
    address: 'SP2T6Z0HXEJK9',
    time: '2 min ago',
    type: 'Free',
  },
  {
    message: 'Stacks is the future of Bitcoin L2s',
    address: 'SP1A2B3C3LM2',
    time: '5 min ago',
    type: 'Jackpot',
  },
  {
    message: 'just shipped my first Clarity contract 🚀',
    address: 'SP3X4Y5Z7WP4',
    time: '12 min ago',
    type: 'Free',
  },
  {
    message: 'gm gm gm',
    address: 'SP1T8U9VR5K',
    time: '18 min ago',
    type: 'Free',
  },
  {
    message: 'bullish on builders',
    address: 'SP2M3N4O9QR1',
    time: '25 min ago',
    type: 'Jackpot',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function RecentActivity() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      id="activity"
      className="relative w-full py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 z-10"
    >
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 md:mb-18"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#5546FF] mb-4 block">
            Recent Activity
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Latest wall
            <br />
            <span className="bg-gradient-to-r from-[#5546FF] to-[#fc6432] bg-clip-text text-transparent">
              messages
            </span>
          </h2>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="space-y-3"
        >
          {posts.map((post, index) => (
            <motion.div
              key={index}
              variants={rowVariants}
              className="glass-card group relative overflow-hidden !bg-white/[0.03] border border-white/[0.06] hover:border-[#5546FF]/20 transition-all duration-300 p-4 sm:p-5"
            >
              {/* Left accent bar on hover */}
              <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-[#5546FF] to-[#fc6432] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="flex items-center gap-3 sm:gap-4">
                {/* Type badge */}
                <span
                  className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                    post.type === 'Jackpot'
                      ? 'bg-[#5546FF]/10 border-[#5546FF]/20 text-[#5546FF]'
                      : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400'
                  }`}
                >
                  {post.type}
                </span>

                {/* Message */}
                <p className="flex-1 text-sm sm:text-base text-white/90 font-medium truncate">
                  {post.message}
                </p>

                {/* Address + Time */}
                <div className="shrink-0 flex flex-col items-end gap-0.5">
                  <span className="font-mono text-[11px] sm:text-xs text-zinc-500 tracking-tight">
                    {post.address}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                    <Clock className="w-3 h-3" />
                    {post.time}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-8 text-xs text-zinc-600"
        >
          Connect your wallet to see the full activity feed in real-time.
        </motion.p>
      </div>
    </section>
  );
}
