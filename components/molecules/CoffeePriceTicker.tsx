'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Coffee,
} from 'lucide-react';

interface CoffeePrice {
  nyPrice: number; // USc/lb
  nyPriceUsd: number; // USD/lb
  trm: number;
  estimatedCarga: number;
  kgCop: number;
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

  // Factor de conversión FNC ≈ 79 (rendimiento neto: lb→kg + pergamino→excelso + descuentos FNC)
  const [factor, setFactor] = useState(customFactor ?? 79);

  const load = useCallback(
    async (showLoader = false) => {
      if (showLoader) setLoading(true);

      setError(false);

      try {
        const res = await fetch('/api/coffee-price', {
          cache: 'no-store',
        });

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
  }, []);

  // Auto refresh
  useEffect(() => {
    const id = setInterval(() => load(false), 5 * 60 * 1000);

    return () => clearInterval(id);
  }, [load]);

  /**
   * ============================================
   * FORMULA FNC APROXIMADA
   * ============================================
   *
   * NY USc/lb → USD/lb
   * × TRM
   * × 2.20462 (lb por kg)
   * × 125 kg (carga)
   * × rendimiento (%)
   */

  /**
   * Fórmula FNC verificada empíricamente:
   *   Precio_carga = (NY USD/lb) × TRM × 2.20462 × 125 × (factor / 100)
   *
   * El factor (~79) es el rendimiento neto que incorpora:
   *   – Conversión lb → kg (÷ 2.20462)
   *   – Rendimiento pergamino seco → excelso (~80%)
   *   – Retención cafetera (~6%) + costos FNC
   *
   * Verificado: NY=2.66, TRM=3.800 → $2.212.000 COP/carga con factor 79
   */
  const customCarga = data
    ? Math.round(
        data.nyPriceUsd * // USD/lb
          data.trm * // COP/USD
          2.20462 * // lb por kg
          125 * // kg por carga
          (factor / 100) // rendimiento neto FNC
      )
    : null;

  // Precio por kilo pergamino aproximado
  const kgPergamino = customCarga
    ? Math.round(customCarga / 125)
    : null;

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
          <span className="text-xs text-red-500/60">
            Sin conexión
          </span>
        ) : data ? (
          <>
            {/* NY */}
            <div className="flex items-center gap-1.5">
              {trend === 'up' && (
                <TrendingUp
                  size={13}
                  className="text-emerald-400"
                />
              )}

              {trend === 'down' && (
                <TrendingDown
                  size={13}
                  className="text-red-400"
                />
              )}

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

            <div
              className="w-px h-4"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            />

            {/* TRM */}
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

            <div
              className="w-px h-4"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            />

            {/* Carga */}
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
                {fmtCOP(customCarga ?? 0)}
              </span>
            </div>

            {/* Hora */}
            <span
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              {new Date(data.lastUpdated).toLocaleTimeString(
                'es-CO',
                {
                  hour: '2-digit',
                  minute: '2-digit',
                }
              )}
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
              Tiempo real · NYSE
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
              style={{
                background: 'rgba(255,255,255,0.04)',
              }}
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
            {/* NY */}
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
                {trend === 'up' && (
                  <TrendingUp
                    size={12}
                    className="text-emerald-400 shrink-0"
                  />
                )}

                {trend === 'down' && (
                  <TrendingDown
                    size={12}
                    className="text-red-400 shrink-0"
                  />
                )}

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

            {/* TRM */}
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

          {/* PRECIO */}
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
              Precio estimado por carga (125 kg)
            </p>

            <p className="text-3xl font-black font-mono text-white">
              {fmtCOP(customCarga ?? 0)}
            </p>

            <p
              className="text-[10px] font-bold mt-2"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              ≈ {fmtCOP(kgPergamino ?? 0)} / kg
            </p>

            <p
              className="text-[9px] font-bold mt-2"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              Fórmula FNC:
              <br />
              NY × TRM × 2.20462 × 125 × ({factor} ÷ 100)
            </p>
          </div>

          {/* FACTOR */}
          <div
            className="rounded-xl p-4 mb-4"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-[9px] font-black uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Factor de rendimiento
              </p>

              <span className="text-sm font-black font-mono text-white">
                {factor}
              </span>
            </div>

            <input
              type="range"
              min={70}
              max={92}
              step={1}
              value={factor}
              onChange={(e) =>
                setFactor(Number(e.target.value))
              }
              className="w-full"
              style={{ accentColor: '#1e3c8b' }}
            />

            <div className="flex justify-between mt-1">
              <span
                className="text-[8px] font-bold"
                style={{ color: 'rgba(255,255,255,0.2)' }}
              >
                70
              </span>

              <span
                className="text-[8px] font-bold"
                style={{ color: 'rgba(255,255,255,0.2)' }}
              >
                92
              </span>
            </div>
          </div>

          {/* DESGLOSE */}
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
                [
                  'NY (USD/lb)',
                  fmtUSD(data.nyPriceUsd),
                ],
                [
                  'Factor FNC',
                  `${factor}`,
                ],
                [
                  'TRM (COP/USD)',
                  data.trm.toLocaleString('es-CO'),
                ],
                [
                  'Precio carga',
                  fmtCOP(customCarga ?? 0),
                ],
                [
                  'Precio kg',
                  fmtCOP(kgPergamino ?? 0),
                ],
              ].map(([label, val]) => (
                <div
                  key={label}
                  className="flex justify-between items-baseline"
                >
                  <span
                    className="text-[9px] font-bold"
                    style={{
                      color: 'rgba(255,255,255,0.3)',
                    }}
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
            {data.source} · Actualizado{' '}
            {new Date(data.lastUpdated).toLocaleTimeString(
              'es-CO',
              {
                hour: '2-digit',
                minute: '2-digit',
              }
            )}
          </p>
        </>
      ) : null}
    </div>
  );
}