"use client";

import { useState, useRef } from "react";
import { ShieldCheck } from "lucide-react";
import gsap from "gsap";

export function RealWalletAnimation() {
  const [hovered, setHovered] = useState(false);
  const walletRef = useRef<HTMLDivElement>(null);

  // Mouse tilt tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const wallet = walletRef.current;
    if (!wallet) return;
    const rect = wallet.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize coordinates (-0.5 to 0.5)
    const px = (x / rect.width) - 0.5;
    const py = (y / rect.height) - 0.5;
    
    gsap.to(wallet, {
      rotateX: -py * 24,
      rotateY: px * 24,
      transformPerspective: 1000,
      ease: "power2.out",
      duration: 0.3
    });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    const wallet = walletRef.current;
    if (!wallet) return;
    gsap.to(wallet, {
      rotateX: 0,
      rotateY: 0,
      ease: "power3.out",
      duration: 0.8
    });
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  return (
    <div 
      className="relative w-full h-[320px] sm:h-[340px] flex items-center justify-center select-none"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dynamic 3D Wallet Structure */}
      <div 
        ref={walletRef}
        className="relative w-[280px] h-[190px] preserve-3d cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Wallet Back Leather Fold */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1b2238] to-[#0d111d] border border-white/10 shadow-[0_20px_45px_-8px_rgba(0,0,0,0.8)]" />
        
        {/* Neon stitch line at the top and bottom back fold */}
        <div className="absolute top-1 left-2 right-2 border-t border-dashed border-purple/35 pointer-events-none" />
        <div className="absolute bottom-1 left-2 right-2 border-b border-dashed border-purple/35 pointer-events-none" />

        {/* Tucked Security Card (Peeks out of the pocket) */}
        <div 
          className="absolute left-6 right-6 bottom-6 h-[150px] rounded-xl bg-gradient-to-br from-purple via-pink to-cyan p-[1px] transition-all duration-500 ease-out z-10"
          style={{
            transform: hovered ? "translateY(-45px) scale(1.02)" : "translateY(0px) scale(1.0)",
            boxShadow: hovered ? "0 0 25px rgba(6,182,212,0.3)" : "none"
          }}
        >
          <div className="w-full h-full rounded-[11px] bg-[#050814] p-4 flex flex-col justify-between overflow-hidden relative text-left">
            {/* Sheen effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple/10 to-transparent pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8px] font-bold text-cyan/80 tracking-widest font-mono uppercase">Multi-Chain Pass</span>
                <h5 className="text-[11px] font-black font-display text-white mt-0.5 leading-none">Sovereign Vault</h5>
              </div>
              <span className="h-6 w-6 rounded border border-white/10 bg-white/5 flex items-center justify-center font-display text-white font-black text-[10px]">W</span>
            </div>

            {/* EMV card chip - located in the peeking section so it's always visible */}
            <div className="w-8 h-6 rounded bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 p-[1px] opacity-90 shadow my-1">
              <div className="w-full h-full bg-[#181206] rounded-[2px] p-0.5 grid grid-cols-3 gap-0.5">
                <div className="border border-yellow-500/35 rounded-sm"></div>
                <div className="border border-yellow-500/35 rounded-sm"></div>
                <div className="border border-yellow-500/35 rounded-sm"></div>
                <div className="border border-yellow-500/35 rounded-sm col-span-3"></div>
                <div className="border border-yellow-500/35 rounded-sm"></div>
                <div className="border border-yellow-500/35 rounded-sm"></div>
              </div>
            </div>

            {/* Balance and check mark - hidden in slot, slides out on hover */}
            <div className="transition-opacity duration-300 mt-1" style={{ opacity: hovered ? 1 : 0 }}>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono block">PORTFOLIO</span>
              <div className="flex justify-between items-end">
                <span className="text-sm font-black text-white font-display mt-0.5">$42,918.64</span>
                <span className="text-[9px] font-mono text-mint font-bold flex items-center gap-0.5 bg-mint/5 px-1.5 py-0.5 rounded border border-mint/20">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  Secured
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Front Leather Pocket / Flap (Covers the lower half of the card) */}
        <div className="absolute left-0 right-0 bottom-0 h-[96px] rounded-b-2xl bg-gradient-to-b from-[#141929] to-[#0a0d16] border-t border-white/10 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.4)] flex flex-col justify-between p-4">
          {/* Stitch line on the pocket edge */}
          <div className="absolute top-1 left-2 right-2 border-t border-dashed border-cyan/25 pointer-events-none" />
          
          <div className="flex justify-between items-center z-10 mt-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-mint/10 border border-mint/25 flex items-center justify-center text-mint">
                <ShieldCheck className="h-4 w-4 animate-pulse" />
              </div>
              <div className="text-left">
                <span className="text-[8px] text-slate-500 font-mono block leading-none">HARDWARE LINK</span>
                <span className="text-[9px] text-mint font-bold font-mono mt-0.5 block leading-none">
                  {hovered ? "UNLOCKED PREVIEW" : "LOCKED VAULT"}
                </span>
              </div>
            </div>
            
            {/* Wallet clip/lock badge */}
            <div className="h-6 px-2 rounded-full border border-white/10 bg-white/5 flex items-center justify-center font-mono text-[8px] text-slate-400">
              {hovered ? "AES-256 SECURED" : "TAP TO REVEAL"}
            </div>
          </div>

          <div className="text-[8px] font-mono text-slate-500 text-left mt-1 border-t border-white/5 pt-1">
            SLOT 01 // MULTI-CHAIN SECURED
          </div>
        </div>
      </div>
    </div>
  );
}
