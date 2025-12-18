import { NextResponse } from 'next/server';
import { eventStore } from '@/lib/store';

export async function POST(request: Request) {
    // 1. Authorization Check (Prevents UI Spoofing)
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CHAINHOOK_SECRET || 'secret-token';

    if (authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body || !body.apply || !body.apply[0]) {
        return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    for (const block of body.apply) {
        for (const tx of block.transactions) {
            if (tx.metadata.success) {
                // events is an array inside metadata? No, tx.metadata.receipt.events usually
                // Chainhook structure is complex.
                // Let's assume we look for print events in the logs
                // We'll log the whole tx for debugging, but try to extract print

                const events = tx.metadata.receipt?.events || [];
                for (const evt of events) {
                    if (evt.type === 'smart_contract_log') { // Print event
                        const value = evt.data.value; // Hex or parsed?
                        // Dependent on Chainhook settings (decode_values: true normally)
                        // Just push raw for now
                        eventStore.add({
                            id: tx.transaction_identifier.hash,
                            type: 'new-post', // Generic type, refined by data
                            data: value
                        });
                    }
                }
            }
        }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
}
