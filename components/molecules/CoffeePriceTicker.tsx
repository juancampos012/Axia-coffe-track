'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Coffee,
} from 'lucide-react';

interface CoffeePrice {
  nyPrice: number;
  nyPriceUsd: number;
  trm: number;
  precioExcelso: number;
  estimatedCarga: number;
  kgCop: number;
  valorExcelso: number;
  valorPasilla: number;
  kgExcelso: number;
  kgPasilla: number;
  precioPasilla: number;
  factor: number;
  lastUpdated: string;
  source: string;
}

interface CoffeePriceTickerProps {
  variant?: 'home' | 'dashboard';
  customFactor?: number;
}

const fmtCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n);

const fmtUSD = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n);

export default function CoffeePriceTicker({
  variant = 'home',
  customFactor,
}: CoffeePriceTickerProps) {
  const [data, setData] = useState<CoffeePrice | null>(null);
  const [prev, setPrev] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [factor, setFactor] = useState(customFactor ?? 94);

  const load = useCallback(
    async (showLoader = false) => {
      if (showLoader) setLoading(true);
      setError(false);
      try {
        const res = await fetch('/api/coffee-price', { cache: 'no-store' });
        const json = await res.json();
        if (json.error) throw new Error();
        setPrev(data?.nyPrice ?? null);
        setData(json);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [data?.nyPrice]
  );

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setInterval(() => load(false), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [load]);

  const trend =
    prev !== null && data
      ? data.nyPrice > prev
        ? 'up'
        : data.nyPrice < prev
        ? 'down'
        : 'flat'
      : 'flat';

  // =====================================================
  // HOME
  // =====================================================

  if (variant === 'home') {
    return (
      <div
        className="flex flex-wrap items-center justify-center gap-6 px-6 py-4 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(30,60,139,0.25)',
        }}
      >
        <div className="flex items-center gap-2">
          <Coffee size={14} style={{ color: '#4a7fff' }} />
          <span
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Café NY
          </span>
        </div>

        {loading ? (
          <span className="text-xs font-mono text-slate-500 animate-pulse">
            Cargando...
          </span>
        ) : error ? (
          <span className="text-xs text-red-500/60">Sin conexión</span>
        ) : data ? (
          <>
            <div className="flex items-center gap-1.5">
              {trend === 'up' && <TrendingUp size={13} className="text-emerald-400" />}
              {trend === 'down' && <TrendingDown size={13} className="text-red-400" />}
              <span className="text-base font-black font-mono text-white">
                {data.nyPrice.toFixed(2)}
              </span>
              <span
                className="text-[10px] font-bold"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                USc/lb
              </span>
            </div>

            <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />

            <div className="flex items-center gap-1.5">
              <span
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                TRM
              </span>
              <span className="text-sm font-black font-mono text-white">
                {fmtCOP(data.trm)}
              </span>
            </div>

            <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />

            <div className="flex items-center gap-1.5">
              <span
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Carga ~
              </span>
              <span
                className="text-sm font-black font-mono"
                style={{ color: 'rgba(74,127,255,0.9)' }}
              >
                {fmtCOP(data.estimatedCarga)}
              </span>
            </div>

            <span
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              {new Date(data.lastUpdated).toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </>
        ) : null}

        <button
          onClick={() => load(true)}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          title="Actualizar"
        >
          <RefreshCw
            size={12}
            style={{ color: 'rgba(255,255,255,0.3)' }}
            className={loading ? 'animate-spin' : ''}
          />
        </button>
      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div
      className="rounded-[1.5rem] p-6 w-full"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(30,60,139,0.25)',
      }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(30,60,139,0.2)',
              border: '1px solid rgba(30,60,139,0.3)',
            }}
          >
            <Coffee size={15} style={{ color: '#4a7fff' }} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white">
              Precio del Café
            </p>
            <p
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Fórmula FNC · NYSE
            </p>
          </div>
        </div>
        <button
          onClick={() => load(true)}
          disabled={loading}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <RefreshCw
            size={14}
            style={{ color: 'rgba(255,255,255,0.3)' }}
            className={loading ? 'animate-spin' : ''}
          />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-xl animate-pulse"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-6 gap-3">
          <p className="text-sm text-red-400/70 font-bold">
            No se pudo obtener el precio
          </p>
          <button
            onClick={() => load(true)}
            className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-colors"
            style={{
              border: '1px solid rgba(74,127,255,0.3)',
              color: '#4a7fff',
            }}
          >
            Reintentar
          </button>
        </div>
      ) : data ? (
        <>
          {/* MÉTRICAS */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(30,60,139,0.2)',
              }}
            >
              <p
                className="text-[9px] font-black uppercase tracking-widest mb-1"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                Bolsa NY
              </p>
              <div className="flex items-center gap-1">
                {trend === 'up' && <TrendingUp size={12} className="text-emerald-400 shrink-0" />}
                {trend === 'down' && <TrendingDown size={12} className="text-red-400 shrink-0" />}
                <span className="text-xl font-black font-mono text-white">
                  {data.nyPrice.toFixed(2)}
                </span>
              </div>
              <p
                className="text-[9px] font-bold mt-0.5"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                USc / lb
              </p>
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(30,60,139,0.2)',
              }}
            >
              <p
                className="text-[9px] font-black uppercase tracking-widest mb-1"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                TRM
              </p>
              <span className="text-xl font-black font-mono text-white">
                {data.trm.toLocaleString('es-CO')}
              </span>
              <p
                className="text-[9px] font-bold mt-0.5"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                COP / USD
              </p>
            </div>
          </div>

          {/* PRECIO CARGA FNC */}
          <div
            className="rounded-xl p-4 mb-5"
            style={{
              background: 'rgba(30,60,139,0.12)',
              border: '1px solid rgba(30,60,139,0.35)',
            }}
          >
            <p
              className="text-[9px] font-black uppercase tracking-widest mb-1"
              style={{ color: 'rgba(74,127,255,0.7)' }}
            >
              Precio carga pergamino FR{factor} (125 kg)
            </p>
            <p className="text-3xl font-black font-mono text-white">
              {fmtCOP(data.estimatedCarga)}
            </p>
            <p
              className="text-[10px] font-bold mt-2"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              ≈ {fmtCOP(data.kgCop)} / kg pergamino
            </p>
          </div>

          {/* DESGLOSE FNC */}
          <div
            className="rounded-xl p-4 mb-4"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <p
              className="text-[9px] font-black uppercase tracking-widest mb-3"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Desglose FNC por carga
            </p>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/50">
                  {data.kgExcelso.toFixed(2)} kg Excelso × {fmtCOP(data.precioExcelso)}/kg
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-400">
                  {fmtCOP(data.valorExcelso)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/50">
                  {data.kgPasilla.toFixed(2)} kg Pasilla × {fmtCOP(data.precioPasilla)}/kg
                </span>
                <span className="text-[11px] font-mono font-bold text-amber-400">
                  {fmtCOP(data.valorPasilla)}
                </span>
              </div>
              <div
                className="pt-2 mt-2 flex justify-between items-center"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-[10px] font-bold text-white/60">Total carga</span>
                <span className="text-[12px] font-mono font-black text-white">
                  {fmtCOP(data.estimatedCarga)}
                </span>
              </div>
            </div>
          </div>

          {/* FÓRMULA */}
          <details className="group">
            <summary
              className="text-[9px] font-black uppercase tracking-widest cursor-pointer select-none"
              style={{ color: 'rgba(74,127,255,0.5)' }}
            >
              Ver fórmula ▾
            </summary>
            <div
              className="mt-3 space-y-1.5 pl-2 border-l"
              style={{ borderColor: 'rgba(30,60,139,0.3)' }}
            >
              {[
                ['NY (USc/lb)', `${data.nyPrice.toFixed(2)}`],
                ['NY (USD/lb)', fmtUSD(data.nyPriceUsd)],
                ['TRM (COP/USD)', data.trm.toLocaleString('es-CO')],
                ['Precio Excelso', `${fmtCOP(data.precioExcelso)}/kg`],
                ['Formula', '(NY/100) × 2.20462 × TRM'],
                ['Kg Excelso/carga', `${data.kgExcelso} kg`],
                ['Kg Pasilla/carga', `${data.kgPasilla} kg`],
                ['Precio Pasilla', `${fmtCOP(data.precioPasilla)}/kg`],
              ].map(([label, val]) => (
                <div
                  key={label}
                  className="flex justify-between items-baseline"
                >
                  <span
                    className="text-[9px] font-bold"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    {label}
                  </span>
                  <span className="text-[10px] font-mono font-black text-white">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </details>

          {/* FOOTER */}
          <p
            className="mt-4 text-[8px] font-bold uppercase tracking-widest text-center"
            style={{ color: 'rgba(255,255,255,0.15)' }}
          >
            {data.source} · FNC Oficial · Actualizado{' '}
            {new Date(data.lastUpdated).toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </>
      ) : null}
    </div>
  );
}
