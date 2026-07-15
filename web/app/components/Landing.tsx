'use client';

import React from 'react';
import { CinematicHero } from '@/components/ui/cinematic-hero';
import Footer from './Footer';

interface LandingProps {
    onConnect: () => void;
}

export default function Landing({ onConnect }: LandingProps) {
    return (
        <div className="relative min-h-dvh overflow-x-hidden bg-[#060609]">
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
            <div className="mt-auto w-full">
                <Footer />
            </div>
        </div>
    );
}
