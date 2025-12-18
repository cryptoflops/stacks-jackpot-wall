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
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-12 shadow-2xl shadow-[#5546FF]/10"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5546FF] animate-pulse shadow-[0_0_10px_#5546FF]" />
                    <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em]">Built on Stacks</span>
                </motion.div>

                {/* Hero Title */}
                <h1 className="text-6xl lg:text-[10rem] font-black mb-8 tracking-tighter text-white leading-[0.85]">
                    JACKPOT<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5546FF] via-[#fc6432] to-[#5546FF] animate-gradient-x bg-[length:200%_auto] drop-shadow-[0_0_30px_rgba(85,70,255,0.3)]">
                        WALL
                    </span>
                </h1>

                <p className="max-w-xs lg:max-w-lg text-zinc-400 text-base lg:text-xl mb-12 leading-relaxed font-medium px-4 opacity-80">
                    The decentralized scoreboard where history is etched on-chain. <br className="hidden lg:block" />
                    Post to win, win to rule.
                </p>

                {/* Main CTA */}
                <button
                    onClick={onConnect}
                    className="group relative flex items-center gap-4 px-10 py-5 lg:px-14 lg:py-6 bg-white text-black font-black rounded-[2rem] hover:scale-105 transition-all duration-500 shadow-2xl overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <Wallet className="w-6 h-6 flex-shrink-0" />
                    <span className="whitespace-nowrap tracking-tight text-lg">CONNECT WALLET</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform flex-shrink-0" />

                    {/* Shadow Glow */}
                    <div className="absolute inset-0 rounded-[2rem] bg-white/20 blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* Stats Preview */}
                <div className="mt-16 lg:mt-24 grid grid-cols-3 gap-8 lg:gap-16 text-center w-full max-w-lg">
                    {[
                        { label: 'Entry Fee', value: '0.1 STX' },
                        { label: 'Jackpot', value: '90%' },
                        { label: 'Interval', value: '1/10' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className="group"
                        >
                            <p className="text-zinc-600 text-[9px] lg:text-[10px] font-black uppercase mb-1 tracking-widest group-hover:text-[#5546FF] transition-colors">{stat.label}</p>
                            <p className="text-white font-mono text-base lg:text-2xl font-bold tracking-tight">{stat.value}</p>
                        </motion.div>
                    ))}
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
