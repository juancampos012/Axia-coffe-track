"use client";
import React, { useEffect, useRef } from "react";
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft } from 'lucide-react';
import LoginBox from "./LoginBox";

const ScreenLogin: React.FC = () => {
  const t = useTranslations('login');
  const locale = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      a: Math.random() * 0.35 + 0.08,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74,127,255,${p.a})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="min-h-screen w-full flex flex-row items-center justify-center relative overflow-hidden"
      style={{ background: '#04060f' }}
    >
      {/* ── Canvas partículas ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* ── Aurora 1 (izquierda arriba) ── */}
      <div
        className="absolute pointer-events-none z-0"
        style={{
          width: 600, height: 500, top: -150, left: -120, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(30,60,139,0.32) 0%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'drift1 9s ease-in-out infinite alternate',
        }}
      />
      {/* ── Aurora 2 (derecha abajo) ── */}
      <div
        className="absolute pointer-events-none z-0"
        style={{
          width: 450, height: 380, bottom: -100, right: -80, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(19,39,90,0.28) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'drift2 11s ease-in-out infinite alternate',
        }}
      />
      {/* ── Aurora 3 (centro) ── */}
      <div
        className="absolute pointer-events-none z-0"
        style={{
          width: 300, height: 220, top: '38%', left: '42%', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(30,60,139,0.14) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'drift3 13s ease-in-out infinite alternate',
        }}
      />

      {/* ── Back link ── */}
      <Link
        href={`/${locale}/`}
        className="absolute top-6 left-6 flex items-center gap-2 z-10 transition-colors text-sm tracking-wide"
        style={{ color: 'rgba(255,255,255,0.3)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToHome")}
      </Link>

      {/* ── Layout principal ── */}
      <div className="relative z-10 w-full max-w-5xl flex flex-row items-center justify-between px-8 lg:px-16">

        {/* Panel izquierdo: Logo */}
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="relative flex items-center justify-center">
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 260, height: 260,
                background: 'radial-gradient(circle, rgba(30,60,139,0.35) 0%, transparent 65%)',
                filter: 'blur(4px)',
                animation: 'pulseGlow 4.5s ease-in-out infinite',
              }}
            />
            <Image
              src="/Images/logo_blanco.png"
              alt="Logo"
              width={170}
              height={95}
              className="relative"
              style={{ filter: 'drop-shadow(0 0 28px rgba(74,127,255,0.22))' }}
            />
          </div>
          <p
            className="mt-6 text-xs tracking-[0.2em] uppercase"
            style={{ color: 'rgba(255,255,255,0.20)' }}
          >
          </p>
        </div>

        {/* Línea divisoria */}
        <div className="relative h-64 w-px hidden lg:flex flex-col items-center justify-center flex-shrink-0 mx-8">
          <div
            className="w-px h-full"
            style={{
              background: 'linear-gradient(to bottom, transparent, rgba(30,60,139,0.6) 30%, rgba(74,127,255,0.7) 50%, rgba(30,60,139,0.6) 70%, transparent)',
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 6, height: 6,
              background: 'rgba(74,127,255,0.95)',
              boxShadow: '0 0 12px rgba(74,127,255,0.9), 0 0 28px rgba(30,60,139,0.6)',
              animation: 'dotPulse 3s ease-in-out infinite',
            }}
          />
        </div>

        {/* Panel derecho: Formulario */}
        <div className="flex-1 flex justify-center items-center">
          <div className="w-full max-w-sm">
            <div
              className="rounded-2xl p-px"
              style={{
                background: 'linear-gradient(135deg, rgba(30,60,139,0.55) 0%, rgba(19,39,90,0.2) 45%, rgba(74,127,255,0.22) 100%)',
              }}
            >
              <div
                className="rounded-[15px] p-2"
                style={{ background: 'rgba(4,6,18,0.90)', backdropFilter: 'blur(24px)' }}
              >
                <LoginBox />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes drift1 {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(50px, 40px) scale(1.12); }
        }
        @keyframes drift2 {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(-40px,-50px) scale(1.09); }
        }
        @keyframes drift3 {
          from { transform: translate(0,0); }
          to   { transform: translate(-25px, 30px); }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.65; }
          50%       { transform: scale(1.14); opacity: 1; }
        }
        @keyframes dotPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(74,127,255,0.6); }
          50%       { box-shadow: 0 0 20px rgba(74,127,255,1), 0 0 36px rgba(30,60,139,0.65); }
        }
      `}</style>
    </div>
  );
};

export default ScreenLogin;