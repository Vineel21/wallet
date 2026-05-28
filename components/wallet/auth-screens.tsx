"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowRight, BadgeCheck, Cpu, KeyRound, Lock, Mail, ShieldCheck, Sparkles, Unlock, User } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";
import { buttonPrimary } from "@/components/wallet/constants";
import { AuthCard, Field, FormError } from "@/components/wallet/ui";
import { RealWalletAnimation } from "@/components/wallet/real-wallet";

type AuthScreensProps = {
  route: string;
  formError: string;
  onRegister: (event: FormEvent<HTMLFormElement>) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onForgot: (event: FormEvent<HTMLFormElement>) => void;
  onReset: (event: FormEvent<HTMLFormElement>) => void;
};

export function AuthScreens({
  route,
  formError,
  onRegister,
  onLogin,
  onForgot,
  onReset
}: AuthScreensProps) {

  // GSAP-powered floating and orbiting animations
  useGSAP(() => {
    // Rotation of Orbit SVG circles
    gsap.to(".orbit-ring-outer", { rotate: 360, transformOrigin: "50% 50%", duration: 35, repeat: -1, ease: "none" });
    gsap.to(".orbit-ring-mid", { rotate: -360, transformOrigin: "50% 50%", duration: 25, repeat: -1, ease: "none" });
    gsap.to(".orbit-ring-inner", { rotate: 360, transformOrigin: "50% 50%", duration: 15, repeat: -1, ease: "none" });

    // Floating of token coins
    gsap.to(".coin-btc", { y: -8, x: 4, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(".coin-eth", { y: 10, x: -6, duration: 3.4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.3 });
    gsap.to(".coin-sol", { y: -12, x: -4, duration: 3.0, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.6 });
    gsap.to(".coin-ledger", { y: 6, x: 8, duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.9 });
  });

  return (
    <>
      {/* Left panel: Wallet related animation */}
      <section className="hidden lg:flex flex-col justify-between p-12 bg-[#03050c]/80 relative overflow-hidden border-r border-white/5">
        {/* Decorative blur elements inside the animation panel */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-purple/10 blur-[100px] pointer-events-none -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 rounded-full bg-cyan/5 blur-[90px] pointer-events-none -z-10" />

        {/* Top brand heading */}
        <Link href="/" className="flex w-fit items-center gap-3 select-none rounded-ui transition-opacity hover:opacity-85 focus-ring">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan/40 bg-cyan/10 text-lg font-black text-cyan shadow-cyanGlow">
            W
          </span>
          <span className="grid gap-0.5">
            <strong className="leading-none text-white tracking-wider font-display text-lg">Wallax</strong>
            <span className="text-[10px] font-semibold text-slate-500 font-mono uppercase tracking-wider">Self-Custody</span>
          </span>
        </Link>

        {/* Animation Arena */}
        <div className="flex-1 flex flex-col items-center justify-center relative py-12 select-none">
          {/* Rotating Orbit Rings (SVGs) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
            <svg className="w-[450px] h-[450px] text-white/5" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="4 8"
                className="orbit-ring-outer"
              />
              <circle
                cx="50"
                cy="50"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="2 4"
                className="orbit-ring-mid"
              />
              <circle
                cx="50"
                cy="50"
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="1 6"
                className="orbit-ring-inner"
              />
            </svg>
          </div>

          {/* Real Wallet Pocket (New Animation) */}
          <div className="relative w-[340px] h-[340px] z-10 flex items-center justify-center">
            <RealWalletAnimation />
          </div>

          {/* Floating Cryptographic Assets / Tokens */}
          {/* Bitcoin Token */}
          <div className="coin-btc absolute top-[22%] left-[24%] h-12 w-12 rounded-full border border-amber/35 bg-amber/10 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.15)] flex items-center justify-center flex-col z-20">
            <span className="text-[9px] text-amber font-bold font-mono">BTC</span>
            <span className="text-[7px] text-slate-400 font-mono mt-0.5">SHA256</span>
          </div>

          {/* Ethereum Token */}
          <div className="coin-eth absolute bottom-[18%] right-[22%] h-12 w-12 rounded-full border border-purple/35 bg-purple/10 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.15)] flex items-center justify-center flex-col z-20">
            <span className="text-[9px] text-purple-300 font-bold font-mono">ETH</span>
            <span className="text-[7px] text-slate-400 font-mono mt-0.5">ERC20</span>
          </div>

          {/* Solana Token */}
          <div className="coin-sol absolute top-[30%] right-[18%] h-12 w-12 rounded-full border border-cyan/35 bg-cyan/10 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.15)] flex items-center justify-center flex-col z-20">
            <span className="text-[9px] text-cyan font-bold font-mono">SOL</span>
            <span className="text-[7px] text-slate-400 font-mono mt-0.5">SPL</span>
          </div>

          {/* Ledger Connection Hub */}
          <div className="coin-ledger absolute bottom-[25%] left-[20%] h-10 w-10 rounded-full border border-mint/35 bg-mint/10 backdrop-blur-md shadow-[0_0_20px_rgba(53,226,138,0.15)] flex items-center justify-center flex-col z-20">
            <Cpu className="h-4 w-4 text-mint" />
          </div>

          {/* Glowing Status Text */}
          <div className="absolute bottom-[8%] text-center max-w-[280px]">
            <p className="text-xs text-slate-400 leading-relaxed font-outfit">
              Secure hardware-grade encryption. Your seed phrases are stored client-side and never broadcast to any server.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div>
          <p className="text-[10px] text-slate-500 font-mono">
            Wallax Protocol Gateway © 2026. Zero custodial risk.
          </p>
        </div>
      </section>

      {/* Right panel: Credentials card */}
      <section className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden bg-[#050814]/30 backdrop-blur-xl">
        {/* Glow backdrop behind form card */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple/10 blur-[120px] pointer-events-none -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan/5 blur-[100px] pointer-events-none -z-10" />

        <div className="w-full max-w-[540px] mx-auto z-10" data-animate>
          {/* Brand Icon Header inside form (only visible on mobile layout) */}
          <div className="flex flex-col items-center mb-5 text-center select-none lg:hidden">
            {/* Real Wallet pocket animation & Orbit rings inside a compact, responsive container! */}
            <div className="relative mx-auto -mt-5 -mb-1 flex h-[250px] w-full max-w-[360px] origin-center scale-[0.82] items-center justify-center overflow-visible pointer-events-auto sm:h-[280px] sm:scale-90">
              {/* Orbit rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                <svg className="h-[320px] w-[320px] text-white/5 sm:h-[360px] sm:w-[360px]" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeDasharray="4 8"
                    className="orbit-ring-outer"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeDasharray="2 4"
                    className="orbit-ring-mid"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeDasharray="1 6"
                    className="orbit-ring-inner"
                  />
                </svg>
              </div>

              {/* Real Wallet Pocket (New Animation) */}
              <div className="relative z-10 flex h-[320px] w-[320px] items-center justify-center">
                <RealWalletAnimation />
              </div>

              {/* Floating Cryptographic Assets / Tokens */}
              {/* Bitcoin Token */}
              <div className="coin-btc absolute left-[16%] top-[18%] z-20 flex h-12 w-12 flex-col items-center justify-center rounded-full border border-amber/35 bg-amber/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] backdrop-blur-md">
                <span className="text-[8px] text-amber font-bold font-mono">BTC</span>
              </div>

              {/* Ethereum Token */}
              <div className="coin-eth absolute bottom-[16%] right-[16%] z-20 flex h-12 w-12 flex-col items-center justify-center rounded-full border border-purple/35 bg-purple/10 shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-md">
                <span className="text-[8px] text-purple-300 font-bold font-mono">ETH</span>
              </div>

              {/* Solana Token */}
              <div className="coin-sol absolute right-[13%] top-[27%] z-20 flex h-12 w-12 flex-col items-center justify-center rounded-full border border-cyan/35 bg-cyan/10 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md">
                <span className="text-[8px] text-cyan font-bold font-mono">SOL</span>
              </div>
            </div>

            <Link href="/" className="group mt-2 rounded-ui px-2 py-1 focus-ring">
              <h1 className="text-2xl font-bold font-display text-white transition-colors group-hover:text-cyan">Wallax Wallet</h1>
              <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest transition-colors group-hover:text-slate-300">Decentralized Gateway</p>
            </Link>
          </div>

          {route === "login" && <LoginScreen formError={formError} onLogin={onLogin} />}
          {route === "register" && <RegisterScreen formError={formError} onRegister={onRegister} />}
          {route === "forgot" && <ForgotScreen formError={formError} onForgot={onForgot} />}
          {route === "reset" && <ResetScreen formError={formError} onReset={onReset} />}
        </div>
      </section>
    </>
  );
}

function RegisterScreen({
  formError,
  onRegister
}: {
  formError: string;
  onRegister: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AuthCard title="Create Wallet Profile" subtitle="Set up a secure profile to start managing your assets.">
      <form className="grid gap-4 mt-2" onSubmit={onRegister}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Your Name" name="name" placeholder="Alex Rivera" icon={User} required />
          <Field label="Email Address" name="email" type="email" placeholder="alex@example.com" icon={Mail} required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Security Password" name="password" type="password" placeholder="At least 8 characters" icon={Lock} required />
          <Field label="Confirm Password" name="confirmPassword" type="password" placeholder="Confirm password" icon={Lock} required />
        </div>
        <FormError message={formError} />

        <button className={`${buttonPrimary} mt-2 w-full`} type="submit">
          <BadgeCheck className="h-4 w-4" />
          Create Profile
        </button>
      </form>
      <div className="h-px bg-white/5 my-2" />
      <p className="text-xs text-center text-slate-400 font-mono">
        Already have a profile?{" "}
        <Link className="font-bold text-cyan hover:underline" href="/login">
          Unlock Wallet
        </Link>
      </p>
    </AuthCard>
  );
}

function LoginScreen({
  formError,
  onLogin
}: {
  formError: string;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AuthCard title="Unlock Wallet" subtitle="Enter your profile credentials to decrypt your storage ledger.">
      <form className="grid gap-4 mt-2" onSubmit={onLogin}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email Address" name="email" type="email" placeholder="you@example.com" icon={Mail} required />
          <Field label="Password" name="password" type="password" placeholder="••••••••" icon={Lock} required />
        </div>
        <FormError message={formError} />

        <button className={`${buttonPrimary} mt-2 w-full`} type="submit">
          <Unlock className="h-4 w-4" />
          Unlock Account
        </button>
      </form>
      <div className="h-px bg-white/5 my-2" />
      <div className="flex justify-between items-center gap-2 text-xs font-mono">
        <Link className="text-slate-500 hover:text-slate-300 transition-colors" href="/forgot">
          Forgot Password?
        </Link>
        <Link className="text-cyan hover:underline font-bold" href="/register">
          Create Profile
        </Link>
      </div>
    </AuthCard>
  );
}

function ForgotScreen({
  formError,
  onForgot
}: {
  formError: string;
  onForgot: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AuthCard title="Reset Password" subtitle="Send a secure password reset link to your email.">
      <form className="grid gap-4 mt-2" onSubmit={onForgot}>
        <Field label="Email Address" name="email" type="email" placeholder="you@domain.com" icon={Mail} required />
        <FormError message={formError} />
        <button className={`${buttonPrimary} mt-2 w-full`} type="submit">
          <KeyRound className="h-4 w-4" />
          Send Reset Link
        </button>
      </form>
      <div className="h-px bg-white/5 my-2" />
      <Link className="text-xs text-center text-slate-400 font-mono hover:text-white transition-colors" href="/login">
        Back to Unlock Screen
      </Link>
    </AuthCard>
  );
}

function ResetScreen({
  formError,
  onReset
}: {
  formError: string;
  onReset: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AuthCard title="Update Password" subtitle="Enter your new password after opening the reset link from your email.">
      <form className="grid gap-4 mt-2" onSubmit={onReset}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="New Password" name="password" type="password" placeholder="At least 8 characters" icon={Lock} required />
          <Field label="Confirm New Password" name="confirmPassword" type="password" placeholder="Repeat new password" icon={Lock} required />
        </div>
        <FormError message={formError} />
        <button className={`${buttonPrimary} mt-2 w-full`} type="submit">
          <KeyRound className="h-4 w-4" />
          Update Password
        </button>
      </form>
    </AuthCard>
  );
}
