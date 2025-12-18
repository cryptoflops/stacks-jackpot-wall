'use client';

import { useState, useEffect } from 'react';
import { useConnect } from '@stacks/connect-react';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { openContractCall } from '@stacks/connect';
import { uintCV, stringUtf8CV, cvToJSON, fetchCallReadOnlyFunction, PostConditionMode } from '@stacks/transactions';
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
    Globe,
    CreditCard,
    ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface FeedEvent {
    id: string;
    type: 'new-post' | 'jackpot-won';
    data?: any;
    timestamp?: number;
}

interface JackpotProps {
    onBackToLanding?: () => void;
}

export default function Jackpot({ onBackToLanding }: JackpotProps) {
    const { doOpenAuth } = useConnect();
    const [message, setMessage] = useState('');
    const [events, setEvents] = useState<FeedEvent[]>([]);
    const [potBalance, setPotBalance] = useState<number>(0);
    const [postCount, setPostCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'board' | 'history'>('board');
    const [showDebug, setShowDebug] = useState(false);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    // Multi-Network Configuration
    const IS_MAINNET = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';
    const TESTNET_CONTRACT = process.env.NEXT_PUBLIC_TESTNET_CONTRACT || 'ST1TN1ERKXEM2H9TKKWGPGZVNVNEKS92M7MAMP23P';
    const MAINNET_CONTRACT = process.env.NEXT_PUBLIC_MAINNET_CONTRACT || 'SP1TN1ERKXEM2H9TKKWGPGZVNVNEKS92M7MAMP23P';

    const CURRENT_NETWORK = IS_MAINNET ? STACKS_MAINNET : STACKS_TESTNET;

    // Parse Address and Name (In case user provides SP...addr.contract-name)
    const rawContract = IS_MAINNET ? MAINNET_CONTRACT : TESTNET_CONTRACT;
    const [CONTRACT_ADDRESS, CUSTOM_NAME] = rawContract.split('.');
    const CONTRACT_NAME = CUSTOM_NAME || 'jackpot-wall';

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
            const signedIn = userSession.isUserSignedIn();
            setIsConnected(signedIn);

            const [potRes, countRes] = await Promise.all([
                callContractReadOnly('get-pot-balance'),
                callContractReadOnly('get-counter')
            ]);

            const potVal = Number(cvToJSON(potRes).value);
            const countVal = Number(cvToJSON(countRes).value);

            setPotBalance(potVal);
            setPostCount(countVal);

            // Fetch events after getting the counter
            await fetchEvents(countVal);

            return countVal;
        } catch (e) {
            console.error('❌ Data sync failed:', e);
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

            // Priority 2: Direct Chain Fallback
            if (allEvents.length === 0 && currentCounter > 0) {
                console.log('⚠️ No API events. Falling back to direct chain fetch...');
                const fallbackPosts = [];
                const limit = Math.min(currentCounter, 10);

                // Extraction helper to handle different SDK JSON outputs
                const extract = (obj: any) => {
                    if (!obj) return '';
                    if (typeof obj === 'string') return obj;
                    return obj.value || obj.toString() || '';
                };

                for (let i = 0; i < limit; i++) {
                    const postId = currentCounter - i;
                    if (postId <= 0) break;
                    try {
                        const postRes = await callContractReadOnly('get-post', [uintCV(postId)]);
                        const postData = cvToJSON(postRes).value;

                        if (postData) {
                            fallbackPosts.push({
                                id: `chain-${postId}`,
                                type: 'new-post' as const,
                                data: {
                                    id: postId,
                                    poster: extract(postData.poster),
                                    message: extract(postData.message)
                                },
                                timestamp: Date.now() - (i * 60000 * 2) // Approximate for display
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
        refreshData();
        const interval = setInterval(refreshData, 30000); // Sync every 30s
        return () => clearInterval(interval);
    }, []);

    const handlePost = async () => {
        if (!message) return;
        setIsLoading(true);
        console.log('🚀 Triggering transaction...', { contractAddress: CONTRACT_ADDRESS, message });

        try {
            await openContractCall({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'post-message',
                functionArgs: [stringUtf8CV(message)],
                network: CURRENT_NETWORK,
                postConditionMode: PostConditionMode.Allow,
                appDetails: {
                    name: 'Jackpot Wall',
                    icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.ico' : '',
                },
                onFinish: (data) => {
                    console.log('✅ Transaction broadcasted:', data);
                    setMessage('');
                    // Optimistic update
                    setTimeout(refreshData, 2000);
                },
                onCancel: () => {
                    console.log('❌ Transaction cancelled by user');
                    setIsLoading(false);
                }
            });
        } catch (e) {
            console.error('❌ Failed to create transaction:', e);
            setIsLoading(false);
        }
    };

    const getUserAddress = () => {
        if (!isConnected) return '';
        try {
            const userData = userSession.loadUserData();
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

    const myAddress = getUserAddress();
    const filteredEvents = activeTab === 'history'
        ? events.filter(e => e.data?.poster === myAddress || e.data?.winner === myAddress)
        : events;

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-8 p-4 lg:p-8">
            {/* Sidebar / Navigation */}
            <aside className="flex flex-col gap-6 lg:h-[calc(100vh-100px)] lg:sticky lg:top-12">
                <button
                    onClick={onBackToLanding}
                    className="flex items-center gap-4 px-2 hover:opacity-80 transition-all text-left group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5546FF] to-[#fc6432] flex items-center justify-center shadow-lg shadow-[#5546FF]/20 group-hover:scale-105 transition-transform duration-300">
                        <Zap className="w-6 h-6 text-white fill-current" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-[#5546FF] transition-colors">Jackpot Wall</h1>
                        <div className="flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5 text-[#5546FF]/60" />
                            <p className="text-[10px] uppercase tracking-widest text-[#5546FF]/60 font-bold">
                                {IS_MAINNET ? 'Stacks Mainnet' : 'Stacks Testnet'}
                            </p>
                        </div>
                    </div>
                </button>

                <nav className="flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('board')}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold tracking-tight",
                            activeTab === 'board' ? "bg-white/10 text-white border border-white/10 shadow-xl" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                        )}
                    >
                        <TrendingUp className={cn("w-5 h-5", activeTab === 'board' ? "text-[#5546FF]" : "text-zinc-500")} />
                        The Wall
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold tracking-tight",
                            activeTab === 'history' ? "bg-white/10 text-white border border-white/10 shadow-xl" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                        )}
                    >
                        <History className={cn("w-5 h-5", activeTab === 'history' ? "text-[#5546FF]" : "text-zinc-500")} />
                        My Ledger
                    </button>
                </nav>

                <div className="mt-auto flex flex-col gap-4">
                    <div className="glass-card p-4 flex flex-col gap-4 !bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5546FF] to-[#fc6432]" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">Connected</p>
                                <p className="text-sm font-bold truncate text-white">{getShortAddress()}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { userSession.signUserOut(); window.location.reload(); }}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[10px] font-black text-zinc-400 hover:text-[#fc6432] hover:bg-[#fc6432]/10 transition-all border border-white/5 uppercase tracking-widest"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Disconnect
                        </button>
                    </div>

                    <button
                        onClick={() => setShowDebug(!showDebug)}
                        className="text-[10px] text-zinc-600 hover:text-zinc-400 font-bold text-center uppercase tracking-widest"
                    >
                        {showDebug ? 'Hide Inspector' : 'System Inspector'}
                    </button>

                    {showDebug && (
                        <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-[10px] font-mono text-zinc-400 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4">
                            <p className="font-black text-[#5546FF] mb-2 uppercase border-b border-white/5 pb-2">Diagnostic Data</p>
                            <p>NETWORK: {process.env.NEXT_PUBLIC_NETWORK || 'testnet'}</p>
                            <p className="break-all">CONTRACT: {CONTRACT_ADDRESS}</p>
                            <p className="text-white mt-2">POT: {(potBalance / 1000000).toFixed(2)} STX</p>
                            <p className="text-white">COUNT: {postCount}</p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Viewport */}
            <main className="flex flex-col gap-8 min-w-0">
                <AnimatePresence mode="wait">
                    {activeTab === 'board' ? (
                        <motion.div
                            key="board"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col gap-8"
                        >
                            {/* Jackpot Card */}
                            <section className="relative overflow-hidden glass-card !p-12 flex flex-col items-center justify-center text-center gap-8 group !bg-white/5 border border-white/10">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#5546FF]/10 via-transparent to-[#fc6432]/5 pointer-events-none" />

                                <button
                                    onClick={refreshData}
                                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-all text-zinc-500 hover:text-white"
                                >
                                    <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin text-[#5546FF]")} />
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-0 bg-[#5546FF]/30 blur-[100px] rounded-full animate-pulse" />
                                    <Trophy className="w-24 h-24 text-amber-300 relative z-10 drop-shadow-[0_0_30px_rgba(252,211,77,0.3)]" />
                                </div>

                                <div className="flex flex-col gap-2 z-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#5546FF] animate-pulse">Cumulative Jackpot</p>
                                    <h2 className="text-8xl font-black tracking-tighter text-white">
                                        {(potBalance / 1000000).toFixed(2)} <span className="text-3xl text-zinc-600 font-bold -ml-2">STX</span>
                                    </h2>
                                </div>

                                <div className="flex flex-col items-center gap-4 w-full max-w-sm z-10">
                                    <div className="flex justify-between w-full text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                                        <span>Next Trigger Progress</span>
                                        <span className="text-[#5546FF]">{postCount % 10}/10 Posts</span>
                                    </div>
                                    <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/10 p-0.5">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-[#5546FF] to-[#fc6432] rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(postCount % 10) * 10}%` }}
                                            transition={{ duration: 2, ease: "easeOut" }}
                                        />
                                    </div>
                                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Next payout at post #{(Math.floor(postCount / 10) + 1) * 10}</p>
                                </div>
                            </section>

                            {/* Action Grid */}
                            <div className="grid xl:grid-cols-[1fr_380px] gap-8">
                                <div className="glass-card !bg-white/5 border border-white/10 p-8 flex flex-col gap-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-[#5546FF]/10 text-[#5546FF]">
                                                <MessageSquare className="w-5 h-5" />
                                            </div>
                                            <h3 className="font-black text-xl text-white">Post to the Wall</h3>
                                        </div>
                                        <p className="text-zinc-500 font-mono text-sm">0.1 STX</p>
                                    </div>

                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        disabled={isLoading}
                                        placeholder="Speak your truth to the chain..."
                                        className="w-full h-44 bg-black/40 border border-white/10 rounded-2xl p-6 text-zinc-100 placeholder:text-zinc-700 outline-none focus:ring-2 focus:ring-[#5546FF] transition-all resize-none text-lg"
                                    />

                                    <button
                                        onClick={handlePost}
                                        disabled={isLoading || !message}
                                        className={cn(
                                            "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl active:scale-[0.98]",
                                            message ? "bg-[#5546FF] text-white hover:bg-[#4436EE]" : "bg-zinc-900 text-zinc-600"
                                        )}
                                    >
                                        {isLoading ? 'Processing...' : 'Post Message'}
                                    </button>
                                </div>

                                <div className="glass-card !bg-white/5 border border-white/10 p-8 flex flex-col gap-6 h-[500px]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                                                <CircleDot className="w-5 h-5" />
                                            </div>
                                            <h3 className="font-black text-xl text-white">Live Feed</h3>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                                        <AnimatePresence>
                                            {events.length === 0 ? (
                                                <p className="text-zinc-600 text-center py-20 text-xs font-bold uppercase tracking-widest">No activity yet</p>
                                            ) : (
                                                events.map((evt, i) => (
                                                    <motion.div
                                                        key={evt.id || i}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-4 rounded-xl bg-white/5 border border-white/5"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="text-[10px] font-black text-[#5546FF] uppercase">Post #{evt.data?.id}</p>
                                                            <p className="text-[9px] text-zinc-600 font-mono">
                                                                {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : 'Now'}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm text-zinc-200 font-medium mb-2">{evt.data?.message}</p>
                                                        <p className="text-[9px] text-zinc-500 font-mono truncate">By {evt.data?.poster}</p>
                                                    </motion.div>
                                                ))
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="glass-card !bg-white/5 border border-white/10 p-12 min-h-[600px] flex flex-col gap-8"
                        >
                            <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                                <History className="w-10 h-10 text-[#5546FF]" />
                                Your Ledger
                            </h2>
                            <div className="grid gap-4">
                                {filteredEvents.length === 0 ? (
                                    <p className="text-zinc-600 text-center py-40 font-bold uppercase tracking-widest">No personal history</p>
                                ) : (
                                    filteredEvents.map((evt, i) => (
                                        <div key={evt.id || i} className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
                                            <p className="text-[10px] font-black text-[#fc6432] uppercase">Message sent</p>
                                            <p className="text-lg text-white font-medium">{evt.data?.message}</p>
                                            <p className="text-xs text-zinc-500 bg-black/20 p-2 rounded-lg font-mono">Tx ID: {evt.id.slice(0, 20)}...</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
