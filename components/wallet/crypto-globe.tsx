"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface Token {
  symbol: string;
  name: string;
  price: string;
  change: string;
  color: string;
  angle: number;
  heightOffset: number;
  radiusOffset: number;
}

const INITIAL_TOKENS: Token[] = [
  { symbol: "BTC", name: "Bitcoin", price: "$68,432.10", change: "+3.4%", color: "#f7931a", angle: 0, heightOffset: -50, radiusOffset: 20 },
  { symbol: "ETH", name: "Ethereum", price: "$3,850.45", change: "+5.1%", color: "#8c8cff", angle: Math.PI / 4, heightOffset: 45, radiusOffset: 10 },
  { symbol: "USDT", name: "Tether", price: "$1.00", change: "+0.01%", color: "#26a17b", angle: Math.PI / 2, heightOffset: -10, radiusOffset: 35 },
  { symbol: "SOL", name: "Solana", price: "$145.82", change: "+8.3%", color: "#14f195", angle: 3 * Math.PI / 4, heightOffset: 70, radiusOffset: 5 },
  { symbol: "BNB", name: "BNB Chain", price: "$595.30", change: "+2.7%", color: "#f3ba2f", angle: Math.PI, heightOffset: -80, radiusOffset: 15 },
  { symbol: "USDC", name: "USD Coin", price: "$1.00", change: "0.00%", color: "#2775ca", angle: 5 * Math.PI / 4, heightOffset: 10, radiusOffset: 25 },
  { symbol: "MATIC", name: "Polygon", price: "$0.72", change: "+4.9%", color: "#8247e5", angle: 3 * Math.PI / 2, heightOffset: -30, radiusOffset: 30 },
  { symbol: "LINK", name: "Chainlink", price: "$16.45", change: "+6.2%", color: "#375bd2", angle: 7 * Math.PI / 4, heightOffset: 30, radiusOffset: 25 },
];

export function CryptoGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [tokens, setTokens] = useState<Token[]>(INITIAL_TOKENS);
  const [projectedTokens, setProjectedTokens] = useState<Array<{
    token: Token;
    x: number;
    y: number;
    scale: number;
    opacity: number;
    zIndex: number;
  }>>([]);
  
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);

  // 3D rotation angles
  const angleYRef = useRef(0);
  const angleXRef = useRef(0.25); // Slight tilt downward
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const speedMultiplierRef = useRef(1); // To damp/accelerate rotation

  // Handle Drag / Rotate interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    
    angleYRef.current += deltaX * 0.006;
    angleXRef.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, angleXRef.current + deltaY * 0.006));
    
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Draw globe and project tokens in animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const updateGlobe = () => {
      // 1. Resize Canvas for HDPI Displays
      const width = containerRef.current?.clientWidth || 500;
      const height = containerRef.current?.clientHeight || 500;
      
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      
      ctx.clearRect(0, 0, width, height);

      // Sphere details
      const center = { x: width / 2, y: height / 2 };
      const isMobile = width < 640;
      const radius = Math.min(width, height) * (isMobile ? 0.22 : 0.32);
      const dist = 600; // perspective depth

      // 2. Slow auto rotation if not dragging & not hovering
      if (!isDraggingRef.current) {
        // Slow speed if hovered
        const targetSpeed = hoveredSymbol ? 0.15 : 1.0;
        speedMultiplierRef.current = gsap.utils.interpolate(speedMultiplierRef.current, targetSpeed, 0.08);
        
        angleYRef.current += 0.0035 * speedMultiplierRef.current;
      }

      // 3. Draw Globe Wireframe (Latitudes & Longitudes)
      ctx.lineWidth = 1;
      
      const rotY = angleYRef.current;
      const rotX = angleXRef.current;

      // Draw horizontal latitude rings
      const latCount = 8;
      for (let i = 1; i < latCount; i++) {
        const latAngle = (i / latCount) * Math.PI - Math.PI / 2;
        const latRadius = radius * Math.cos(latAngle);
        const yBase = radius * Math.sin(latAngle);

        ctx.beginPath();
        // Generate points for this circle
        const circlePoints = 48;
        for (let j = 0; j <= circlePoints; j++) {
          const theta = (j / circlePoints) * 2 * Math.PI;
          
          // Original point coordinates
          const x = latRadius * Math.cos(theta);
          const z = latRadius * Math.sin(theta);
          const y = yBase;

          // Rotate point around Y axis
          const xY = x * Math.cos(rotY) - z * Math.sin(rotY);
          const zY = x * Math.sin(rotY) + z * Math.cos(rotY);
          
          // Rotate point around X axis
          const yX = y * Math.cos(rotX) - zY * Math.sin(rotX);
          const zX = y * Math.sin(rotX) + zY * Math.cos(rotX);

          // Project to 2D
          const scale = dist / (dist + zX);
          const sx = center.x + xY * scale;
          const sy = center.y + yX * scale;

          if (j === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        
        // Dynamic opacity based on tilt and latitude
        const latColorOpacity = 0.06 + Math.abs(Math.sin(latAngle)) * 0.05;
        ctx.strokeStyle = `rgba(168, 85, 247, ${latColorOpacity})`;
        ctx.stroke();
      }

      // Draw vertical longitude rings
      const lonCount = 8;
      for (let i = 0; i < lonCount; i++) {
        const lonAngle = (i / lonCount) * Math.PI;

        ctx.beginPath();
        const circlePoints = 48;
        for (let j = 0; j <= circlePoints; j++) {
          const theta = (j / circlePoints) * 2 * Math.PI;

          // Point coordinates on longitudinal circle
          const x = radius * Math.cos(theta) * Math.cos(lonAngle);
          const z = radius * Math.cos(theta) * Math.sin(lonAngle);
          const y = radius * Math.sin(theta);

          // Rotate Y
          const xY = x * Math.cos(rotY) - z * Math.sin(rotY);
          const zY = x * Math.sin(rotY) + z * Math.cos(rotY);
          
          // Rotate X
          const yX = y * Math.cos(rotX) - zY * Math.sin(rotX);
          const zX = y * Math.sin(rotX) + zY * Math.cos(rotX);

          // Project to 2D
          const scale = dist / (dist + zX);
          const sx = center.x + xY * scale;
          const sy = center.y + yX * scale;

          if (j === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        
        ctx.strokeStyle = `rgba(6, 182, 212, 0.06)`;
        ctx.stroke();
      }

      // 4. Draw outer glows/atmospheres on Canvas
      const gradient = ctx.createRadialGradient(center.x, center.y, radius * 0.7, center.x, center.y, radius * 1.15);
      gradient.addColorStop(0, "rgba(168, 85, 247, 0.0)");
      gradient.addColorStop(0.6, "rgba(6, 182, 212, 0.04)");
      gradient.addColorStop(1, "rgba(168, 85, 247, 0.0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius * 1.25, 0, 2 * Math.PI);
      ctx.fill();

      // 5. Orbiting Tokens Logic and Projection
      const nextProjectedTokens = tokens.map((token) => {
        // Orbit speed (stops when hovered)
        let tokenAngleSpeed = 0.007;
        if (hoveredSymbol === token.symbol) {
          tokenAngleSpeed = 0;
        } else if (hoveredSymbol) {
          tokenAngleSpeed = 0.001; // slow down other tokens
        }
        
        token.angle += tokenAngleSpeed;

        // Base orbiting radius
        const orbitRadius = radius + (isMobile ? 25 : 40) + token.radiusOffset * (isMobile ? 0.5 : 1.0);
        
        // 3D position
        const tx = orbitRadius * Math.cos(token.angle);
        const tz = orbitRadius * Math.sin(token.angle);
        const ty = token.heightOffset * (isMobile ? 0.75 : 1.0);

        // Rotate token around Y-axis (globe rotation)
        const txY = tx * Math.cos(rotY) - tz * Math.sin(rotY);
        const tzY = tx * Math.sin(rotY) + tz * Math.cos(rotY);

        // Rotate token around X-axis
        const tyX = ty * Math.cos(rotX) - tzY * Math.sin(rotX);
        const tzX = ty * Math.sin(rotX) + tzY * Math.cos(rotX);

        // Project
        const scaleVal = dist / (dist + tzX);
        const projectedX = center.x + txY * scaleVal;
        const projectedY = center.y + tyX * scaleVal;

        // Compute normalized opacity and scale
        // Front has positive zX, back has negative zX.
        // Let's normalize it to [0, 1] range:
        const depth = (tzX + orbitRadius) / (2 * orbitRadius); // 0 (back) to 1 (front)
        
        // Make front tokens much larger and bright, back tokens smaller and faded
        const opacity = gsap.utils.interpolate(0.12, 1.0, depth);
        const scale = gsap.utils.interpolate(0.65, 1.15, depth) * (isMobile ? 0.72 : 1.0);
        const zIndex = Math.round(100 + tzX);

        return {
          token,
          x: projectedX,
          y: projectedY,
          scale,
          opacity,
          zIndex,
        };
      });

      setProjectedTokens(nextProjectedTokens);
      animationFrameId = requestAnimationFrame(updateGlobe);
    };

    updateGlobe();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [tokens, hoveredSymbol]);

  // Helper to draw custom token brand SVGs inside React nodes
  const renderLogo = (symbol: string, color: string) => {
    switch (symbol) {
      case "BTC":
        return (
          <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md text-sm shrink-0" style={{ backgroundColor: color }}>
            ₿
          </span>
        );
      case "ETH":
        return (
          <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md text-sm shrink-0" style={{ backgroundColor: color }}>
            Ξ
          </span>
        );
      case "USDT":
        return (
          <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md text-sm shrink-0" style={{ backgroundColor: color }}>
            ₮
          </span>
        );
      case "SOL":
        return (
          <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-900 shadow-md text-xs shrink-0" style={{ backgroundColor: color }}>
            S
          </span>
        );
      case "BNB":
        return (
          <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-950 shadow-md text-xs shrink-0" style={{ backgroundColor: color }}>
            🔶
          </span>
        );
      case "USDC":
        return (
          <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md text-xs shrink-0" style={{ backgroundColor: color }}>
            $
          </span>
        );
      case "MATIC":
        return (
          <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md text-xs shrink-0" style={{ backgroundColor: color }}>
            P
          </span>
        );
      default:
        return (
          <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md text-xs shrink-0" style={{ backgroundColor: color }}>
            {symbol.slice(0, 1)}
          </span>
        );
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[380px] sm:h-[480px] md:h-[500px] flex items-center justify-center select-none cursor-grab active:cursor-grabbing overflow-visible"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
    >
      {/* 3D Wireframe Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none drop-shadow-[0_0_50px_rgba(6,182,212,0.15)]"
      />

      {/* Orbiting HTML Token Badges */}
      {projectedTokens.map(({ token, x, y, scale, opacity, zIndex }) => {
        const isHovered = hoveredSymbol === token.symbol;
        
        return (
          <div
            key={token.symbol}
            className="absolute rounded-ui border transition-shadow duration-300 pointer-events-auto"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity: opacity,
              zIndex: zIndex,
              border: isHovered 
                ? `1.5px solid ${token.color}` 
                : `1px solid rgba(255, 255, 255, ${0.05 + opacity * 0.15})`,
              background: isHovered 
                ? "rgba(10, 15, 30, 0.95)" 
                : `rgba(9, 13, 22, ${0.4 + opacity * 0.45})`,
              backdropFilter: "blur(8px)",
              boxShadow: isHovered 
                ? `0 0 25px ${token.color}50` 
                : `0 10px 20px -8px rgba(0, 0, 0, ${0.3 * opacity})`,
            }}
            onMouseEnter={() => setHoveredSymbol(token.symbol)}
            onMouseLeave={() => setHoveredSymbol(null)}
          >
            {/* Inner Token Pill */}
            <div className="flex items-center gap-2.5 p-1.5 pr-3 cursor-pointer select-none">
              {renderLogo(token.symbol, token.color)}
              
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-none">{token.symbol}</span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5 leading-none">{token.name}</span>
              </div>

              {/* Expand Details on Hover */}
              {isHovered && (
                <div className="flex flex-col border-l border-white/10 pl-2 text-[10px] text-left leading-tight font-mono animate-[fadeIn_0.15s_ease-out]">
                  <span className="text-slate-300 font-bold">{token.price}</span>
                  <span className="text-mint font-semibold">{token.change}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Helper Center Hint */}
      <div className="absolute bottom-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none bg-black/35 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm">
        Drag to Rotate • Hover Tokens for Price
      </div>
    </div>
  );
}
