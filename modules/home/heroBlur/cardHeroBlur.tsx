import React from 'react';

interface CardHeroBlurProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function CardHeroBlur({ icon, title, description }: CardHeroBlurProps) {
  return (
    <div
      className="flex flex-col p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'rgba(10,15,35,0.6)',
        border: '1px solid rgba(30,60,139,0.25)',
        backdropFilter: 'blur(12px)',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(74,127,255,0.4)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(30,60,139,0.25)')}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(30,60,139,0.2)', border: '1px solid rgba(30,60,139,0.35)' }}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif', fontSize: 15 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}