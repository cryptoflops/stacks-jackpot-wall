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
            <LiveStats />
            <RecentActivity />
            <Footer />
        </main>
    );
}
