'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Truck,
  Calendar,
  Package,
  User,
  Hash,
  Scale,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit2,
  Receipt,
  X,
  Save,
  ChevronDown,
  DollarSign,
  Weight,
} from 'lucide-react';
import { getDeliveryById, deleteDelivery, updateDelivery } from '@/request/delivery';
import { partnerCharge } from '@/request/accounts';
import { DeliveryUnit } from '@/types/Api';

const UNITS: { value: DeliveryUnit; label: string; icon: string }[] = [
  { value: 'kg',          label: 'Kilogramos',  icon: '⚖️' },
  { value: 'sacos',       label: 'Sacos',       icon: '🧺' },
  { value: 'lonas',       label: 'Lonas',       icon: '🛍️' },
  { value: 'bultos',      label: 'Bultos',      icon: '📦' },
  { value: 'canastillas', label: 'Canastillas', icon: '🪣' },
];

export default function DeliveryDetailPage({ deliveryId }: { deliveryId: string }) {
  const router = useRouter();
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit panel state
  const [showEdit, setShowEdit] = useState(false);
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState<DeliveryUnit>('kg');
  const [editProductKg, setEditProductKg] = useState('');
  const [editPricePerUnit, setEditPricePerUnit] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Register debt state
  const [isRegisteringDebt, setIsRegisteringDebt] = useState(false);

  const fetchDelivery = async () => {
    try {
      setLoading(true);
      const data = await getDeliveryById(deliveryId);
      setDelivery(data);
    } catch (error) {
      console.error("Error al cargar la entrega:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelivery();
  }, [deliveryId]);

  const openEdit = () => {
    if (!delivery) return;
    setEditQuantity(String(delivery.quantity ?? delivery.productKg ?? ''));
    setEditUnit((delivery.unit as DeliveryUnit) ?? 'kg');
    setEditProductKg(delivery.productKg != null ? String(delivery.productKg) : '');
    setEditPricePerUnit(delivery.pricePerUnit != null ? String(delivery.pricePerUnit) : '');
    setShowEdit(true);
  };

  const editTotalPrice =
    editQuantity && editPricePerUnit
      ? Number(editQuantity) * Number(editPricePerUnit)
      : null;

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);
      const body: Record<string, unknown> = {
        quantity: parseFloat(editQuantity),
        unit: editUnit,
      };
      if (editProductKg && editUnit !== 'kg') body.productKg = parseFloat(editProductKg);
      if (editPricePerUnit) body.pricePerUnit = parseFloat(editPricePerUnit);
      if (editTotalPrice !== null) body.totalPrice = editTotalPrice;

      await updateDelivery(deliveryId, body);
      setShowEdit(false);
      await fetchDelivery();
    } catch (error: any) {
      alert(error.message || 'Error al guardar cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este registro? Esto no devolverá el stock automáticamente.")) return;
    try {
      setIsDeleting(true);
      await deleteDelivery(deliveryId);
      router.push('/es/deliveries');
    } catch (error) {
      alert("Error al eliminar");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRegisterDebt = async () => {
    if (!delivery) return;
    if (!confirm(`¿Registrar deuda de $${Number(delivery.totalPrice).toLocaleString('es-CO')} para ${delivery.partner?.name}?`)) return;
    try {
      setIsRegisteringDebt(true);
      await partnerCharge({
        tenantId: delivery.tenantId,
        partnerId: delivery.partnerId,
        amount: Number(delivery.totalPrice),
        description: `Entrega — ${delivery.product?.name}`,
        affectsBalance: false,
      });
      alert('✅ Deuda registrada correctamente');
    } catch (error: any) {
      alert(error.message || 'Error al registrar deuda');
    } finally {
      setIsRegisteringDebt(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#0a1120]">
        <Loader2 className="animate-spin text-[#1E3C8b] mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Consultando manifiesto...</p>
      </div>
    );
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 text-slate-200">

      {/* NAVEGACIÓN SUPERIOR */}
      <div className="flex justify-between items-center mb-12">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver a Entregas
        </button>

        <div className="flex gap-3">
          <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-slate-400 hover:text-white">
            <Download size={18} />
          </button>

          {/* REGISTRAR DEUDA — solo si hay totalPrice */}
          {delivery?.totalPrice != null && Number(delivery.totalPrice) > 0 && (
            <button
              onClick={handleRegisterDebt}
              disabled={isRegisteringDebt}
              title="Registrar deuda al aliado"
              className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-all text-amber-500"
            >
              {isRegisteringDebt
                ? <Loader2 size={18} className="animate-spin" />
                : <Receipt size={18} />
              }
            </button>
          )}

          {/* EDITAR */}
          <button
            onClick={showEdit ? () => setShowEdit(false) : openEdit}
            className={`p-3 rounded-xl border transition-all ${
              showEdit
                ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {showEdit ? <X size={18} /> : <Edit2 size={18} />}
          </button>

          {/* ELIMINAR */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-red-500"
          >
            {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
          </button>
        </div>
      </div>

      {/* PANEL DE EDICIÓN INLINE */}
      {showEdit && (
        <div
          className="mb-8 rounded-[2rem] p-8 backdrop-blur-md shadow-2xl"
          style={{ background: 'rgba(10,17,32,0.98)', border: '1px solid rgba(30,60,139,0.35)' }}
        >
          <h2 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-3" style={{ color: 'rgba(74,127,255,0.8)' }}>
            <Edit2 size={13} /> Editar Entrega
          </h2>

          {/* SELECTOR DE UNIDAD */}
          <div className="mb-6">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Unidad</label>
            <div className="grid grid-cols-5 gap-2">
              {UNITS.map((u) => (
                <button
                  key={u.value}
                  onClick={() => { setEditUnit(u.value); if (u.value === 'kg') setEditProductKg(''); }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
                    editUnit === u.value
                      ? 'border-[#4a7fff] text-white'
                      : 'border-white/10 text-slate-500 hover:border-white/20'
                  }`}
                  style={editUnit === u.value ? { background: 'rgba(74,127,255,0.1)' } : { background: 'rgba(255,255,255,0.02)' }}
                >
                  <span className="text-lg">{u.icon}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest leading-tight">{u.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* CANTIDAD */}
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Hash size={12} /> Cantidad ({UNITS.find(u => u.value === editUnit)?.label})
              </label>
              <input
                type="number"
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
                placeholder="0"
                className="w-full rounded-2xl p-5 text-5xl font-mono font-black text-white outline-none transition-all"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.5)' }}
              />
            </div>

            {/* KG EQUIVALENTE — solo si no es kg */}
            {editUnit !== 'kg' && (
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Weight size={12} /> Equiv. en kg <span className="text-slate-700 normal-case font-medium">(opcional)</span>
                </label>
                <input
                  type="number"
                  value={editProductKg}
                  onChange={(e) => setEditProductKg(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-2xl px-5 py-4 text-2xl font-mono font-black text-white outline-none transition-all"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.25)' }}
                />
              </div>
            )}

            {/* PRECIO POR UNIDAD */}
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={12} /> Precio × {editUnit === 'kg' ? 'kg' : UNITS.find(u => u.value === editUnit)?.label?.toLowerCase()}{' '}
                <span className="text-slate-700 normal-case font-medium">(opcional)</span>
              </label>
              <input
                type="number"
                value={editPricePerUnit}
                onChange={(e) => setEditPricePerUnit(e.target.value)}
                placeholder="0"
                className="w-full rounded-2xl px-5 py-4 text-2xl font-mono font-black text-white outline-none transition-all"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.25)' }}
              />
              {editTotalPrice !== null && (
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(16,185,129,0.8)' }}>
                  Total calculado: {fmt(editTotalPrice)}
                </p>
              )}
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveEdit}
              disabled={isSaving || !editQuantity}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-30 text-white"
              style={{ background: 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)' }}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Guardar cambios
            </button>
            <button
              onClick={() => setShowEdit(false)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <X size={16} /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* CUERPO DEL COMPROBANTE (ESTILO TICKET) */}
      <div className="relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#1E3C8b]/10 blur-[100px] rounded-full" />

        <div className="bg-[#0d1525] border border-white/10 rounded-[3rem] shadow-2xl relative z-10 overflow-hidden">

          {/* HEADER DEL TICKET */}
          <div className="bg-gradient-to-r from-[#1E3C8b] to-blue-900 p-10 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 text-white/70 uppercase text-[10px] font-black tracking-[0.3em] mb-2">
                <CheckCircle2 size={14} className="text-emerald-400" /> Registro Confirmado
              </div>
              <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">
                Comprobante de Salida
              </h1>
            </div>
            <div className="text-right">
              <Truck size={48} className="text-white/20" />
            </div>
          </div>

          <div className="p-10 space-y-12">

            {/* GRID DE DATOS PRINCIPALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

              {/* BLOQUE IZQUIERDO: ACTORES */}
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-[#1E3C8b]">
                    <User size={24} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1 italic">Aliado Comercial / Receptor</label>
                    <p className="text-xl font-black text-white uppercase italic">{delivery?.partner?.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">NIT: {delivery?.partner?.nit || '---'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-emerald-500">
                    <Package size={24} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1 italic">Materia Prima Despachada</label>
                    <p className="text-xl font-black text-white uppercase italic">{delivery?.product?.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Cód. Producto: {delivery?.product?.id.substring(0,8)}</p>
                  </div>
                </div>
              </div>

              {/* BLOQUE DERECHO: MÉTRICAS Y TIEMPO */}
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-amber-500">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1 italic">Fecha y Hora de Registro</label>
                    <p className="text-xl font-black text-white uppercase italic">
                      {new Date(delivery?.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                      {new Date(delivery?.createdAt).toLocaleTimeString('es-CO')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-blue-400">
                    <Hash size={24} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1 italic">Número de Operación</label>
                    <p className="text-xl font-black text-white uppercase italic">#{delivery?.id.substring(0,12).toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN CANTIDAD */}
            <div className="bg-white/[0.03] border-2 border-dashed border-white/10 rounded-[2rem] p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1E3C8b] to-transparent opacity-50" />

              {/* Cantidad principal (número de unidades) */}
              <div className="flex flex-col items-center justify-center mb-6">
                <Scale size={36} className="text-[#1E3C8b] mb-3 opacity-50" />
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">
                  Cantidad Despachada
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-8xl font-black font-mono text-white tracking-tighter italic">
                    {Number(delivery?.quantity ?? delivery?.productKg ?? 0).toLocaleString('es-CO')}
                  </span>
                  <span className="text-3xl font-black text-[#1E3C8b] italic uppercase">
                    {delivery?.unit ?? 'kg'}
                  </span>
                </div>
              </div>

              {/* Datos opcionales: kg equivalente + precio */}
              {(delivery?.productKg != null || delivery?.pricePerUnit != null) && (
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                  {/* Kg equivalente — solo si la unidad no es kg */}
                  {delivery?.productKg != null && delivery?.unit !== 'kg' && (
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">
                        Equiv. KG
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black font-mono text-slate-400 italic">
                          {Number(delivery.productKg).toLocaleString('es-CO')}
                        </span>
                        <span className="text-sm font-black text-slate-600 uppercase italic">kg</span>
                      </div>
                    </div>
                  )}

                  {/* Precio por unidad */}
                  {delivery?.pricePerUnit != null && (
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">
                        Precio × {delivery?.unit ?? 'kg'}
                      </span>
                      <span className="text-xl font-black font-mono text-emerald-400 italic">
                        ${Number(delivery.pricePerUnit).toLocaleString('es-CO')}
                      </span>
                    </div>
                  )}

                  {/* Total */}
                  {delivery?.totalPrice != null && (
                    <div className="col-span-2 flex flex-col items-center pt-3 border-t border-white/5">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">
                        Valor Total
                      </span>
                      <span className="text-3xl font-black font-mono text-emerald-400 italic">
                        ${Number(delivery.totalPrice).toLocaleString('es-CO')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PIE DE PÁGINA DEL TICKET */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/5">
              <div className="flex items-center gap-3 text-slate-500 italic">
                <AlertCircle size={14} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Este documento es un registro digital de inventario</span>
              </div>
              <div className="text-[10px] font-black text-white uppercase tracking-[0.2em] px-6 py-2 bg-white/5 rounded-full border border-white/10 italic">
                Status: Sincronizado
              </div>
            </div>
          </div>
        </div>

        {/* Efecto de bordes de ticket en el fondo (opcional) */}
        <div className="flex justify-between px-12 -mt-1 relative z-20">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-6 h-6 bg-[#0a1120] rounded-full" />
          ))}
        </div>
      </div>

      <style jsx>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
}
