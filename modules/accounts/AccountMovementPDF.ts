'use client';

import { jsPDF } from 'jspdf';

export interface MovementPDFData {
  receiptNumber: string;
  date: string;
  personName: string;
  personType: 'Aliado' | 'Cliente' | 'Proveedor';
  personPhone?: string;
  mode: 'abono' | 'cargo';
  amount: number;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  company?: {
    name?: string;
    address?: string;
    nit?: string;
    phone?: string;
  };
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n);

/**
 * Genera un recibo térmico 80 mm para movimientos de cuenta
 * (abonos y cargos de aliados, clientes y proveedores).
 */
export function generateMovementPDF(data: MovementPDFData): Blob {
  const isAbono = data.mode === 'abono';

  // Altura dinámica según contenido
  const baseHeight = 140;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, baseHeight],
  });

  const pageWidth = 80;
  const margin    = 4;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const centerText = (text: string, y: number, size = 9) => {
    doc.setFontSize(size);
    const w = doc.getTextWidth(text);
    doc.text(text, (pageWidth - w) / 2, y);
  };

  const dashedLine = (y: number) => {
    doc.setLineWidth(0.2);
    doc.setDrawColor(150, 150, 150);
    const dash = 2, gap = 1.5;
    let x = margin;
    while (x < pageWidth - margin) {
      doc.line(x, y, Math.min(x + dash, pageWidth - margin), y);
      x += dash + gap;
    }
  };

  const solidLine = (y: number) => {
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(margin + 10, y, pageWidth - margin - 10, y);
  };

  let y = 5;

  // ── Nombre de la empresa ──────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  centerText(data.company?.name ?? 'AXIA COFFEE', y, 12);
  y += 5;

  // Línea decorativa
  solidLine(y);
  y += 4;

  // Info empresa
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  if (data.company?.address) { centerText(data.company.address, y, 7); y += 3.5; }
  if (data.company?.nit)     { centerText(`NIT: ${data.company.nit}`, y, 7); y += 3.5; }
  if (data.company?.phone)   { centerText(`Tel: ${data.company.phone}`, y, 7); y += 3.5; }
  if (!data.company?.address && !data.company?.nit && !data.company?.phone) { y += 2; }

  y += 2;
  dashedLine(y);
  y += 5;

  // ── Tipo de documento ────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  centerText(isAbono ? 'COMPROBANTE DE ABONO' : 'COMPROBANTE DE CARGO', y, 9);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  centerText(`No. ${data.receiptNumber}`, y, 7);
  y += 5;

  dashedLine(y);
  y += 5;

  // ── Info persona ──────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(data.personType.toUpperCase(), margin, y);
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(data.personName.toUpperCase(), margin, y);
  y += 4;

  if (data.personPhone) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`Tel: ${data.personPhone}`, margin, y);
    y += 4;
  }

  y += 2;
  dashedLine(y);
  y += 5;

  // ── Monto principal ───────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  centerText(isAbono ? 'VALOR ABONADO' : 'VALOR CARGADO', y, 7);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  centerText(fmt(data.amount), y, 16);
  y += 7;

  dashedLine(y);
  y += 5;

  // ── Detalle ───────────────────────────────────────────────────────────────
  const rowItem = (label: string, value: string, labelY: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(label, margin, labelY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const vw = doc.getTextWidth(value);
    doc.text(value, pageWidth - margin - vw, labelY);
  };

  rowItem('Concepto', data.description || 'Sin descripción', y);
  y += 5;

  const dateStr = new Date(data.date).toLocaleString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
  rowItem('Fecha', dateStr, y);
  y += 5;

  y += 1;
  dashedLine(y);
  y += 5;

  // ── Saldos ────────────────────────────────────────────────────────────────
  rowItem('Saldo anterior', fmt(data.balanceBefore), y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text('Nuevo saldo', margin, y);
  doc.setFontSize(8);
  doc.setTextColor(data.balanceAfter > 0 ? 0 : data.balanceAfter < 0 ? 180 : 60,
                   data.balanceAfter > 0 ? 80 : 60,
                   data.balanceAfter > 0 ? 0 : data.balanceAfter < 0 ? 40 : 60);
  const balStr = fmt(Math.abs(data.balanceAfter));
  const bw = doc.getTextWidth(balStr);
  doc.text(balStr, pageWidth - margin - bw, y);
  y += 6;

  dashedLine(y);
  y += 5;

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(140, 140, 140);
  centerText(`${data.company?.name ?? 'Axia Coffee'} · Documento informativo`, y, 6.5);
  y += 3.5;
  centerText('No válido como factura de venta', y, 6.5);

  return doc.output('blob');
}
