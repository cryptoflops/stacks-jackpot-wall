'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Wallet, ArrowRight, ShieldCheck, Cpu, Globe } from 'lucide-react';
import WebGLBackground from './WebGLBackground';

interface LandingProps {
    onConnect: () => void;
}

export default function Landing({ onConnect }: LandingProps) {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden selection:bg-[#5546FF]/30">
            <WebGLBackground />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-6xl"
            >
                {/* Brand Badge */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-12 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-tr from-[#5546FF] to-[#fc6432] animate-pulse shadow-[0_0_10px_rgba(85,70,255,0.5)]" />
                    <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em]">Network Live • Stacks Mainnet</span>
                </motion.div>

                {/* Hero Title */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative mb-8"
                >
                    <h1 className="text-6xl lg:text-[10rem] font-black leading-[0.8] tracking-tighter text-white select-none">
                        JACKPOT<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5546FF] via-[#fc6432] to-[#5546FF] animate-gradient-xl bg-[length:300%_auto]">
                            WALL
                        </span>
                    </h1>
                    {/* Floating accents */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#5546FF]/20 blur-[80px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#fc6432]/10 blur-[80px] rounded-full pointer-events-none" />
                </motion.div>

                <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="max-w-lg text-zinc-400 text-lg lg:text-xl mb-12 leading-relaxed font-medium px-4 tracking-tight"
                >
                    The immutable scoreboard for the Stacks ecosystem. <br className="hidden lg:block" />
                    <span className="text-zinc-500">Every 10th poster claims the decentralized jackpot.</span>
                </motion.p>

                {/* Main CTA Container */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col items-center gap-8 w-full"
                >
                    <button
                        onClick={onConnect}
                        className="group relative flex items-center gap-4 px-10 py-5 lg:px-14 lg:py-6 bg-white text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-hidden"
                    >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        <Wallet className="w-6 h-6 flex-shrink-0" />
                        <span className="text-lg lg:text-xl tracking-tighter">ESTABLISH CONNECTION</span>
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform flex-shrink-0" />

                        {/* Outer Glow */}
                        <div className="absolute inset-0 rounded-2xl bg-white/50 blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </button>

                    {/* Quality Badges */}
                    <div className="flex flex-wrap justify-center gap-6 lg:gap-10 opacity-40 hover:opacity-100 transition-opacity duration-700">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Audited Clarity</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-[#5546FF]" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Hiro Chainhooks</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-[#fc6432]" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">100% On-Chain</span>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Preview */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 lg:mt-24 grid grid-cols-3 gap-8 lg:gap-20 text-center glass-card !bg-white/[0.02] border border-white/5 p-8 lg:p-12"
                >
                    <div className="relative">
                        <p className="text-zinc-500 text-[10px] lg:text-xs font-black uppercase mb-2 tracking-[0.2em]">Post Fee</p>
                        <p className="text-white font-mono text-xl lg:text-3xl font-black">0.1<span className="text-[#5546FF] ml-1 text-sm lg:text-base">STX</span></p>
                    </div>
                    <div className="relative border-x border-white/5 px-8 lg:px-20">
                        <p className="text-zinc-500 text-[10px] lg:text-xs font-black uppercase mb-2 tracking-[0.2em]">Jackpot</p>
                        <p className="text-white font-mono text-xl lg:text-3xl font-black">90<span className="text-[#fc6432] ml-1 text-sm lg:text-base">%</span></p>
                    </div>
                    <div className="relative">
                        <p className="text-zinc-500 text-[10px] lg:text-xs font-black uppercase mb-2 tracking-[0.2em]">Win Ratio</p>
                        <p className="text-white font-mono text-xl lg:text-3xl font-black">1<span className="text-zinc-600 mx-1">:</span>10</p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Scrolling Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
            >
                <span className="text-[9px] font-bold text-white/10 uppercase tracking-[0.5em] vertical-text">Scroll to explore</span>
                <motion.div
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-[2px] h-16 bg-gradient-to-b from-[#5546FF] to-transparent"
                />
            </motion.div>
        </div>
    );
}
