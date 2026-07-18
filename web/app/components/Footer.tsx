"use client";
import { Github, Globe, TrendingUp } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-xl relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 border-t border-border">
        <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground mb-6">
          <span>Built by <a href="https://github.com/cryptoflops" className="hover:text-foreground transition-colors">cryptoflops</a></span>
          <span>·</span>
          <a href="https://aegis-aev.pages.dev" className="hover:text-foreground transition-colors">Aegis</a>
          <a href="https://gm-on-stacks.pages.dev" className="hover:text-foreground transition-colors">GM on Stacks</a>
          <a href="https://quest-dao.pages.dev" className="hover:text-foreground transition-colors">QuestDAO</a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#5546FF] to-[#fc6432] flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <div>
              <p className="text-foreground font-bold text-sm">Jackpot Wall</p>
              <p className="text-muted-foreground text-xs">The decentralized scoreboard where history is etched on-chain.</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/cryptoflops/stacks-jackpot-wall" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-medium">
              <Github size={14} /> GitHub
            </a>
            <a href="https://www.stacks.co" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-[#5546FF] transition-colors flex items-center gap-1.5 text-xs font-medium">
              <Globe size={14} /> Stacks
            </a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs">&copy; {new Date().getFullYear()} Jackpot Wall. All rights reserved.</p>
          <span className="text-muted-foreground/60 text-[10px] uppercase tracking-widest">Built on Bitcoin. Secured by Stacks.</span>
        </div>
      </div>
    </footer>
  );
}
