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
    txId?: string;
    type: 'new-post' | 'jackpot-won' | 'user-tx';
    data?: any;
    status?: 'success' | 'pending' | 'failed';
    timestamp?: number;
    score?: number;
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
    const [userReputation, setUserReputation] = useState<{ score: number; passport_id: string | null } | null>(null);
    const [reputationMap, setReputationMap] = useState<{ [address: string]: number }>({});

    // Multi-Network Configuration
    // Multi-Network Configuration (Aligned with mainnet deployment)
    const IS_MAINNET = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' || process.env.NEXT_PUBLIC_NETWORK === 'Mainnet';
    const TESTNET_CONTRACT = process.env.NEXT_PUBLIC_TESTNET_CONTRACT || 'ST1TN1ERKXEM2H9TKKWGPGZVNVNEKS92M7MAMP23P.jackpot-wall';
    const MAINNET_CONTRACT = process.env.NEXT_PUBLIC_MAINNET_CONTRACT || 'SP1TN1ERKXEM2H9TKKWGPGZVNVNEKS92M7M3CKVJJ.jackpot-wall';

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

            // Sync user reputation
            if (signedIn) {
                const userAddr = getUserAddress();
                if (userAddr) await fetchReputation(userAddr, true);
            }

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
            console.log('📡 Syncing Events...', { currentCounter });
            const userAddr = getUserAddress();
            const apiHost = IS_MAINNET ? 'api.mainnet.hiro.so' : 'api.testnet.hiro.so';

            // 1. Fetch Local App Events (Chainhook)
            const res = await fetch('/api/events');
            const json = await res.json();
            let allEvents: FeedEvent[] = json.events || [];

            // 2. Network Fallback: Fetch Recent Contract TXs for Live Feed Links
            // This ensures links exist even if Chainhooks are delayed/errored
            try {
                const contractId = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;
                const contractTxRes = await fetch(`https://${apiHost}/extended/v1/address/${contractId}/transactions?limit=20`);
                const contractTxJson = await contractTxRes.json();

                const chainEvents = contractTxJson.results
                    .filter((tx: any) => tx.tx_status === 'success' && tx.tx_type === 'contract_call')
                    .map((tx: any) => ({
                        id: tx.tx_id,
                        txId: tx.tx_id,
                        type: tx.contract_call.function_name === 'post-message' ? 'new-post' : 'user-tx',
                        status: 'success',
                        timestamp: (tx.burn_block_time || Date.now() / 1000) * 1000,
                        data: {
                            message: tx.contract_call.function_args?.[0]?.repr?.replace(/u?"|\\/g, '') || 'Posted to Wall',
                            poster: tx.sender_address,
                            id: '?' // Post ID relative to transaction, hard to get without secondary index
                        }
                    }));

                // Merge with priority on Chainhook data (which has post IDs)
                const seenTxIds = new Set(allEvents.map(e => e.txId || e.id));
                chainEvents.forEach((ce: any) => {
                    if (!seenTxIds.has(ce.id)) {
                        allEvents.push(ce);
                    }
                });
            } catch (err) {
                console.error('Contract TX fallback failed:', err);
            }

            // 3. Robust User History (Direct API)
            if (userAddr) {
                try {
                    const txRes = await fetch(`https://${apiHost}/extended/v1/address/${userAddr}/transactions?limit=40`);
                    const txJson = await txRes.json();

                    const userTxs = txJson.results
                        .filter((tx: any) => tx.tx_type === 'contract_call' && tx.contract_call.contract_id.includes(CONTRACT_NAME))
                        .map((tx: any) => ({
                            id: tx.tx_id,
                            txId: tx.tx_id,
                            type: 'user-tx',
                            status: tx.tx_status,
                            timestamp: (tx.burn_block_time || tx.parent_burn_block_time || Date.now() / 1000) * 1000,
                            data: {
                                message: tx.contract_call.function_args?.[0]?.repr?.replace(/u?"|\\/g, '') || 'Interacted with Wall',
                                poster: tx.sender_address
                            }
                        }));

                    const finalSeen = new Set(allEvents.map(e => e.txId || e.id));
                    userTxs.forEach((tx: any) => {
                        if (!finalSeen.has(tx.id)) allEvents.push(tx);
                    });
                } catch (txErr) {
                    console.error('User history fetch failed:', txErr);
                }
            }

            // Sorting and cleanup
            const sortedEvents = allEvents.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

            // Fetch missing reputations for sorted events (limit to top 10 for performance)
            const addressesToFetch = [...new Set(sortedEvents.slice(0, 10).map(e => e.data?.poster).filter(Boolean))];
            addressesToFetch.forEach(addr => {
                if (reputationMap[addr] === undefined) fetchReputation(addr);
            });

            setEvents(sortedEvents);
        } catch (e) {
            console.error('❌ Event sync failed:', e);
        }
    };

    const fetchReputation = async (address: string, isCurrentUser: boolean = false) => {
        try {
            const res = await fetch(`/api/talent?address=${address}`);
            const data = await res.json();
            if (data.score !== undefined) {
                if (isCurrentUser) setUserReputation({ score: data.score, passport_id: data.passport_id });
                setReputationMap(prev => ({ ...prev, [address]: data.score }));
            }
        } catch (err) {
            console.error(`Failed to fetch reputation for ${address}:`, err);
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

                    // Optimistic update for history
                    const optimisticEvent: FeedEvent = {
                        id: data.txId,
                        txId: data.txId,
                        type: 'user-tx',
                        status: 'pending',
                        timestamp: Date.now(),
                        data: {
                            message: message,
                            poster: myAddress
                        }
                    };
                    setEvents(prev => [optimisticEvent, ...prev]);

                    setMessage('');
                    setTimeout(refreshData, 10000); // Wait for indexing
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

    const getExplorerUrl = (txId?: string) => {
        if (!txId || txId.startsWith('chain-')) return null;
        const baseUrl = 'https://explorer.hiro.so';
        const suffix = IS_MAINNET ? '?chain=mainnet' : '?chain=testnet';
        return `${baseUrl}/txid/${txId}${suffix}`;
    };

    const myAddress = getUserAddress();
    const filteredEvents = activeTab === 'history'
        ? events.filter(e => e.data?.poster === myAddress || e.data?.winner === myAddress || e.type === 'user-tx')
        : events;

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-4 lg:gap-8 p-4 lg:p-8">
            {/* Sidebar / Navigation */}
            <aside className="flex flex-col gap-4 lg:gap-6 lg:h-[calc(100vh-100px)] lg:sticky lg:top-12">
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

                <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                    <button
                        onClick={() => setActiveTab('board')}
                        className={cn(
                            "flex items-center gap-2 lg:gap-3 px-4 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl transition-all font-bold tracking-tight shrink-0",
                            activeTab === 'board' ? "bg-white/10 text-white border border-white/10 shadow-xl" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                        )}
                    >
                        <TrendingUp className={cn("w-4 lg:w-5 h-4 lg:h-5", activeTab === 'board' ? "text-[#5546FF]" : "text-zinc-500")} />
                        The Wall
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn(
                            "flex items-center gap-2 lg:gap-3 px-4 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl transition-all font-bold tracking-tight shrink-0",
                            activeTab === 'history' ? "bg-white/10 text-white border border-white/10 shadow-xl" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                        )}
                    >
                        <History className={cn("w-4 lg:w-5 h-4 lg:h-5", activeTab === 'history' ? "text-[#5546FF]" : "text-zinc-500")} />
                        Message History
                    </button>
                </nav>

                <div className="mt-auto flex flex-col gap-4">
                    <div className="glass-card p-5 flex flex-col gap-5 !bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5546FF] to-[#fc6432] shadow-lg shadow-[#5546FF]/20" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">Connected</p>
                                    {userReputation && userReputation.score > 0 && (
                                        <a
                                            href={`https://www.talentprotocol.com/passport/${userReputation.passport_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 bg-[#5546FF]/20 text-[#5546FF] px-1.5 py-0.5 rounded-md text-[8px] font-black border border-[#5546FF]/30 hover:bg-[#5546FF]/30 transition-all"
                                        >
                                            <Zap className="w-2 h-2 fill-current" />
                                            SCORE: {userReputation.score}
                                        </a>
                                    )}
                                </div>
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
                            <section className="relative overflow-hidden glass-card p-8 lg:p-16 flex flex-col items-center justify-center text-center gap-8 lg:gap-10 group !bg-white/5 border border-white/10 backdrop-blur-3xl shadow-[0_0_100px_rgba(85,70,255,0.05)]">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#5546FF]/10 via-transparent to-[#fc6432]/10 pointer-events-none" />

                                <button
                                    onClick={refreshData}
                                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-all text-zinc-500 hover:text-white"
                                >
                                    <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin text-[#5546FF]")} />
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-0 bg-[#5546FF]/30 blur-[60px] lg:blur-[100px] rounded-full animate-pulse" />
                                    <Trophy className="w-16 lg:w-24 h-16 lg:h-24 text-amber-300 relative z-10 drop-shadow-[0_0_30px_rgba(252,211,77,0.3)]" />
                                </div>

                                <div className="flex flex-col gap-2 z-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#5546FF] animate-pulse">Cumulative Jackpot</p>
                                    <h2 className="text-5xl lg:text-8xl font-black tracking-tighter text-white">
                                        {(potBalance / 1000000).toFixed(2)} <span className="text-xl lg:text-3xl text-zinc-600 font-bold -ml-2">STX</span>
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
                            <div className="grid lg:grid-cols-[1fr_380px] gap-4 lg:gap-8">
                                <div className="glass-card !bg-white/5 border border-white/10 backdrop-blur-xl p-8 lg:p-10 flex flex-col gap-8 shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-2xl bg-[#5546FF]/10 text-[#5546FF] border border-[#5546FF]/20">
                                                <MessageSquare className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-black text-2xl text-white tracking-tight">Post to the Wall</h3>
                                        </div>
                                        <p className="text-zinc-500 font-mono text-base font-bold bg-white/5 px-3 py-1 rounded-lg">0.1 STX</p>
                                    </div>

                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        disabled={isLoading}
                                        placeholder="Speak your truth to the chain..."
                                        className="w-full h-52 bg-black/40 border border-white/10 rounded-3xl p-8 text-zinc-100 placeholder:text-zinc-700 outline-none focus:ring-2 focus:ring-[#5546FF]/50 transition-all resize-none text-xl leading-relaxed shadow-inner"
                                    />

                                    <button
                                        onClick={handlePost}
                                        disabled={isLoading || !message}
                                        className={cn(
                                            "w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-sm transition-all shadow-2xl active:scale-[0.98] border border-white/10",
                                            message ? "bg-[#5546FF] text-white hover:bg-[#4436EE] hover:shadow-[#5546FF]/20" : "bg-zinc-900 text-zinc-600"
                                        )}
                                    >
                                        {isLoading ? 'Processing...' : 'Post Message'}
                                    </button>
                                </div>

                                <div className="glass-card !bg-white/5 border border-white/10 p-6 lg:p-8 flex flex-col gap-6 h-[400px] lg:h-[500px]">
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
                                                        className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group/item shadow-lg"
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-[10px] font-black text-[#5546FF] uppercase tracking-tighter">Post #{evt.data?.id || (evt.type === 'jackpot-won' ? 'WIN' : 'TX')}</p>
                                                                {reputationMap[evt.data?.poster] > 0 && (
                                                                    <div className="flex items-center gap-1 bg-[#fc6432]/20 text-[#fc6432] px-1.5 py-0.5 rounded-md text-[8px] font-black border border-[#fc6432]/30 shadow-[0_0_10px_rgba(252,100,50,0.1)]">
                                                                        <Trophy className="w-2 h-2" />
                                                                        {reputationMap[evt.data?.poster]}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-[9px] text-zinc-600 font-mono font-bold uppercase tracking-tighter">
                                                                    {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                                                </p>
                                                                {getExplorerUrl(evt.txId || evt.id) && (
                                                                    <a
                                                                        href={getExplorerUrl(evt.txId || evt.id)!}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-zinc-600 hover:text-[#5546FF] transition-all transform hover:scale-110"
                                                                    >
                                                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-zinc-200 font-medium mb-3 leading-relaxed">{evt.data?.message}</p>
                                                        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                                            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#5546FF] to-[#fc6432] opacity-50" />
                                                            <p className="text-[9px] text-zinc-500 font-mono truncate tracking-tight">{evt.data?.poster}</p>
                                                        </div>
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
                            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                                <History className="w-10 h-10 text-[#5546FF]" />
                                Message History
                            </h2>
                            <div className="grid gap-4">
                                {filteredEvents.length === 0 ? (
                                    <p className="text-zinc-600 text-center py-40 font-bold uppercase tracking-widest">No personal history</p>
                                ) : (
                                    filteredEvents.map((evt, i) => (
                                        <a
                                            key={evt.id || i}
                                            href={getExplorerUrl(evt.txId || evt.id) || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all flex flex-col gap-3 relative overflow-hidden"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <p className={cn(
                                                        "text-[10px] font-black uppercase px-2 py-0.5 rounded-md",
                                                        evt.type === 'jackpot-won' ? "bg-amber-400/20 text-amber-400" : "bg-[#fc6432]/20 text-[#fc6432]"
                                                    )}>
                                                        {evt.type === 'jackpot-won' ? 'Jackpot Won' : 'Message Posted'}
                                                    </p>
                                                    {reputationMap[evt.data?.poster] > 0 && (
                                                        <div className="flex items-center gap-1 bg-[#5546FF]/20 text-[#5546FF] px-2 py-0.5 rounded-md text-[9px] font-black border border-[#5546FF]/30">
                                                            <Zap className="w-2.5 h-2.5 fill-current" />
                                                            BUILDER SCORE: {reputationMap[evt.data?.poster]}
                                                        </div>
                                                    )}
                                                    {evt.status && (
                                                        <span className={cn(
                                                            "text-[9px] font-bold uppercase",
                                                            evt.status === 'success' ? "text-emerald-500" : "text-amber-500 animate-pulse"
                                                        )}>
                                                            • {evt.status}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-zinc-500 font-mono">
                                                    {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : 'Recent'}
                                                </p>
                                            </div>

                                            <p className="text-lg text-white font-medium group-hover:text-[#5546FF] transition-colors">{evt.data?.message}</p>

                                            <div className="flex items-center gap-2 mt-2">
                                                <p className="text-[10px] text-zinc-500 bg-black/40 px-3 py-1.5 rounded-lg font-mono flex-1 truncate">
                                                    TX: {evt.txId || evt.id}
                                                </p>
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#5546FF] group-hover:text-white transition-all">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </div>
                                            </div>

                                            {/* Glow effect on hover */}
                                            <div className="absolute -inset-1 bg-gradient-to-r from-[#5546FF]/0 via-[#5546FF]/5 to-[#fc6432]/0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                                        </a>
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
