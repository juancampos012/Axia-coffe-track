'use client';
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Hero() {
  const [isMounted, setIsMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.1 + 0.3, vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2, a: Math.random() * 0.3 + 0.07,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74,127,255,${p.a})`; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: '#04060f' }}>
      {/* Canvas partículas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ mixBlendMode: 'screen' }} />

      {/* Auroras */}
      <div className="absolute pointer-events-none z-0" style={{ width: 600, height: 500, top: -150, left: -120, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(30,60,139,0.35) 0%, transparent 70%)', filter: 'blur(90px)', animation: 'drift1 9s ease-in-out infinite alternate' }} />
      <div className="absolute pointer-events-none z-0" style={{ width: 400, height: 350, bottom: -80, right: -60, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(19,39,90,0.28) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'drift2 11s ease-in-out infinite alternate' }} />

      {/* Texto fantasma de fondo */}
      <span className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(120px, 18vw, 220px)', fontWeight: 800, color: 'rgba(30,60,139,0.08)', letterSpacing: '-0.05em', lineHeight: 1 }}>AXIA</span>

      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10 pt-20">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className={`md:col-span-7 transition-all duration-1000 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm mb-6"
              style={{ background: 'rgba(30,60,139,0.18)', border: '1px solid rgba(30,60,139,0.4)', color: 'rgba(74,127,255,0.9)', letterSpacing: '0.08em' }}
            >
              <span className="animate-pulse" style={{ width: 6, height: 6, background: '#4a7fff', borderRadius: '50%', display: 'inline-block' }} />
              Especializado en Café
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-none tracking-tighter mb-6 text-white"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              La tecnología que tu{' '}
              <span style={{ color: '#4a7fff' }}>compraventa</span> merece.
            </h1>

            <p className="text-xl max-w-2xl mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Axia Coffee Track automatiza el cálculo de Factor de Rendimiento, gestiona inventarios en bodega y asegura que cada gramo cuente.
            </p>

            <button
              className="inline-flex items-center gap-3 font-bold px-10 py-4 rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 active:scale-95 text-white"
              style={{
                background: 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)',
                boxShadow: '0 8px 28px rgba(30,60,139,0.45)',
                fontFamily: 'Syne, sans-serif',
                fontSize: 16,
                letterSpacing: '0.03em',
              }}
            >
              Digitalizar mi Negocio <span className="group-hover:translate-x-1 transition">→</span>
            </button>

            <div className="mt-12 grid grid-cols-3 gap-4">
              {[['100%', 'Precisión'], ['Auto', 'Cálculos'], ['Cloud', 'Desde cualquier lugar']].map(([val, label]) => (
                <div key={val} className="flex flex-col gap-1">
                  <span className="text-lg font-bold" style={{ color: '#4a7fff', fontFamily: 'Syne, sans-serif' }}>{val}</span>
                  <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`md:col-span-5 transition-all duration-1000 delay-300 ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="relative">
              <div className="absolute -inset-4 rounded-full" style={{ background: 'rgba(30,60,139,0.2)', filter: 'blur(40px)' }} />
              <Image
                src="/Images/WhatsApp Image 2026-04-29 at 11.22.38-Photoroom.png"
                alt="Axia Coffee Track Interface"
                width={600} height={600}
                className="relative z-10"
                style={{ filter: 'drop-shadow(0 20px 50px rgba(30,60,139,0.4))' }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes drift1 { from{transform:translate(0,0) scale(1)} to{transform:translate(50px,40px) scale(1.12)} }
        @keyframes drift2 { from{transform:translate(0,0) scale(1)} to{transform:translate(-40px,-50px) scale(1.09)} }
      `}</style>
    </section>
  );
}