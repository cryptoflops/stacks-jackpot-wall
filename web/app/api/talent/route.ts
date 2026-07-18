import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const apiKey = process.env.TALENT_PROTOCOL_API_KEY;

    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    if (!apiKey) {
        console.error('TALENT_PROTOCOL_API_KEY is not set');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        // v3 API expects the address in the path or as a query param depending on endpoint
        // Based on research: https://api.talentprotocol.com/api/v3/passports/{address}
        const response = await fetch(`https://api.talentprotocol.com/api/v3/passports/${address}`, {
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({ score: 0, passport_id: null }, { status: 200 });
            }
            throw new Error(`Talent Protocol API responded with ${response.status}`);
        }

        const data = await response.json();

        // Extract relevant data from v3 response
        // Usually: { passport: { score: 70, ... } }
        const passport = data.passport || {};

        return NextResponse.json({
            score: passport.score || 0,
            passport_id: passport.id || null,
            profile_picture: passport.profile_picture_url || null
        });
    } catch (error) {
        console.error('Talent Protocol proxy error:', error);
        return NextResponse.json({ error: 'Failed to fetch reputation data' }, { status: 500 });
    }
}
