'use client';

import { Connect } from '@stacks/connect-react';
import { ReactNode } from 'react';
import { userSession } from '@/lib/stacks';

export function Providers({ children }: { children: ReactNode }) {
    const authOptions = {
        appDetails: {
            name: 'Jackpot Wall',
            icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.ico' : '',
        },
        redirectTo: '/',
        onFinish: () => {
            window.location.reload();
        },
        userSession,
    };

    return (
        <Connect authOptions={authOptions}>
            {children}
        </Connect>
    );
}
