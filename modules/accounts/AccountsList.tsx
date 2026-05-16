'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  Search, Loader2, Inbox, BookOpen,
  TrendingUp, TrendingDown, Minus, ArrowRight, AlertCircle,
} from 'lucide-react';
import { AccountSummary, AccountType } from '@/request/accounts';

interface AccountsListProps {
  type: AccountType;
  title: string;
  subtitle: string;
  fetchFn: () => Promise<AccountSummary[]>;
  /** Texto que indica qué significa balance positivo */
  positiveLabel?: string;
  /** Texto que indica qué significa balance negativo */
  negativeLabel?: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Math.abs(n));

export default function AccountsList({
  type, title, subtitle, fetchFn,
  positiveLabel = 'nos deben',
  negativeLabel  = 'les debemos',
}: AccountsListProps) {
  const router  = useRouter();
  const locale  = useLocale();

  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    fetchFn()
      .then(setAccounts)
      .catch((e) => setError(e.message || 'Error al cargar cuentas'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = accounts.filter((a) =>
    a.personName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPositive = accounts.filter((a) => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalNegative = accounts.filter((a) => a.balance < 0).reduce((s, a) => s + Math.abs(a.balance), 0);

  const goToDetail = (id: string) => {
    router.push(`/${locale}/accounts/${type}/${id}`);
  };

  return (
    <div className="w-full flex flex-col gap-6 p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2
            className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-2"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            <BookOpen size={22} style={{ color: '#4a7fff' }} />
            {title}<span style={{ color: '#4a7fff' }}>.</span>
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* RESUMEN GLOBAL */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="p-5 rounded-2xl"
          style={{ background: 'rgba(74,127,255,0.06)', border: '1px solid rgba(74,127,255,0.2)' }}
        >
          <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(74,127,255,0.6)' }}>
            Total que {positiveLabel}
          </p>
          <p className="text-2xl font-black font-mono" style={{ color: 'rgba(74,127,255,0.9)' }}>
            {fmt(totalPositive)}
          </p>
        </div>
        <div
          className="p-5 rounded-2xl"
          style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)' }}
        >
          <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(248,113,113,0.6)' }}>
            Total que {negativeLabel}
          </p>
          <p className="text-2xl font-black font-mono" style={{ color: 'rgba(248,113,113,0.9)' }}>
            {fmt(totalNegative)}
          </p>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-5 text-sm text-white outline-none focus:border-[#1E3C8b] transition-all font-medium"
        />
      </div>

      {/* LISTADO */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin" size={32} style={{ color: '#4a7fff' }} />
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Cargando libro de cuentas...
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <AlertCircle size={32} className="text-red-400" />
          <p className="text-sm font-bold text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-[10px] underline uppercase tracking-widest text-slate-500"
          >
            Reintentar
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 opacity-40">
          <Inbox size={48} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sin registros de cuentas</p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(30,60,139,0.25)', background: 'rgba(255,255,255,0.02)' }}
        >
          {/* Cabecera tabla */}
          <div
            className="grid grid-cols-12 px-6 py-3 text-[9px] font-black uppercase tracking-widest"
            style={{ borderBottom: '1px solid rgba(30,60,139,0.2)', color: 'rgba(74,127,255,0.6)', background: 'rgba(30,60,139,0.06)' }}
          >
            <span className="col-span-4">Nombre</span>
            <span className="col-span-2 text-right">Cobrado</span>
            <span className="col-span-2 text-right">Pagado</span>
            <span className="col-span-3 text-right">Saldo</span>
            <span className="col-span-1" />
          </div>

          {/* Filas */}
          {filtered.map((acc) => {
            const isPositive = acc.balance > 0;
            const isNeutral  = acc.balance === 0;
            const balanceColor = isNeutral
              ? 'rgba(255,255,255,0.3)'
              : isPositive
              ? 'rgba(74,127,255,0.9)'
              : 'rgba(248,113,113,0.9)';

            return (
              <div
                key={acc.personId}
                onClick={() => goToDetail(acc.personId)}
                className="grid grid-cols-12 px-6 py-5 cursor-pointer transition-colors hover:bg-white/[0.03] group items-center"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
              >
                {/* Nombre */}
                <div className="col-span-4 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black text-white uppercase"
                    style={{ background: 'rgba(30,60,139,0.3)', border: '1px solid rgba(30,60,139,0.4)' }}
                  >
                    {acc.personName.charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-white truncate group-hover:text-[#4a7fff] transition-colors">
                    {acc.personName}
                  </span>
                </div>

                {/* Cobrado */}
                <div className="col-span-2 text-right">
                  <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {fmt(acc.totalCharged)}
                  </span>
                </div>

                {/* Pagado */}
                <div className="col-span-2 text-right">
                  <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {fmt(acc.totalPaid)}
                  </span>
                </div>

                {/* Saldo */}
                <div className="col-span-3 flex items-center justify-end gap-2">
                  {isNeutral ? (
                    <Minus size={14} style={{ color: balanceColor }} />
                  ) : isPositive ? (
                    <TrendingUp size={14} style={{ color: balanceColor }} />
                  ) : (
                    <TrendingDown size={14} style={{ color: balanceColor }} />
                  )}
                  <span className="text-sm font-black font-mono" style={{ color: balanceColor }}>
                    {isNeutral ? 'Al día' : (isPositive ? '+' : '-') + fmt(acc.balance)}
                  </span>
                </div>

                {/* Flecha */}
                <div className="col-span-1 flex justify-end">
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                    style={{ color: 'rgba(255,255,255,0.2)' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
