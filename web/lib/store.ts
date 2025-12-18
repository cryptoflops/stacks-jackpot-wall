
// Simple in-memory store for demo purposes (Local Devnet/Testnet only)
// In production, use Redis/Postgres

type Event = {
    id: string;
    type: 'new-post' | 'jackpot-won';
    data: any;
    timestamp: number;
};

declare global {
    var _eventStore: Event[];
}

if (!global._eventStore) {
    global._eventStore = [];
}

export const eventStore = {
    add: (event: Omit<Event, 'timestamp'>) => {
        const entry = { ...event, timestamp: Date.now() };
        global._eventStore.unshift(entry);
        // Keep last 50
        if (global._eventStore.length > 50) global._eventStore.pop();
        return entry;
    },
    getAll: () => global._eventStore
};
