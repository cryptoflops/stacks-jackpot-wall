'use client';

import React, { useState, useEffect } from 'react';
import { userSession } from '@/lib/stacks';
import Landing from './Landing';
import Jackpot from './Jackpot';
import { useConnect } from '@stacks/connect-react';
import { Zap } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function AppController() {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [view, setView] = useState<'landing' | 'dashboard'>('landing');
    const { doOpenAuth } = useConnect();

    useEffect(() => {
        const signedIn = userSession.isUserSignedIn();
        setIsConnected(signedIn);
        if (signedIn) setView('dashboard');

        // Handle pending sign-in
        if (userSession.isSignInPending()) {
            userSession.handlePendingSignIn().then(() => {
                setIsConnected(true);
                setView('dashboard');
            });
        }
    }, []);

    const handleConnect = () => {
        if (isConnected) {
            setView('dashboard');
        } else {
            doOpenAuth();
        }
    };

    if (isConnected === null) {
        return (
            <main className="min-h-dvh bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5546FF] to-[#fc6432] flex items-center justify-center shadow-lg shadow-[#5546FF]/20 animate-pulse">
                        <Zap className="w-6 h-6 text-white fill-current" />
                    </div>
                    <p className="text-zinc-500 text-sm font-medium">Loading Jackpot Wall...</p>
                </div>
            </main>
        );
    }

    return (isConnected && view === 'dashboard') ? (
        <div className="min-h-dvh py-8 lg:py-12 relative overflow-hidden">
            {/* Background for Dashboard (Subtle variant) */}
            <div className="fixed inset-0 -z-10 bg-background opacity-40" />
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            <Jackpot onBackToLanding={() => setView('landing')} />
        </div>
    ) : (
        <>
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            <Landing onConnect={handleConnect} />
        </>
    );
}
