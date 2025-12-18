'use client';

import React from 'react';
import { Github, Zap, Globe } from 'lucide-react';

export default function Footer() {
    const links = [
        {
            label: 'GitHub',
            href: 'https://github.com/cryptoflops/stacks-jackpot-wall',
            icon: <Github className="w-3.5 h-3.5" />
        },
        {
            label: 'Talent Protocol',
            href: 'https://www.talentprotocol.com',
            icon: <Zap className="w-3.5 h-3.5" />
        },
        {
            label: 'Stacks',
            href: 'https://stacks.co',
            icon: <Globe className="w-3.5 h-3.5" />
        }
    ];

    return (
        <footer className="w-full py-12 px-4 flex flex-col items-center gap-6 relative z-10">
            <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-8">
                {links.map((link, i) => (
                    <a
                        key={i}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] group"
                    >
                        <span className="text-zinc-600 group-hover:text-[#5546FF] transition-colors">
                            {link.icon}
                        </span>
                        {link.label}
                    </a>
                ))}
            </div>

            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.3em]">
                    © 2025 Jackpot Wall • On-Chain Reputation
                </p>
            </div>
        </footer>
    );
}
