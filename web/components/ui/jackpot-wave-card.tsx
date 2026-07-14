'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface JackpotWaveCardProps {
  /** The jackpot amount to display */
  amount?: number;
  /** Posts until next jackpot trigger (e.g., 3 out of 10) */
  postsUntilJackpot?: number;
  postsPerJackpot?: number;
  /** Whether the jackpot is currently being won */
  isJackpotWon?: boolean;
  /** Optional refresh callback */
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

export default function JackpotWaveCard({
  amount = 0,
  postsUntilJackpot = 0,
  postsPerJackpot = 10,
  isJackpotWon = false,
  onRefresh,
  isLoading = false,
  className,
}: JackpotWaveCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayAmount, setDisplayAmount] = useState(amount);

  // Animate amount changes
  useEffect(() => {
    const duration = 600;
    const start = displayAmount;
    const diff = amount - start;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayAmount(start + diff * eased);
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [amount]);

  // Animated wave visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let animFrame: number;
    const waveData = Array.from({ length: 6 }).map(() => ({
      value: Math.random() * 0.5 + 0.1,
      targetValue: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.015 + 0.005,
    }));

    // Respect reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      // Draw static version
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    function resizeCanvas() {
      const rect = canvas!.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas!.width = rect.width;
        canvas!.height = rect.height;
      }
    }

    function updateWaveData() {
      waveData.forEach((data) => {
        if (Math.random() < 0.008) data.targetValue = Math.random() * 0.6 + 0.08;
        const diff = data.targetValue - data.value;
        data.value += diff * data.speed;
      });
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      waveData.forEach((data, i) => {
        const freq = data.value * 6;
        ctx!.beginPath();
        for (let x = 0; x < canvas!.width; x += 2) {
          const nx = (x / canvas!.width) * 2 - 1;
          const px = nx + i * 0.03 + freq * 0.02;
          const py =
            Math.sin(px * 8 + time) *
            Math.cos(px * 2.5) *
            freq *
            0.08 *
            ((i + 1) / 6);
          const y = (py + 1) * canvas!.height / 2;
          if (x === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        const intensity = Math.min(1, freq * 0.25);
        // Indigo wave colors matching project palette
        const r = 85 + intensity * 40;   // 85-125
        const g = 70 + intensity * 80;    // 70-150
        const b = 255 - intensity * 40;   // 255-215
        ctx!.lineWidth = 1 + i * 0.25;
        ctx!.strokeStyle = `rgba(${r},${g},${b},${0.15 + intensity * 0.2})`;
        ctx!.shadowColor = `rgba(${r},${g},${b},0.3)`;
        ctx!.shadowBlur = 4;
        ctx!.stroke();
        ctx!.shadowBlur = 0;
      });
    }

    function animate() {
      time += 0.015;
      updateWaveData();
      draw();
      animFrame = requestAnimationFrame(animate);
    }

    resizeCanvas();
    animate();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(animFrame);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={cn('glass-card relative overflow-hidden p-0', className)}>
      {/* Wave Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
      />

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#060609]/40 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#5546FF] to-[#fc6432] flex items-center justify-center shadow-lg shadow-[#5546FF]/20">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7s0 3 2.5 3H11" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7s0 3-2.5 3H13" />
                <path d="M6 15h12" />
                <path d="M12 11v8" />
                <path d="M8 19h8" />
              </svg>
            </div>
            <div>
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest">
                Cumulative Jackpot
              </p>
              <p className="text-zinc-600 text-[10px] uppercase tracking-[0.3em]">
                Next winner in {postsPerJackpot - postsUntilJackpot}/{postsPerJackpot} posts
              </p>
            </div>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={cn(
                'p-2 rounded-xl border border-white/10 glass hover:border-[#5546FF]/30 transition-all active:scale-[0.98]',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Refresh jackpot data"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  'text-zinc-500 transition-colors',
                  isLoading && 'animate-spin text-[#5546FF]',
                  !isLoading && 'hover:text-white'
                )}
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
            </button>
          )}
        </div>

        {/* Amount */}
        <div className="mb-6">
          <p
            className={cn(
              'text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight tabular-nums transition-all duration-500',
              isJackpotWon && 'text-amber-400 scale-110'
            )}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {displayAmount.toFixed(4)}
          </p>
          <p className="text-zinc-500 text-sm font-medium mt-2 uppercase tracking-[0.2em]">STX</p>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-500 text-xs uppercase tracking-widest">Next Trigger Progress</span>
            <span className="text-zinc-400 text-xs font-mono tabular-nums">
              {postsPerJackpot - postsUntilJackpot}/{postsPerJackpot}
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#5546FF] to-[#fc6432] rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${((postsPerJackpot - postsUntilJackpot) / postsPerJackpot) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all',
                isJackpotWon
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  isJackpotWon ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                )}
              />
              {isJackpotWon ? 'Winner!' : 'Live'}
            </span>
            <span className="text-zinc-600 text-xs">
              {postsPerJackpot - postsUntilJackpot === 0
                ? 'Jackpot triggering...'
                : `${postsUntilJackpot} posts until next payout`}
            </span>
          </div>

          {isJackpotWon && (
            <span className="text-amber-400/80 text-xs font-medium animate-pulse-subtle">
              🎉 90% payout to winner
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
