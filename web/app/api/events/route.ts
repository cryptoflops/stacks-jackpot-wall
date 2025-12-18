import { NextResponse } from 'next/server';
import { eventStore } from '@/lib/store';

export async function GET() {
    return NextResponse.json({ events: eventStore.getAll() });
}
