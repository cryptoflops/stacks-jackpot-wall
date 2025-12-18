'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Wallet, ArrowRight } from 'lucide-react';
import WebGLBackground from './WebGLBackground';

interface LandingProps {
    onConnect: () => void;
}

export default function Landing({ onConnect }: LandingProps) {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
            <WebGLBackground />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 flex flex-col items-center text-center px-4"
            >
                {/* Brand Badge */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5546FF] animate-pulse" />
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Built on Stacks</span>
                </div>

                {/* Hero Title */}
                <h1 className="text-6xl lg:text-8xl font-black mb-6 tracking-tighter text-white">
                    JACKPOT<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5546FF] via-[#fc6432] to-[#5546FF] animate-gradient-x bg-[length:200%_auto]">
                        WALL
                    </span>
                </h1>

                <p className="max-w-md text-zinc-400 text-lg mb-10 leading-relaxed font-medium">
                    The decentralized scoreboard where history is etched on-chain. Post to win, win to rule.
                </p>

                {/* Main CTA */}
                <button
                    onClick={onConnect}
                    className="group relative flex items-center gap-3 px-10 py-5 bg-white text-black font-black rounded-2xl hover:scale-105 transition-all duration-300"
                >
                    <Wallet className="w-5 h-5" />
                    ENTER THE ARENA
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />

                    {/* Shadow Glow */}
                    <div className="absolute inset-0 rounded-2xl bg-white/40 blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* Stats Preview */}
                <div className="mt-20 grid grid-cols-3 gap-12 text-center">
                    <div>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Entry Fee</p>
                        <p className="text-white font-mono text-xl">0.1 STX</p>
                    </div>
                    <div>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Jackpot</p>
                        <p className="text-white font-mono text-xl">90%</p>
                    </div>
                    <div>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Interval</p>
                        <p className="text-white font-mono text-xl">1/10</p>
                    </div>
                </div>
            </motion.div>

            {/* Scrolling Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20"
            >
                <div className="w-px h-12 bg-gradient-to-b from-white to-transparent mx-auto" />
            </motion.div>
        </div>
    );
}
