"use client";

import { useEffect, useMemo, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

export function ParticleConstellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 34 }, (_, index) => ({
        x: ((index * 37) % 100) / 100,
        y: ((index * 61) % 100) / 100,
        vx: (((index * 13) % 7) - 3) * 0.00022,
        vy: (((index * 19) % 7) - 3) * 0.00022,
        radius: 1.3 + ((index * 11) % 4) * 0.35
      })),
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrame = 0;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(rect.width * scale));
      const height = Math.max(1, Math.floor(rect.height * scale));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      context.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const coreRadius = Math.min(width, height) * 0.19;
      const haloRadius = Math.min(width, height) * 0.39;
      const gradient = context.createRadialGradient(centerX, centerY, coreRadius * 0.1, centerX, centerY, haloRadius);

      gradient.addColorStop(0, "rgba(6, 182, 212, 0.22)");
      gradient.addColorStop(0.5, "rgba(168, 85, 247, 0.09)");
      gradient.addColorStop(1, "rgba(3, 5, 12, 0)");

      context.fillStyle = gradient;
      context.beginPath();
      context.arc(centerX, centerY, haloRadius, 0, Math.PI * 2);
      context.fill();

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0.08 || particle.x > 0.92) particle.vx *= -1;
        if (particle.y < 0.08 || particle.y > 0.92) particle.vy *= -1;
      });

      for (let firstIndex = 0; firstIndex < particles.length; firstIndex += 1) {
        const first = particles[firstIndex];
        const firstX = first.x * width;
        const firstY = first.y * height;

        for (let secondIndex = firstIndex + 1; secondIndex < particles.length; secondIndex += 1) {
          const second = particles[secondIndex];
          const secondX = second.x * width;
          const secondY = second.y * height;
          const distance = Math.hypot(firstX - secondX, firstY - secondY);
          const maxDistance = Math.min(width, height) * 0.24;

          if (distance < maxDistance) {
            context.strokeStyle = `rgba(6, 182, 212, ${0.13 * (1 - distance / maxDistance)})`;
            context.lineWidth = scale;
            context.beginPath();
            context.moveTo(firstX, firstY);
            context.lineTo(secondX, secondY);
            context.stroke();
          }
        }
      }

      particles.forEach((particle) => {
        const x = particle.x * width;
        const y = particle.y * height;

        context.fillStyle = "rgba(241, 245, 249, 0.88)";
        context.shadowColor = "rgba(6, 182, 212, 0.7)";
        context.shadowBlur = 12 * scale;
        context.beginPath();
        context.arc(x, y, particle.radius * scale, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
      });

      context.strokeStyle = "rgba(168, 85, 247, 0.32)";
      context.lineWidth = scale;
      context.beginPath();
      context.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      context.stroke();

      animationFrame = window.requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [particles]);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
}
