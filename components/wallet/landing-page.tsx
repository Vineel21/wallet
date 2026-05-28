"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, BadgeCheck, Cpu, Layers, ShieldCheck, Sparkles, Zap, Copy, Check, Globe } from "lucide-react";
import { buttonPrimary, buttonSecondary } from "@/components/wallet/constants";
import { Brand } from "@/components/wallet/ui";
import { CryptoGlobe } from "@/components/wallet/crypto-globe";

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pointerActiveRef = useRef(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText("bc1qj7vzn203sm0glqyhxt9x89p3mevdq4z7972hcs");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Card 3D tilt animation for mouse hover and touch drag.
  const tiltCard = (clientX: number, clientY: number, isTouch = false) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Normalize coordinates (-0.5 to 0.5)
    const px = (x / rect.width) - 0.5;
    const py = (y / rect.height) - 0.5;
    
    // Tilt angle
    const maxTilt = window.innerWidth < 640 ? 16 : 24;
    const rotateX = -py * maxTilt;
    const rotateY = px * maxTilt;
    
    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 1200,
      ease: "power2.out",
      duration: isTouch ? 0.16 : 0.3
    });
  };

  const resetCardTilt = () => {
    const card = cardRef.current;
    if (!card) return;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      ease: "power3.out",
      duration: 0.7
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" && !pointerActiveRef.current) return;
    tiltCard(e.clientX, e.clientY, e.pointerType !== "mouse");
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a")) return;
    pointerActiveRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    tiltCard(e.clientX, e.clientY, e.pointerType !== "mouse");
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerActiveRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    resetCardTilt();
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") {
      resetCardTilt();
    }
  };

  useGSAP(() => {
    // Reveal animations
    const tl = gsap.timeline();
    tl.fromTo(".landing-header", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" })
      .fromTo(".hero-tag", { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }, "-=0.2")
      .fromTo(".hero-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power4.out" }, "-=0.3")
      .fromTo(".hero-desc", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.4")
      .fromTo(".hero-ctas", { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, "-=0.3")
      .fromTo(".hero-visual", { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: "power3.out" }, "-=0.5");

    gsap.fromTo(".feature-card", 
      { y: 30, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.6, 
        stagger: 0.1, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".feature-grid",
          start: "top 80%"
        }
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen max-w-full overflow-x-hidden text-slate-100 flex flex-col font-outfit relative bg-[#03050c] wallet-grid-bg">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple/10 blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-cyan/5 blur-[100px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="landing-header sticky top-0 z-50 border-b border-white/5 bg-ink/75 px-3 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-7xl min-w-0 items-center justify-between gap-2">
          <Brand title="WALLAX" subtitle="Crypto Wallet" />
          
          <div className="hidden items-center gap-6 lg:flex font-mono text-xs text-slate-400">
            <span className="flex items-center gap-1.5 rounded-full border border-cyan/35 bg-cyan/5 px-3 py-1 text-[11px] font-bold text-cyan shadow-cyanGlow">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-ping" />
              100+ Networks Connected
            </span>
            <span className="h-4 w-px bg-white/10" />
            <span>Non-Custodial Gateway</span>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link href="/login" className={`${buttonSecondary} !min-h-[36px] !px-3 !py-2 !text-xs sm:!min-h-[38px] sm:!px-4 sm:!text-sm`}>
              Unlock
            </Link>
            <Link href="/register" className={`${buttonPrimary} !min-h-[36px] !px-3 !py-2 !text-xs sm:!min-h-[38px] sm:!px-4 sm:!text-sm`}>
              <span className="sm:hidden">Create</span>
              <span className="hidden sm:inline">Create Wallet</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-24">
          {/* Hero Content */}
          <div className="flex flex-col items-start gap-6">
            <div className="hero-tag inline-flex max-w-full items-center gap-2 rounded-full border border-cyan/20 bg-cyan/5 px-3 py-1.5 text-[11px] font-bold text-cyan uppercase tracking-wider sm:text-xs">
              <Zap className="h-3.5 w-3.5 shrink-0 fill-cyan/20" />
              <span className="min-w-0 whitespace-normal leading-snug">True self-custody. True crypto freedom.</span>
            </div>
            
            <h1 className="hero-title font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-white text-left">
              Secure & private <br />
              multi-chain <br />
              <span className="bg-gradient-to-r from-purple via-pink to-cyan bg-clip-text text-transparent">
                crypto wallet.
              </span>
            </h1>
            
            <p className="hero-desc max-w-lg text-slate-400 text-base leading-relaxed text-left">
              Take absolute control of your digital tokens, coins, and collectibles. Wallax encrypts your private keys and recovery phrases directly on your device, giving you a private gateway to the decentralized web.
            </p>

            <div className="hero-ctas flex flex-wrap gap-3 mt-2">
              <Link href="/register" className={buttonPrimary}>
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className={buttonSecondary}>
                Unlock Profile
              </Link>
            </div>

            {/* Quick stats */}
            <div className="hero-desc grid grid-cols-3 gap-6 border-t border-white/5 pt-8 w-full max-w-md mt-4 text-left">
              <div>
                <strong className="block text-2xl font-bold font-display text-white">100K+</strong>
                <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Assets Supported</span>
              </div>
              <div>
                <strong className="block text-2xl font-bold font-display text-white">0%</strong>
                <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Wallet Fees</span>
              </div>
              <div>
                <strong className="block text-2xl font-bold font-display text-white">100+</strong>
                <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Blockchains</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="hero-visual flex w-full min-w-0 flex-col items-center justify-center lg:justify-self-end">
            {/* 3D Tilting Card */}
            <div 
              className="perspective-1000 preserve-3d w-full max-w-[340px] touch-pan-y cursor-pointer xs:max-w-[380px] sm:max-w-[480px]"
              onPointerCancel={handlePointerEnd}
              onPointerDown={handlePointerDown}
              onPointerLeave={handlePointerLeave}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
            >
              <div 
                ref={cardRef}
                className="relative h-[270px] w-full rounded-ui bg-gradient-to-br from-purple via-pink to-cyan p-[1.5px] shadow-glow will-change-transform sm:h-[280px]"
              >
                <div className="w-full h-full rounded-[11px] bg-[#050814] p-4 xs:p-5 sm:p-8 flex flex-col justify-between backdrop-blur-md relative overflow-hidden text-left">
                  {/* Sheen backdrop */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple/10 via-cyan/10 to-transparent pointer-events-none" />
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-cyan/5 blur-3xl pointer-events-none" />
                  
                  <div className="flex justify-between items-start z-10">
                    <div>
                      <span className="text-[10px] font-bold text-cyan/85 tracking-widest font-mono uppercase sm:text-[11px]">Multi-Chain Security Pass</span>
                      <h4 className="text-xl sm:text-2xl font-black font-display text-white mt-1.5">Personal Account</h4>
                    </div>
                    <span className="h-10 w-10 shrink-0 rounded-ui border border-white/10 bg-white/5 flex items-center justify-center font-display text-white font-black text-base shadow-inner sm:h-11 sm:w-11">W</span>
                  </div>

                  {/* EMV Card Chip & Contacts Graphic */}
                  <div className="flex items-center justify-between z-10">
                    <div className="w-12 h-9 rounded bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 p-[1px] opacity-85 shadow-md relative overflow-hidden">
                      <div className="w-full h-full bg-[#1c1507] rounded-[3px] p-1 grid grid-cols-3 gap-0.5 opacity-90">
                        <div className="border border-yellow-500/35 rounded-sm"></div>
                        <div className="border border-yellow-500/35 rounded-sm"></div>
                        <div className="border border-yellow-500/35 rounded-sm"></div>
                        <div className="border border-yellow-500/35 rounded-sm col-span-3"></div>
                        <div className="border border-yellow-500/35 rounded-sm"></div>
                        <div className="border border-yellow-500/35 rounded-sm"></div>
                        <div className="border border-yellow-500/35 rounded-sm"></div>
                      </div>
                    </div>
                    
                    {/* Contactless symbol */}
                    <div className="flex gap-0.5 text-slate-600 rotate-90 transform mr-2 opacity-50">
                      <span className="w-1 h-3 border-r border-white/40 rounded-full"></span>
                      <span className="w-1.5 h-3 border-r border-white/40 rounded-full"></span>
                      <span className="w-2 h-3 border-r border-white/40 rounded-full"></span>
                    </div>
                  </div>

                  <div className="z-10 min-w-0">
                    {/* Interactive Copyable Address */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] xs:text-xs sm:text-sm font-mono text-slate-400 select-all truncate">bc1qj7vzn203sm0glqyhxt9x89p3mevdq4z7972hcs</span>
                      <button 
                        onClick={handleCopyAddress}
                        className="p-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan/40 hover:text-cyan transition-all duration-200 shrink-0"
                        title="Copy Address"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-mint" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    <div className="flex justify-between items-end mt-2.5">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Total Portfolio</span>
                        <span className="text-xl xs:text-2xl sm:text-3.5xl font-black text-white font-display block leading-none mt-1 shadow-glow">$42,918.64 <span className="text-xs sm:text-sm text-slate-500 font-mono font-normal">USD</span></span>
                      </div>
                      <span className="shrink-0 text-[11px] font-mono text-mint font-bold flex items-center gap-1 bg-mint/5 px-2 py-1 rounded-full border border-mint/20 shadow-glow sm:text-xs sm:px-2.5">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Secured
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Globe Section */}
        <section className="border-t border-white/5 bg-[#04060f]/60 py-16 px-4 relative overflow-hidden sm:px-6 sm:py-20">
          {/* Neon background effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan/5 blur-[120px] pointer-events-none -z-10 animate-pulse" />
          
          <div className="mx-auto grid max-w-7xl min-w-0 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Content Column */}
            <div className="lg:col-span-5 flex flex-col items-start gap-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple/20 bg-purple/5 px-3 py-1.5 text-xs font-bold text-purple uppercase tracking-wider">
                <Globe className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                GLOBAL LEDGER HUB
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight leading-tight">
                Connect Globally.<br />
                Secure Locally.
              </h2>
              
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Experience a truly decentralized ecosystem. Wallax interfaces natively with nodes across the globe, allowing you to route asset transfers, track real-time valuations, and audit history locally on your hardware.
              </p>

              <div className="grid gap-4 w-full mt-2">
                <div className="flex gap-3 items-start">
                  <div className="h-7 w-7 rounded-full bg-cyan/10 border border-cyan/25 flex items-center justify-center text-cyan text-xs font-mono shrink-0">1</div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-display">Gas-Optimized Smart Routing</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Dynamically checks gas estimates across 100+ networks to calculate the cheapest bridging routes.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="h-7 w-7 rounded-full bg-pink/10 border border-pink/25 flex items-center justify-center text-pink text-xs font-mono shrink-0">2</div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-display">Zero-Knowledge Decryption</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Secrets are decrypted on the fly in sandboxed runtime, leaving zero digital trail on the network.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="h-7 w-7 rounded-full bg-purple/10 border border-purple/25 flex items-center justify-center text-purple text-xs font-mono shrink-0">3</div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-display">Unified Cryptographic Proofs</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Validate transaction receipts with locally computed SHA-256 hashes verified on public chains.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Globe Column */}
            <div className="lg:col-span-7 flex justify-center w-full min-w-0 relative overflow-hidden">
              <CryptoGlobe />
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section className="border-t border-white/5 bg-ink/30 py-20 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">Own your assets. Explore Web3.</h2>
              <p className="text-slate-400 mt-3 text-sm">
                No third parties, no limits. Your assets stay completely yours at all times.
              </p>
            </div>

            <div className="feature-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-left">
              <div className="feature-card glass-panel p-6 rounded-ui flex flex-col justify-between min-h-[220px]">
                <div className="h-10 w-10 rounded-ui bg-purple/10 border border-purple/30 flex items-center justify-center text-purple">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mt-4 font-display">True Self-Custody</h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    Your keys, your crypto. Private recovery phrases and credentials stay encrypted locally in your browser storage. Nobody else can freeze your accounts or access your funds.
                  </p>
                </div>
              </div>

              <div className="feature-card glass-panel p-6 rounded-ui flex flex-col justify-between min-h-[220px]">
                <div className="h-10 w-10 rounded-ui bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mt-4 font-display">Multi-Chain Native</h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    Natively connect to Ethereum, Solana, Bitcoin, Polygon, and BNB Chain. Manage all your assets in one unified dashboard without manual network configuration.
                  </p>
                </div>
              </div>

              <div className="feature-card glass-panel p-6 rounded-ui flex flex-col justify-between min-h-[220px] sm:col-span-2 lg:col-span-1">
                <div className="h-10 w-10 rounded-ui bg-pink/10 border border-pink/30 flex items-center justify-center text-pink">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mt-4 font-display">Real-Time Insights</h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    Enjoy lightning-fast balance updates, live transaction history tracking, and a secure cryptographic audit log designed to keep you fully informed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-ink py-8 px-6 text-center">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-mono">
            Wallax Wallet © 2026. Non-custodial ledger gateway. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/login" className="text-xs text-slate-400 hover:text-white font-mono">Sign In</Link>
            <Link href="/register" className="text-xs text-slate-400 hover:text-white font-mono">Register Local Profile</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
