'use client';

import React, { useState, useEffect } from 'react';
import { userSession } from '@/lib/stacks';
import Landing from './Landing';
import Jackpot from './Jackpot';
import { useConnect } from '@stacks/connect-react';

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

    if (isConnected === null) return null; // Loading state

    return (isConnected && view === 'dashboard') ? (
        <div className="min-h-screen py-8 lg:py-12 relative overflow-hidden">
            {/* Background for Dashboard (Subtle variant) */}
            <div className="fixed inset-0 -z-10 bg-[#020108] opacity-40" />
            <Jackpot onBackToLanding={() => setView('landing')} />
        </div>
    ) : (
        <Landing onConnect={handleConnect} />
    );
}
