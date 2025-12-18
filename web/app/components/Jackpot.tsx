'use client';

import { useState, useEffect } from 'react';
import { useConnect } from '@stacks/connect-react';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { openContractCall } from '@stacks/connect';
import { uintCV, stringUtf8CV, cvToJSON, fetchCallReadOnlyFunction } from '@stacks/transactions';
import { userSession } from '@/lib/stacks';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    MessageSquare,
    Wallet,
    Zap,
    History,
    RefreshCw,
    LogOut,
    ChevronRight,
    TrendingUp,
    CircleDot,
    Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Jackpot() {
    const { doOpenAuth } = useConnect();
    const [message, setMessage] = useState('');
    const [events, setEvents] = useState<any[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [potBalance, setPotBalance] = useState<number>(0);
    const [postCount, setPostCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'board' | 'history'>('board');

    // Multi-Network Configuration
    const IS_MAINNET = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';
    const CURRENT_NETWORK = IS_MAINNET ? STACKS_MAINNET : STACKS_TESTNET;
    const CONTRACT_ADDRESS = IS_MAINNET
        ? (process.env.NEXT_PUBLIC_MAINNET_CONTRACT || 'SP1TN1ERKXEM2H9TKKWGPGZVNVNEKS92M7MAMP23P')
        : (process.env.NEXT_PUBLIC_TESTNET_CONTRACT || 'ST1TN1ERKXEM2H9TKKWGPGZVNVNEKS92M7MAMP23P');
    const CONTRACT_NAME = 'jackpot-wall';

    // Robust Read-Only Helper using fetch (Bypasses SDK import issues)
    const callContractReadOnly = async (functionName: string, args: any[] = []) => {
        try {
            const res = await fetchCallReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName,
                functionArgs: args,
                network: CURRENT_NETWORK,
                senderAddress: CONTRACT_ADDRESS,
            });
            // Try to handle potential SDK import issues by double checking if callReadOnlyFunction exists
            return res;
        } catch (e) {
            console.error(`Read-only call to ${functionName} failed:`, e);
            throw e;
        }
    };

    const refreshData = async () => {
        setIsLoading(true);
        console.log('🔄 Syncing on-chain data...', { network: IS_MAINNET ? 'mainnet' : 'testnet', contract: CONTRACT_ADDRESS });
        try {
            const network = CURRENT_NETWORK;

            // 1. Fetch Pot Balance
            const potRes = await fetchCallReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-pot-balance',
                functionArgs: [],
                network,
                senderAddress: CONTRACT_ADDRESS,
            });
            const potVal = Number(cvToJSON(potRes).value);
            console.log('💰 Pot Balance:', potVal);
            setPotBalance(potVal);

            // 2. Fetch Counter
            const idRes = await fetchCallReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-counter',
                functionArgs: [],
                network,
                senderAddress: CONTRACT_ADDRESS,
            });
            const countVal = Number(cvToJSON(idRes).value);
            console.log('📊 Post Count:', countVal);
            setPostCount(countVal);

            const signedIn = userSession.isUserSignedIn();
            setIsConnected(signedIn);
            if (signedIn) {
                console.log('👤 User connected:', getUserAddress());
            }
            return countVal;
        } catch (e) {
            console.error('❌ Data sync failed. Double-check your CONTRACT_ADDRESS and NETWORK settings:', e);
            return 0;
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEvents = async (currentCounter: number) => {
        try {
            console.log('📡 Fetching events...', { currentCounter });
            // Priority 1: Chainhook Events (API)
            const res = await fetch('/api/events');
            const json = await res.json();
            let allEvents = json.events || [];

            // Priority 2: Direct Chain Fallback (Always fetch if API is empty or for redundancy)
            if (allEvents.length === 0 && currentCounter > 0) {
                console.log('⚠️ No API events. Falling back to direct chain fetch...');
                const fallbackPosts = [];
                const limit = Math.min(currentCounter, 10); // Fetch more for fallback
                for (let i = 0; i < limit; i++) {
                    const postId = currentCounter - i;
                    if (postId <= 0) break;
                    try {
                        const postRes = await fetchCallReadOnlyFunction({
                            contractAddress: CONTRACT_ADDRESS,
                            contractName: CONTRACT_NAME,
                            functionName: 'get-post',
                            functionArgs: [uintCV(postId)],
                            network: CURRENT_NETWORK,
                            senderAddress: CONTRACT_ADDRESS,
                        });
                        const postData = cvToJSON(postRes).value;
                        if (postData) {
                            fallbackPosts.push({
                                id: `chain-${postId}`,
                                type: 'new-post',
                                data: {
                                    id: postId,
                                    poster: postData.poster.value,
                                    message: postData.message.value
                                },
                                timestamp: Date.now() - (i * 60000)
                            });
                        }
                    } catch (err) {
                        console.warn(`Failed to fetch post #${postId}:`, err);
                    }
                }
                allEvents = fallbackPosts;
            }
            console.log('✅ Events loaded:', allEvents.length);
            setEvents(allEvents);
        } catch (e) {
            console.error('❌ Event fetch failed:', e);
        }
    };

    useEffect(() => {
        const init = async () => {
            if (typeof window === 'undefined') return;
            try {
                if (userSession.isSignInPending()) {
                    await userSession.handlePendingSignIn();
                    setIsConnected(true);
                    window.history.replaceState({}, document.title, "/");
                } else {
                    setIsConnected(userSession.isUserSignedIn());
                }
                const currentCount = await refreshData();
                await fetchEvents(currentCount); // Pass currentCount
            } catch (e) { console.error(e); }
        };
        init();

        const interval = setInterval(async () => {
            try {
                const network = CURRENT_NETWORK;
                const potRes = await fetchCallReadOnlyFunction({
                    contractAddress: CONTRACT_ADDRESS,
                    contractName: CONTRACT_NAME,
                    functionName: 'get-pot-balance',
                    functionArgs: [],
                    network,
                    senderAddress: CONTRACT_ADDRESS,
                });
                setPotBalance(Number(cvToJSON(potRes).value));

                // Also update counter and events periodically
                const idRes = await fetchCallReadOnlyFunction({
                    contractAddress: CONTRACT_ADDRESS,
                    contractName: CONTRACT_NAME,
                    functionName: 'get-counter',
                    functionArgs: [],
                    network,
                    senderAddress: CONTRACT_ADDRESS,
                });
                const count = Number(cvToJSON(idRes).value);
                setPostCount(count);
                await fetchEvents(count);
            } catch (e) {
                console.error("Interval update failed:", e);
            }
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const handlePost = async () => {
        if (!message) return;
        setIsLoading(true);

        const options = {
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'post-message',
            functionArgs: [stringUtf8CV(message)],
            network: CURRENT_NETWORK,
            appDetails: {
                name: 'Jackpot Wall',
                icon: window.location.origin + '/favicon.ico',
            },
            onFinish: (data: any) => {
                setMessage('');
                setTimeout(async () => {
                    const newCount = await refreshData();
                    await fetchEvents(newCount);
                }, 4000); // Wait a bit for chain update
            }
        };

        try {
            await openContractCall(options);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const getUserAddress = () => {
        if (!isConnected) return '';
        try {
            const userData = userSession.loadUserData();
            // Try different address storage patterns in Stacks SDK
            const address = IS_MAINNET
                ? (userData.profile?.stxAddress?.mainnet || userData.profile?.stxAddress)
                : (userData.profile?.stxAddress?.testnet || userData.profile?.stxAddress);
            return address || '';
        } catch (e) {
            return '';
        }
    };

    const getShortAddress = () => {
        const address = getUserAddress();
        if (!address) return '';
        return `${address.slice(0, 5)}...${address.slice(-4)}`;
    };

    // Filter events for "My History"
    const myAddress = getUserAddress();
    const filteredEvents = activeTab === 'history'
        ? events.filter(e => e.data?.poster === myAddress || e.data?.winner === myAddress)
        : events;

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-8 p-4 lg:p-8 animate-in fade-in duration-1000">
            {/* Sidebar */}
            <aside className="flex flex-col gap-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-xl bg-[#5546FF] flex items-center justify-center shadow-lg shadow-[#5546FF]/20">
                        <Zap className="w-6 h-6 text-white fill-current" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Jackpot Wall</h1>
                        <div className="flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5 text-[#5546FF]/60" />
                            <p className="text-[10px] uppercase tracking-widest text-[#5546FF]/60 font-bold">
                                {IS_MAINNET ? 'Stacks Mainnet' : 'Stacks Testnet'}
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('board')}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                            activeTab === 'board' ? "bg-white/5 text-zinc-100 border border-white/5 shadow-sm" : "text-zinc-400 hover:text-zinc-100"
                        )}
                    >
                        <TrendingUp className={cn("w-5 h-5", activeTab === 'board' ? "text-[#5546FF]" : "text-zinc-500")} />
                        Live Board
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium outline-none",
                            activeTab === 'history' ? "bg-white/5 text-zinc-100 border border-white/5 shadow-sm" : "text-zinc-400 hover:text-zinc-100"
                        )}
                    >
                        <History className={cn("w-5 h-5", activeTab === 'history' ? "text-[#5546FF]" : "text-zinc-500")} />
                        My History
                    </button>
                    {!isConnected && (
                        <button
                            onClick={() => doOpenAuth()}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-zinc-100 transition-all font-medium"
                        >
                            <Wallet className="w-5 h-5" />
                            Connect Wallet
                        </button>
                    )}
                </nav>

                {isConnected && (
                    <div className="mt-auto glass-card p-4 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5546FF] to-[#fc6432]" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Connected</p>
                                <p className="text-sm font-medium truncate">{getShortAddress()}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { userSession.signUserOut(); window.location.reload(); }}
                            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-bold text-zinc-500 hover:text-[#fc6432] hover:bg-[#fc6432]/10 transition-all border border-white/5"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                        </button>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex flex-col gap-8">
                {/* Hero Pot Display */}
                <section className="relative overflow-hidden glass-card p-10 flex flex-col items-center justify-center text-center gap-6 group">
                    <button
                        onClick={refreshData}
                        className="absolute top-0 right-0 p-4 hover:rotate-180 transition-all duration-500"
                    >
                        <RefreshCw className={cn("w-4 h-4 text-zinc-600", isLoading && "animate-spin text-[#5546FF]")} />
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 bg-[#5546FF]/20 blur-3xl rounded-full animate-pulse" />
                        <Trophy className="w-16 h-16 text-amber-400 relative z-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                    </div>

                    <div className="flex flex-col gap-1 z-10">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#5546FF]/80 animate-pulse-subtle">Total Jackpot Pot</p>
                        <h2 className="text-7xl font-black tracking-tighter text-white">
                            {(potBalance / 1000000).toFixed(2)} <span className="text-2xl text-zinc-500 font-bold ml-1">STX</span>
                        </h2>
                    </div>

                    <div className="flex flex-col items-center gap-3 w-full max-w-xs z-10">
                        <div className="flex justify-between w-full text-[10px] font-black uppercase text-zinc-500">
                            <span>Progress</span>
                            <span>{postCount % 10}/10 Posts</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden border border-white/5 shadow-inner">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[#5546FF] to-[#fc6432] shadow-[0_0_10px_rgba(85,70,255,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${(postCount % 10) * 10}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </div>
                        <p className="text-[10px] text-zinc-500 italic">Next jackpot triggers at post #{(Math.floor(postCount / 10) + 1) * 10}</p>
                    </div>
                </section>

                <div className="grid lg:grid-cols-[1fr_320px] gap-8">
                    {/* Action Area */}
                    <div className="flex flex-col gap-6">
                        <div className="glass-card flex flex-col gap-4">
                            <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-5 h-5 text-zinc-400" />
                                <h3 className="font-bold">Post to the Wall</h3>
                            </div>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={!isConnected || isLoading}
                                placeholder={isConnected ? "Speak your truth to the chain..." : "Connect wallet to start posting"}
                                className="w-full h-32 bg-zinc-950/50 border border-white/5 rounded-xl p-4 text-zinc-100 placeholder:text-zinc-600 focus:ring-2 focus:ring-[#5546FF] outline-none transition-all resize-none shadow-inner"
                            />
                            <button
                                onClick={isConnected ? handlePost : () => doOpenAuth()}
                                disabled={isLoading || (isConnected && !message)}
                                className={cn(
                                    "w-full py-4 rounded-xl font-black tracking-wide text-sm transition-all shadow-lg active:scale-[0.98]",
                                    isConnected
                                        ? "bg-[#5546FF] text-white hover:bg-[#4436EE] shadow-[#5546FF]/20 active:shadow-inner"
                                        : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 shadow-zinc-950/50"
                                )}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </span>
                                ) : isConnected ? (
                                    "POST MESSAGE (0.1 STX)"
                                ) : (
                                    "CONNECT WALLET TO POST"
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Live Feed Area */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History className="w-5 h-5 text-[#5546FF]" />
                                <h3 className="font-bold">{activeTab === 'history' ? 'Your Activity' : 'Live Activity'}</h3>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
                                </span>
                                <span className="text-[10px] font-black text-emerald-500 uppercase">Live</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence initial={false} mode="popLayout">
                                {filteredEvents.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.3 }}
                                        className="flex flex-col items-center justify-center py-20 text-center"
                                    >
                                        <CircleDot className="w-10 h-10 mb-2" />
                                        <p className="text-xs font-medium">
                                            {activeTab === 'history' ? "No activity from this wallet yet" : "Listening for events..."}
                                        </p>
                                    </motion.div>
                                ) : (
                                    filteredEvents.map((evt, i) => (
                                        <motion.div
                                            key={evt.id || i}
                                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className={cn(
                                                "p-4 rounded-xl border transition-all",
                                                evt.type === 'jackpot-won'
                                                    ? "bg-amber-400/10 border-amber-400/30 shadow-lg shadow-amber-400/10"
                                                    : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]"
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    {evt.type === 'jackpot-won' && <Trophy className="w-3 h-3 text-amber-500" />}
                                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                                        {evt.type === 'jackpot-won' ? '🎉 Jackpot!' : `Post #${evt.data?.id}`}
                                                    </p>
                                                </div>
                                                <p className="text-[10px] text-zinc-600 font-medium">
                                                    {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : 'Just now'}
                                                </p>
                                            </div>
                                            <p className="text-sm text-zinc-100 font-medium break-words leading-relaxed">
                                                {evt.type === 'jackpot-won'
                                                    ? `Winner: ${typeof evt.data?.winner === 'object' ? evt.data?.winner.value.slice(0, 10) : evt.data?.winner?.slice(0, 10)}... won ${(evt.data?.amount / 1000000).toFixed(2)} STX`
                                                    : (typeof evt.data?.message === 'object' ? evt.data?.message?.value : evt.data?.message) || 'Untitled Post'}
                                            </p>
                                            <div className="mt-2 text-[8px] text-zinc-600 font-mono truncate">
                                                By: {typeof evt.data?.poster === 'object' ? evt.data?.poster.value : (evt.data?.poster || evt.data?.winner)}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
