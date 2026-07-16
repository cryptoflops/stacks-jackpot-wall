"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

import { cn } from "@/lib/utils";
import { Crosshair, Coins } from "lucide-react";

if (typeof window !== "undefined") {
  
}

export interface CinematicHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  brandName?: string;
  tagline1?: string;
  tagline2?: string;
  cardHeading?: string;
  cardDescription?: React.ReactNode;
  metricValue?: number;
  metricMax?: number;
  metricLabel?: string;
  ctaHeading?: string;
  ctaDescription?: string;
  onConnect?: () => void;
}

export function CinematicHero({ 
  brandName = "JACKPOT WALL",
  tagline1 = "Post on-chain,",
  tagline2 = "win the pot.",
  cardHeading = "Decentralized Jackpot,",
  cardDescription = <><span className="text-white font-semibold">Jackpot Wall</span> is the on-chain scoreboard where every 10th poster wins the accumulated STX pot. Post messages, build streaks, and claim the jackpot with cryptographic proof.</>,
  metricValue = 7,
  metricMax = 10,
  metricLabel = "Posts Until Jackpot",
  ctaHeading = "Connect your wallet.",
  ctaDescription = "Join the decentralized scoreboard. Post to the wall, enter the jackpot, and win STX on the Stacks blockchain.",
  onConnect,
  className, 
  ...props 
}: CinematicHeroProps) {
  
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  // 1. High-Performance Mouse Interaction Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 2) return;

      cancelAnimationFrame(requestRef.current);
      
      requestRef.current = requestAnimationFrame(() => {
        if (mainCardRef.current && mockupRef.current) {
          const rect = mainCardRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          
          mainCardRef.current.style.setProperty("--mouse-x", `${mouseX}px`);
          mainCardRef.current.style.setProperty("--mouse-y", `${mouseY}px`);

          const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
          const yVal = (e.clientY / window.innerHeight - 0.5) * 2;

          gsap.to(mockupRef.current, {
            rotationY: xVal * 12,
            rotationX: -yVal * 12,
            ease: "power3.out",
            duration: 1.2,
          });
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  },[]);

  // 2. Complex Cinematic Scroll Timeline

  // Simple intro fade-in — no scroll-triggered animations for performance
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo(".text-track", { autoAlpha: 0, y: 20 }, { duration: 0.7, autoAlpha: 1, y: 0, ease: "power2.out" })
      .fromTo(".text-days", { autoAlpha: 0, y: 15 }, { duration: 0.5, autoAlpha: 1, y: 0, ease: "power2.out" }, "-=0.3")
      .fromTo(".cta-wrapper", { autoAlpha: 0 }, { duration: 0.5, autoAlpha: 1, ease: "power2.out" }, "-=0.2");
    return () => { tl.kill(); };
  }, [metricValue, metricMax]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full min-h-dvh flex flex-col items-center justify-center gap-6 bg-background text-white font-sans antialiased py-8", className)}
      style={{ perspective: "1500px" }}
      {...props}
    >
      <div className="film-grain" aria-hidden="true" />
      <div className="bg-grid-theme absolute inset-0 z-0 pointer-events-none opacity-50" aria-hidden="true" />

      {/* BACKGROUND LAYER: Hero Texts */}
      <div className="hero-text-wrapper relative z-10 flex flex-col items-center justify-center text-center w-full px-4">
        <h1 className="text-track gsap-reveal text-3d-matte text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tighter mb-2">
          {tagline1}
        </h1>
        <h1 className="text-days gsap-reveal text-silver-matte text-5xl md:text-7xl lg:text-[6rem] font-extrabold tracking-tighter">
          {tagline2}
        </h1>
      </div>

      {/* CTA Button */}
      <div className="cta-wrapper relative z-10 flex flex-col items-center justify-center text-center w-full px-4">
        <div className="flex justify-center">
          <button
            onClick={onConnect}
            aria-label="Connect your Stacks wallet"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-semibold text-base transition-all hover:gap-4 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#060609]"
          >
            Connect Wallet
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* PHONE MOCKUP CARD */}
      <div className="relative z-10 flex items-center justify-center w-full px-4" style={{ perspective: "1500px" }}>
        <div
          ref={mainCardRef}
          className="main-card premium-depth-card relative overflow-hidden gsap-reveal flex items-center justify-center pointer-events-auto w-[92vw] md:w-[85vw] max-w-3xl h-auto min-h-[280px] md:min-h-[450px] rounded-[32px] md:rounded-[40px]"
        >
          <div className="card-sheen" aria-hidden="true" />

          {/* DYNAMIC RESPONSIVE GRID */}
          <div className="relative w-full h-full max-w-7xl mx-auto px-4 lg:px-12 flex flex-col justify-evenly lg:grid lg:grid-cols-3 items-center lg:gap-8 z-10 py-6 lg:py-0">
            
            {/* 1. TOP (Mobile) / RIGHT (Desktop): BRAND NAME */}
            <div className="card-right-text gsap-reveal order-1 lg:order-3 flex justify-center lg:justify-end z-20 w-full">
              <h2 className="text-4xl md:text-[5rem] lg:text-[7rem] font-black uppercase tracking-[-0.03em] text-card-silver-matte lg:mt-0 leading-[0.85]" style={{ textWrap: "balance" }}>
                {brandName}
              </h2>
            </div>

            {/* 2. MIDDLE (Mobile) / CENTER (Desktop): JACKPOT DASHBOARD MOCKUP */}
            <div className="mockup-scroll-wrapper order-2 lg:order-2 relative w-full h-[380px] lg:h-[600px] flex items-center justify-center z-10" style={{ perspective: "1000px" }}>
              
              <div className="relative w-full h-full flex items-center justify-center transform scale-[0.65] md:scale-85 lg:scale-100">
                
                {/* Phone Bezel */}
                <div
                  ref={mockupRef}
                  className="relative w-[280px] h-[580px] rounded-[3rem] jackpot-bezel flex flex-col will-change-transform transform-style-3d"
                >
                  {/* Hardware Buttons */}
                  <div className="absolute top-[120px] -left-[3px] w-[3px] h-[25px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[160px] -left-[3px] w-[3px] h-[45px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[220px] -left-[3px] w-[3px] h-[45px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[170px] -right-[3px] w-[3px] h-[70px] hardware-btn rounded-r-md z-0 scale-x-[-1]" aria-hidden="true" />

                  {/* Screen */}
                  <div className="absolute inset-[7px] bg-[#060609] rounded-[2.5rem] overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,1)] text-white z-10">
                    <div className="absolute inset-0 screen-glare z-40 pointer-events-none" aria-hidden="true" />

                    {/* Dynamic Island */}
                    <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-50 flex items-center justify-end px-3 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.1)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#fc6432] shadow-[0_0_8px_rgba(252,100,50,0.8)] animate-pulse" />
                    </div>

                    {/* App Interface */}
                    <div className="relative w-full h-full pt-12 px-5 pb-8 flex flex-col">
                      <div className="phone-widget flex justify-between items-center mb-8">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1">Live</span>
                          <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">Jackpot Wall</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-[#5546FF]/20 text-white flex items-center justify-center font-bold text-sm border border-[#5546FF]/30 shadow-lg shadow-black/50">JW</div>
                      </div>

                      {/* Progress Ring */}
                      <div className="phone-widget relative w-44 h-44 mx-auto flex items-center justify-center mb-8 drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
                        <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                          <circle cx="88" cy="88" r="64" fill="none" stroke="rgba(85, 70, 255, 0.08)" strokeWidth="12" />
                          <circle className="progress-ring" cx="88" cy="88" r="64" fill="none" stroke="#5546FF" strokeWidth="12" />
                        </svg>
                        <div className="text-center z-10 flex flex-col items-center">
                          <span className="counter-val text-4xl font-extrabold tracking-tighter text-white">0</span>
                          <span className="text-[8px] text-indigo-200/50 uppercase tracking-[0.1em] font-bold mt-0.5">{metricLabel}</span>
                        </div>
                      </div>

                      {/* Messages Widget */}
                      <div className="space-y-3">
                        <div className="phone-widget widget-depth rounded-2xl p-3 flex items-center">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5546FF]/20 to-[#5546FF]/5 flex items-center justify-center mr-3 border border-[#5546FF]/20 shadow-inner">
                            <svg className="w-4 h-4 text-[#5546FF] drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="h-2 w-24 bg-neutral-300/20 rounded-full mb-2 shadow-inner" />
                            <div className="h-1.5 w-16 bg-neutral-600/30 rounded-full shadow-inner" />
                          </div>
                        </div>
                        <div className="phone-widget widget-depth rounded-2xl p-3 flex items-center">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fc6432]/20 to-[#fc6432]/5 flex items-center justify-center mr-3 border border-[#fc6432]/20 shadow-inner">
                            <svg className="w-4 h-4 text-[#fc6432] drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="h-2 w-20 bg-neutral-300/20 rounded-full mb-2 shadow-inner" />
                            <div className="h-1.5 w-28 bg-neutral-600/30 rounded-full shadow-inner" />
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-white/20 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                    </div>
                  </div>
                </div>

                {/* Floating Glass Badges */}
                <div className="floating-badge absolute flex top-6 lg:top-12 left-[-15px] lg:left-[-80px] floating-ui-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-[#5546FF]/30 to-[#5546FF]/10 flex items-center justify-center border border-[#5546FF]/30 shadow-inner">
                    <Crosshair className="w-4 h-4 lg:w-5 lg:h-5 drop-shadow-lg" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-white text-xs lg:text-sm font-bold tracking-tight">10th Poster Wins</p>
                    <p className="text-indigo-200/50 text-[10px] lg:text-xs font-medium">90% of pot paid out</p>
                  </div>
                </div>

                <div className="floating-badge absolute flex bottom-12 lg:bottom-20 right-[-15px] lg:right-[-80px] floating-ui-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-[#fc6432]/30 to-[#fc6432]/10 flex items-center justify-center border border-[#fc6432]/30 shadow-inner">
                    <Coins className="w-4 h-4 lg:w-5 lg:h-5 drop-shadow-lg" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-white text-xs lg:text-sm font-bold tracking-tight">0.1 STX Entry</p>
                    <p className="text-indigo-200/50 text-[10px] lg:text-xs font-medium">On-chain escrow</p>
                  </div>
                </div>

              </div>
            </div>

            {/* 3. BOTTOM (Mobile) / LEFT (Desktop): DESCRIPTION */}
            <div className="card-left-text gsap-reveal order-3 lg:order-1 flex flex-col justify-center text-center lg:text-left z-20 w-full lg:max-w-none px-4 lg:px-0">
              <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-0 lg:mb-5 tracking-tight">
                {cardHeading}
              </h3>
              <p className="hidden md:block text-indigo-200/60 text-sm md:text-base lg:text-lg font-normal leading-relaxed mx-auto lg:mx-0 max-w-sm lg:max-w-none">
                {cardDescription}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
