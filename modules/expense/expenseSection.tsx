'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  Receipt, Calendar, TrendingDown, ArrowRight,
  Loader2, Plus, Filter, X, AlertCircle,
} from 'lucide-react';
import { getExpenses } from '@/request/expense';
import { usePaginatedFetch } from '@/hooks/usePaginatedFetch';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const today      = () => new Date().toISOString().split('T')[0];
const monthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

export default function ExpensesSection() {
  const locale = useLocale();

  // ── Filtros de fecha ─────────────────────────────────────────────────────
  const [startDate, setStartDate] = useState(monthStart());
  const [endDate,   setEndDate]   = useState(today());
  const [filtersApplied, setFiltersApplied] = useState(true);

  // ── Fetch paginado ───────────────────────────────────────────────────────
  // Los deps [startDate, endDate] hacen que el hook reinicie a página 1
  // cada vez que cambien los filtros.
  const fetchExpenses = useCallback(
    (page: number, limit: number) => getExpenses(page, limit, startDate, endDate),
    [startDate, endDate],
  );

  const { data: expenses, loading, error, page, totalPages, total, nextPage, prevPage, refresh } =
    usePaginatedFetch(fetchExpenses, 10, [startDate, endDate]);

  // Total del período (suma de los datos de todas las páginas ya cargadas)
  // Solo se puede calcular si el backend retorna el total en un campo separado,
  // o si calculamos sobre los datos actuales (aproximado si hay más páginas)
  const pageTotal = (expenses as any[]).reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const clearFilters = () => {
    setStartDate(monthStart());
    setEndDate(today());
  };

  const handleApplyFilters = () => {
    setFiltersApplied(true);
    refresh();
  };

  return (
    <div className="w-full flex flex-col gap-6 p-0">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white italic flex items-center gap-2 uppercase"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            <Receipt style={{ color: '#ef4444' }} size={22} />
            Control de Gastos<span style={{ color: '#ef4444' }}>.</span>
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">
            Registro de egresos y flujo de caja
          </p>
        </div>
        <Link
          href={`/${locale}/expenses/new`}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all text-white active:scale-95"
          style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #ef4444 100%)' }}
        >
          <Plus size={14} /> Nuevo Gasto
        </Link>
      </div>

      {/* FILTROS DE FECHA */}
      <div
        className="rounded-2xl p-5 flex flex-wrap items-end gap-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(30,60,139,0.2)' }}
      >
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest"
          style={{ color: 'rgba(239,68,68,0.7)' }}>
          <Filter size={12} /> Filtrar por período
        </div>

        <div className="flex flex-wrap gap-4 flex-1">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest block"
              style={{ color: 'rgba(255,255,255,0.25)' }}>
              Desde
            </label>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white outline-none transition-all"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.3)', colorScheme: 'dark' }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest block"
              style={{ color: 'rgba(255,255,255,0.25)' }}>
              Hasta
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white outline-none transition-all"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.3)', colorScheme: 'dark' }}
            />
          </div>
        </div>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
            style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <X size={12} /> Limpiar
          </button>
        </div>
      </div>

      {/* RESUMEN DEL PERÍODO */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div
          className="p-5 rounded-2xl col-span-2 md:col-span-1"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(239,68,68,0.6)' }}>
            Total período (esta página)
          </p>
          <p className="text-2xl font-black font-mono" style={{ color: 'rgba(239,68,68,0.9)' }}>
            {loading ? '...' : fmt(pageTotal)}
          </p>
        </div>
        <div
          className="p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(30,60,139,0.2)' }}
        >
          <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Registros encontrados
          </p>
          <p className="text-2xl font-black font-mono text-white">
            {loading ? '...' : total || expenses.length}
          </p>
        </div>
        <div
          className="p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(30,60,139,0.2)' }}
        >
          <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Página actual
          </p>
          <p className="text-2xl font-black font-mono text-white">
            {page} <span className="text-base text-slate-600">/ {totalPages}</span>
          </p>
        </div>
      </div>

      {/* CONTENIDO */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin" size={40} style={{ color: '#ef4444' }} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Cargando gastos...
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <AlertCircle size={36} className="text-red-400" />
          <p className="text-sm font-bold text-red-400">{error}</p>
          <button onClick={refresh} className="text-[9px] underline uppercase tracking-widest text-slate-500">
            Reintentar
          </button>
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 opacity-40">
          <Receipt size={48} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">
            Sin gastos en el período seleccionado
          </p>
        </div>
      ) : (
        <>
          {/* GRID DE GASTOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {expenses.map((exp: any) => (
              <div
                key={exp.id}
                className="group rounded-[2rem] p-6 flex flex-col shadow-xl relative overflow-hidden transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              >
                {/* Línea roja superior */}
                <div className="absolute top-0 right-10 w-8 h-0.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.8)' }} />

                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(exp.createdAt).toLocaleDateString('es-CO', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </span>
                  <TrendingDown size={14} style={{ color: 'rgba(239,68,68,0.5)' }} />
                </div>

                <h3 className="text-sm font-black text-white uppercase leading-tight mb-4 line-clamp-2 min-h-[40px]">
                  {exp.description}
                </h3>

                <div className="pt-4 mt-auto flex items-end justify-between"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <span className="text-[8px] font-bold text-slate-600 uppercase block mb-1">Monto</span>
                    <span className="text-2xl font-mono font-black italic" style={{ color: '#ef4444' }}>
                      -{fmt(exp.amount)}
                    </span>
                  </div>
                  <Link
                    href={`/${locale}/expenses/${exp.id}`}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                    }}
                  >
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINACIÓN */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-2 py-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(30,60,139,0.15)' }}
            >
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Página {page} de {totalPages}
                {total > 0 && <span style={{ color: 'rgba(74,127,255,0.5)' }}> · {total} registros</span>}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1 || loading}
                  onClick={prevPage}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  ← Anterior
                </button>
                <button
                  disabled={page === totalPages || loading}
                  onClick={nextPage}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
                  style={{ background: 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)' }}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
