'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  Package, Search, Plus, Loader2,
  ArrowUpRight, ArrowDownLeft, Trash2, Calendar,
  Users, X, CheckCircle2, StickyNote, Hash
} from 'lucide-react';
import {
  getPackagingMovements,
  getPackagingBalance,
  deletePackagingMovement,
  createPackagingMovement
} from '@/request/packaging';
import { getAllPartners } from '@/request/partner';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export default function ScreenPartnerPackaging() {
  const router = useRouter();
  const locale = useLocale();

  const [tenantId, setTenantId] = useState<string | null>(null);

  const [partners, setPartners] = useState<any[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [movements, setMovements] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);

  const [loadingPartners, setLoadingPartners] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [movementType, setMovementType] = useState<'DELIVERED_TO_PARTNER' | 'RETURNED_BY_PARTNER'>('DELIVERED_TO_PARTNER');
  const [formData, setFormData] = useState({ quantity: '', description: '' });

  useEffect(() => {
    const authToken = Cookies.get("authToken");

    if (!authToken) {
      setTenantId(null);
      return;
    }

    try {
      const decoded: any = jwtDecode(authToken);
      setTenantId(decoded.tenantId || null);
    } catch (error) {
      console.error("Error decodificando token:", error);
      setTenantId(null);
    }
  }, []);

  useEffect(() => {
    const fetchInitialPartners = async () => {
      try {
        setLoadingPartners(true);
        const data = await getAllPartners();
        setPartners(data);
      } catch (error) {
        console.error("Error al cargar socios:", error);
      } finally {
        setLoadingPartners(false);
      }
    };

    fetchInitialPartners();
  }, []);

  const fetchPackagingData = useCallback(async (id: string) => {
    if (!id) return;

    try {
      setLoadingData(true);
      const [movementsData, balanceData] = await Promise.all([
        getPackagingMovements(id),
        getPackagingBalance(id)
      ]);
      setMovements(movementsData);
      setBalance(balanceData.packagingBalance);
    } catch (error) {
      console.error("Error cargando datos de empaque:", error);
      setMovements([]);
      setBalance(0);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchPackagingData(selectedPartnerId);
  }, [selectedPartnerId, fetchPackagingData]);

  const handleSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault();

    const quantityNum = Number(formData.quantity);

    if (!selectedPartnerId) {
      alert("Selecciona un aliado");
      return;
    }

    if (!tenantId) {
      alert("No se encontró tenantId");
      return;
    }

    if (!quantityNum || quantityNum <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    try {
      setIsSubmitting(true);

      await createPackagingMovement({
        tenantId,
        partnerId: selectedPartnerId,
        type: movementType,
        quantity: quantityNum,
        description: formData.description.trim()
      });

      setFormData({ quantity: '', description: '' });
      setIsModalOpen(false);
      await fetchPackagingData(selectedPartnerId);
    } catch (error: any) {
      console.error("Error creando movimiento:", error);
      alert(error?.message || "Error al registrar movimiento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMovements = movements.filter(m =>
    (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.type && m.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full h-full p-6 text-slate-200 bg-[#0a1120] flex flex-col font-sans overflow-hidden relative">

      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2 shrink-0">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
            Control de Empaques<span className="text-amber-500">.</span>
          </h2>
          <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] mt-2">
            Inventario físico por aliado comercial
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/50" size={16} />
            <select
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-amber-500/50 transition-all text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer"
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
            >
              <option value="" className="bg-[#0a1120]">-- Seleccionar Aliado --</option>
              {partners.map(p => (
                <option key={p.id} value={p.id} className="bg-[#0a1120]">
                  {p.name}
                </option>
              ))}
            </select>
            {loadingPartners && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-amber-500" size={14} />}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 px-6 py-2.5 rounded-2xl flex flex-col items-end min-w-[120px]">
            <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 italic">Saldo</span>
            <span className="text-xl font-black text-white leading-none">
              {loadingData ? '...' : balance} <small className="text-[9px] text-amber-500/50">Und</small>
            </span>
          </div>

          <button
            disabled={!selectedPartnerId}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-white text-black hover:bg-amber-500 hover:text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <Plus size={16} /> Registrar Movimiento
          </button>
        </div>
      </div>

      <div className="relative mb-6 shrink-0">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Buscar en el historial del aliado seleccionado..."
          className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-4 pl-14 pr-6 outline-none focus:border-amber-500/50 transition-all text-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={!selectedPartnerId}
        />
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden flex-1 shadow-2xl flex flex-col">
        {!selectedPartnerId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-30">
            <Users size={64} strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">
              Selecciona un aliado para ver su inventario
            </p>
          </div>
        ) : loadingData ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-amber-500" size={32} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
              Cargando bitácora...
            </span>
          </div>
        ) : filteredMovements.length > 0 ? (
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-[#0a1120] z-10 border-b border-white/5">
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                  <th className="px-8 py-5">Fecha</th>
                  <th className="px-8 py-5">Operación</th>
                  <th className="px-8 py-5">Observación</th>
                  <th className="px-8 py-5 text-right">Cantidad</th>
                  <th className="px-8 py-5 text-center w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMovements.map((m) => (
                  <tr key={m.id} className="group hover:bg-white/[0.02] transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <Calendar size={14} className="text-slate-500" />
                        <span className="text-[11px] font-bold text-white uppercase italic">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 uppercase text-[9px] font-black italic">
                      {m.type === 'DELIVERED_TO_PARTNER' ? (
                        <div className="flex items-center gap-2 text-blue-400">
                          <ArrowUpRight size={14} /> Salida
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-500">
                          <ArrowDownLeft size={14} /> Entrada
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] text-slate-400 font-bold uppercase truncate block max-w-[250px] group-hover:text-slate-200">
                        {m.description || 'N/A'}
                      </span>
                    </td>
                    <td className={`px-8 py-6 text-right font-mono text-lg font-black ${m.type === 'RETURNED_BY_PARTNER' ? 'text-emerald-500' : 'text-white'}`}>
                      {m.type === 'RETURNED_BY_PARTNER' ? `-${m.quantity}` : `+${m.quantity}`}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button
                        onClick={() =>
                          deletePackagingMovement(m.id).then(() => fetchPackagingData(selectedPartnerId))
                        }
                        className="p-2 text-slate-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-40">
            <Package size={48} strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Historial vacío</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-xl bg-[#0d1525] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <form onSubmit={handleSubmitMovement} className="p-10 space-y-8">
              <div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Nuevo Registro</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                  Selecciona el tipo de operación
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMovementType('DELIVERED_TO_PARTNER')}
                  className={`flex flex-col items-center p-6 rounded-[2rem] border-2 transition-all duration-300 ${
                    movementType === 'DELIVERED_TO_PARTNER'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                      : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'
                  }`}
                >
                  <ArrowUpRight size={28} className="mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest italic">Salida (Entrega)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMovementType('RETURNED_BY_PARTNER')}
                  className={`flex flex-col items-center p-6 rounded-[2rem] border-2 transition-all duration-300 ${
                    movementType === 'RETURNED_BY_PARTNER'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                      : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'
                  }`}
                >
                  <ArrowDownLeft size={28} className="mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest italic">Entrada (Retorno)</span>
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2 px-2">
                  <label className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <Hash size={12} /> Cantidad de Empaques
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-4xl font-mono font-black text-white outline-none focus:border-amber-500/50 transition-all"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>

                <div className="space-y-2 px-2">
                  <label className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <StickyNote size={12} /> Detalle / Observación
                  </label>
                  <textarea
                    placeholder="Ej. Entrega para despacho de pedidos de la tarde..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm outline-none focus:border-amber-500/50 h-28 resize-none transition-all"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !formData.quantity}
                className="w-full bg-white text-black py-6 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.4em] hover:bg-amber-500 hover:text-white transition-all disabled:opacity-20 active:scale-95 shadow-xl"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin mx-auto" />
                ) : (
                  <div className="flex items-center justify-center gap-2 font-black">
                    Confirmar Registro <CheckCircle2 size={16} />
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        select option { background: #0a1120; color: white; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
}