import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const isMainnet = searchParams.get('mainnet') === 'true';
    const apiKey = process.env.HIRO_API_KEY;

    if (!path) {
        return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    const apiHost = isMainnet ? 'api.mainnet.hiro.so' : 'api.testnet.hiro.so';
    const url = `https://${apiHost}${path}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (apiKey) {
        headers['x-api-key'] = apiKey;
    }

    try {
        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`Hiro API responded with ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Stacks API proxy error:', error);
        return NextResponse.json({ error: 'Failed to fetch from Stacks API' }, { status: 500 });
    }
}
