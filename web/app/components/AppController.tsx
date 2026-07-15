'use client';

import React, { useState, useEffect } from 'react';
import { userSession } from '@/lib/stacks';
import Landing from './Landing';
import Jackpot from './Jackpot';
import { useConnect } from '@stacks/connect-react';

export default function AppController() {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [view, setView] = useState<'landing' | 'dashboard'>('landing');
    const { doOpenAuth } = useConnect();

    useEffect(() => {
        const signedIn = userSession.isUserSignedIn();
        setIsConnected(signedIn);
        if (signedIn) setView('dashboard');

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

    // Show dashboard if connected, landing page otherwise
    // Static export always shows landing by default
    if (isConnected && view === 'dashboard') {
        return (
            <div className="min-h-dvh py-8 lg:py-12 relative overflow-hidden">
                <div className="fixed inset-0 -z-10 bg-background opacity-40" />
                <Jackpot onBackToLanding={() => setView('landing')} />
            </div>
        );
    }

    return (
        <>
            <Landing onConnect={handleConnect} />
        </>
    );
}
