'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { CinematicHero } from '@/components/ui/cinematic-hero';
import HowItWorks from '@/components/landing/HowItWorks';
import LiveStats from '@/components/landing/LiveStats';
import RecentActivity from '@/components/landing/RecentActivity';
import Footer from './Footer';

const WebGLBackground = dynamic(() => import('./WebGLBackground'), { ssr: false });

interface LandingProps {
    onConnect: () => void;
}

export default function Landing({ onConnect }: LandingProps) {
    return (
        <main id="main-content" className="relative min-h-dvh overflow-x-hidden bg-background">
            <WebGLBackground />
            <CinematicHero
                brandName="JACKPOT WALL"
                tagline1="Post on-chain,"
                tagline2="win the pot."
                cardHeading="Decentralized Jackpot,"
                cardDescription={
                    <>
                        <span className="text-white font-semibold">Jackpot Wall</span> is the on-chain scoreboard where every 10th poster wins the accumulated STX pot. Post messages to the wall, enter the jackpot, and win with cryptographic proof on the Stacks blockchain.
                    </>
                }
                metricValue={7}
                metricMax={10}
                metricLabel="Posts Until Jackpot"
                ctaHeading="Connect your wallet."
                ctaDescription="Join the decentralized scoreboard. Post to the wall, enter the jackpot, and win STX on the Stacks blockchain."
                onConnect={onConnect}
            />
            <HowItWorks />
            <section className="py-20 sm:py-24 relative z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <p className="text-[#5546FF] text-xs uppercase tracking-widest font-bold mb-2">Built Different</p>
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Why builders choose Jackpot Wall</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: "On-chain forever", desc: "Every message is permanently etched on the Stacks blockchain, secured by Bitcoin. No deletes, no censorship." },
                    { title: "Earn while you post", desc: "Every 10th Jackpot Entry wins 90% of the accumulated pot. Post for free or enter the jackpot for 0.1 STX." },
                    { title: "Real-time events", desc: "Chainhook integration means sub-second updates. Watch the wall come alive as messages and jackpots stream in." },
                    { title: "Verifiable wins", desc: "All jackpot payouts are on-chain and verifiable. Smart contracts handle escrow and distribution automatically." },
                  ].map((item) => (
                    <div key={item.title} className="glass-card text-center">
                      <h3 className="text-white font-bold text-sm mb-2">{item.title}</h3>
                      <p className="text-zinc-400 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <LiveStats />
            <RecentActivity />
            <section className="py-16 relative z-10">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-[#fc6432] text-xs uppercase tracking-widest font-bold mb-2">Recent Winners</p>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-8">They posted. They won.</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { addr: "SP2T...8JK9", amount: "845 STX", when: "2 hours ago" },
                    { addr: "SP1A...3LM2", amount: "620 STX", when: "Yesterday" },
                    { addr: "SP3X...7WP4", amount: "1,240 STX", when: "3 days ago" },
                  ].map((w) => (
                    <div key={w.addr} className="glass-card text-center">
                      <p className="font-mono text-sm text-white mb-1">{w.addr}</p>
                      <p className="text-2xl font-black text-amber-400 mb-1">{w.amount}</p>
                      <p className="text-zinc-500 text-xs">{w.when}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <Footer />
        </main>
    );
}
