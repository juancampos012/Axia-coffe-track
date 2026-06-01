'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Mail, Phone, User, MessageSquare, FileText, Loader2 } from 'lucide-react';

export default function ContactUs() {
  const t = useTranslations('contactUs');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const particles = Array.from({ length: 55 }, () => ({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const name    = data.get('name')    as string || '';
    const email   = data.get('email')   as string || '';
    const phone   = data.get('phone')   as string || '';
    const subject = data.get('subject') as string || '';
    const message = data.get('message') as string || '';

    const text = encodeURIComponent(
      `¡Hola! Me comunico desde la web de *Axia Coffee Track* 👋\n\n` +
      `👤 *Nombre:* ${name}\n` +
      `📧 *Email:* ${email}\n` +
      (phone ? `📱 *Teléfono:* ${phone}\n` : '') +
      (subject ? `📌 *Asunto:* ${subject}\n` : '') +
      `\n💬 *Mensaje:*\n${message}`
    );
    window.open(`https://wa.me/573104654726?text=${text}`, '_blank');

    setSending(true);
    await new Promise(r => setTimeout(r, 800));
    setSending(false);
    setSent(true);
  };

  return (
    <section
      id="contact"
      className="relative min-h-screen flex items-center overflow-hidden py-32"
      style={{ background: '#04060f' }}
    >
      {/* Canvas partículas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Aurora top-left */}
      <div
        className="absolute pointer-events-none z-0"
        style={{
          width: 700, height: 550, top: -160, left: -140, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(30,60,139,0.32) 0%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'drift1 9s ease-in-out infinite alternate',
        }}
      />
      {/* Aurora bottom-right */}
      <div
        className="absolute pointer-events-none z-0"
        style={{
          width: 450, height: 380, bottom: -100, right: -80, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(19,39,90,0.26) 0%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'drift2 11s ease-in-out infinite alternate',
        }}
      />

      {/* Texto ghost de fondo */}
      <span
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0 whitespace-nowrap"
        style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 'clamp(90px, 14vw, 200px)',
          fontWeight: 800,
          color: 'rgba(30,60,139,0.07)',
          letterSpacing: '-0.05em',
          lineHeight: 1,
        }}
      >
        CONTACT
      </span>

      {/* Contenido */}
      <div
        className={`container mx-auto px-6 md:px-12 lg:px-20 relative z-10 transition-all duration-1000 ${
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm"
            style={{
              background: 'rgba(30,60,139,0.18)',
              border: '1px solid rgba(30,60,139,0.4)',
              color: 'rgba(74,127,255,0.9)',
              letterSpacing: '0.08em',
              fontFamily: 'Syne, sans-serif',
            }}
          >
            <span
              className="animate-pulse"
              style={{ width: 6, height: 6, background: '#4a7fff', borderRadius: '50%', display: 'inline-block' }}
            />
            Estamos para ayudarte
          </div>
        </div>

        {/* Título */}
        <h2
          className="text-center text-4xl md:text-5xl lg:text-6xl font-bold leading-none tracking-tighter mb-5 text-white"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {t('title')}
        </h2>
        <p
          className="text-center text-lg max-w-2xl mx-auto mb-16 leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          {t('description')}
        </p>

        {/* Tarjeta del formulario */}
        <div
          className="max-w-3xl mx-auto rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-md"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(30,60,139,0.3)',
          }}
        >
          {sent ? (
            /* Estado de éxito */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: 'rgba(74,127,255,0.15)', border: '1px solid rgba(74,127,255,0.3)' }}
              >
                <Send size={32} style={{ color: '#4a7fff' }} />
              </div>
              <h3
                className="text-2xl font-bold text-white mb-3"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                ¡Mensaje enviado!
              </h3>
              <p className="text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Te responderemos a la brevedad posible.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-8 px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all hover:opacity-80"
                style={{ border: '1px solid rgba(74,127,255,0.3)', color: 'rgba(74,127,255,0.8)' }}
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>

              {/* Nombre */}
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                  style={{ color: 'rgba(74,127,255,0.7)' }}
                >
                  <User size={11} /> Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder={t('form.name')}
                  required
                  className="w-full px-5 py-3.5 rounded-2xl text-sm text-white outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(30,60,139,0.35)',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(74,127,255,0.6)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(30,60,139,0.35)')}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                  style={{ color: 'rgba(74,127,255,0.7)' }}
                >
                  <Mail size={11} /> Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder={t('form.email')}
                  required
                  className="w-full px-5 py-3.5 rounded-2xl text-sm text-white outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(30,60,139,0.35)',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(74,127,255,0.6)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(30,60,139,0.35)')}
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                  style={{ color: 'rgba(74,127,255,0.7)' }}
                >
                  <Phone size={11} /> Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder={t('form.phone')}
                  className="w-full px-5 py-3.5 rounded-2xl text-sm text-white outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(30,60,139,0.35)',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(74,127,255,0.6)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(30,60,139,0.35)')}
                />
              </div>

              {/* Asunto */}
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                  style={{ color: 'rgba(74,127,255,0.7)' }}
                >
                  <FileText size={11} /> Asunto
                </label>
                <input
                  type="text"
                  name="subject"
                  placeholder={t('form.subject')}
                  className="w-full px-5 py-3.5 rounded-2xl text-sm text-white outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(30,60,139,0.35)',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(74,127,255,0.6)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(30,60,139,0.35)')}
                />
              </div>

              {/* Mensaje */}
              <div className="md:col-span-2 space-y-2">
                <label
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                  style={{ color: 'rgba(74,127,255,0.7)' }}
                >
                  <MessageSquare size={11} /> Mensaje
                </label>
                <textarea
                  name="message"
                  placeholder={t('form.message')}
                  required
                  rows={5}
                  className="w-full px-5 py-4 rounded-2xl text-sm text-white outline-none transition-all resize-none"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(30,60,139,0.35)',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(74,127,255,0.6)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(30,60,139,0.35)')}
                />
              </div>

              {/* Botón */}
              <div className="md:col-span-2 flex justify-center mt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-3 font-bold px-12 py-4 rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 active:scale-95 text-white disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)',
                    boxShadow: '0 8px 28px rgba(30,60,139,0.45)',
                    fontFamily: 'Syne, sans-serif',
                    fontSize: 15,
                    letterSpacing: '0.06em',
                  }}
                >
                  {sending
                    ? <><Loader2 size={18} className="animate-spin" /> Enviando...</>
                    : <>{t('form.send')} <Send size={16} /></>
                  }
                </button>
              </div>

            </form>
          )}
        </div>

        {/* Métricas inferiores — mismo estilo que el hero */}
        <div className="mt-16 flex flex-wrap justify-center gap-12">
          {[
            ['24h', 'Tiempo de respuesta'],
            ['100%', 'Atención personalizada'],
            ['Soporte', 'Técnico incluido'],
          ].map(([val, label]) => (
            <div key={val} className="flex flex-col items-center gap-1">
              <span className="text-xl font-bold" style={{ color: '#4a7fff', fontFamily: 'Syne, sans-serif' }}>{val}</span>
              <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes drift1 { from{transform:translate(0,0) scale(1)} to{transform:translate(50px,40px) scale(1.12)} }
        @keyframes drift2 { from{transform:translate(0,0) scale(1)} to{transform:translate(-40px,-50px) scale(1.09)} }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>
    </section>
  );
}
