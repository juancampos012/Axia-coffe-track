'use client';

import { jsPDF } from 'jspdf';

export interface FactorLiquidacionItem {
  productName: string;
  quantity:    number;   // kg
  basePrice:   number;
  factor:      number;
  unitPrice:   number;   // basePrice × factor
  subtotal:    number;
}

export interface FactorLiquidacionData {
  receiptNumber: string;
  date:          string;
  clientName:    string;
  clientPhone?:  string;
  factor:        number;
  items:         FactorLiquidacionItem[];
  totalPrice:    number;
  company?: {
    name?:    string;
    address?: string;
    nit?:     string;
    phone?:   string;
  };
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n);

/**
 * Genera una liquidación de compra por factor en tamaño carta (letter).
 * Incluye encabezado de empresa, datos del productor, tabla de productos
 * con cantidad (kg), factor de rendimiento, precios y totales.
 */
export function generateFactorLiquidacion(data: FactorLiquidacionData): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter', // 215.9 × 279.4 mm
  });

  const pageW  = doc.internal.pageSize.getWidth();   // 215.9
  const pageH  = doc.internal.pageSize.getHeight();  // 279.4
  const margin = 18;
  const cW     = pageW - margin * 2;                 // content width

  // ── Color palette ─────────────────────────────────────────────────────────
  const NAVY   = [4,  14, 45]  as const;
  const ACCENT = [30, 90, 200] as const;
  const WHITE  = [255, 255, 255] as const;
  const GRAY1  = [60,  60,  70]  as const;   // dark text
  const GRAY2  = [120, 120, 130] as const;   // muted
  const GRAY3  = [240, 242, 248] as const;   // bg stripe

  // ── Helpers ───────────────────────────────────────────────────────────────
  const setFill   = ([r,g,b]: readonly number[]) => doc.setFillColor(r, g, b);
  const setStroke = ([r,g,b]: readonly number[]) => doc.setDrawColor(r, g, b);
  const setColor  = ([r,g,b]: readonly number[]) => doc.setTextColor(r, g, b);

  const centerText = (text: string, y: number, size = 11) => {
    doc.setFontSize(size);
    const w = doc.getTextWidth(text);
    doc.text(text, (pageW - w) / 2, y);
  };

  const rightText = (text: string, y: number, rightX = pageW - margin) => {
    const w = doc.getTextWidth(text);
    doc.text(text, rightX - w, y);
  };

  // ── HEADER BLOCK ─────────────────────────────────────────────────────────
  // Dark navy top bar
  setFill(NAVY);
  doc.rect(0, 0, pageW, 52, 'F');

  // Accent side stripe
  setFill(ACCENT);
  doc.rect(0, 0, 6, 52, 'F');

  // Company name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  setColor(WHITE);
  doc.text(data.company?.name ?? 'AXIA COFFEE', margin + 4, 22);

  // Company sub-info (address / NIT / phone) in one line if fits, else stacked
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setColor([180, 190, 220]);
  const infoLines: string[] = [];
  if (data.company?.address) infoLines.push(data.company.address);
  if (data.company?.nit)     infoLines.push(`NIT: ${data.company.nit}`);
  if (data.company?.phone)   infoLines.push(`Tel: ${data.company.phone}`);
  const infoStr = infoLines.join('   ·   ');
  doc.text(infoStr || '', margin + 4, 31);

  // Document title (right side of header)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  setColor(WHITE);
  rightText('LIQUIDACIÓN DE COMPRA', 20, pageW - margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setColor([180, 190, 220]);
  rightText('COMPRA POR FACTOR', 27, pageW - margin);

  // Doc number + date inside header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setColor([180, 190, 220]);
  rightText(`No. ${data.receiptNumber}`, 38, pageW - margin);
  const dateStr = new Date(data.date).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  doc.setFont('helvetica', 'normal');
  rightText(dateStr, 44, pageW - margin);

  let y = 62;

  // ── META ROW (Cliente & Factor) ───────────────────────────────────────────
  // Two side-by-side boxes
  const boxH = 38;
  const halfW = (cW - 6) / 2;

  // Client box
  setFill(GRAY3);
  setStroke([210, 215, 230]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, halfW, boxH, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  setColor([...ACCENT] as [number,number,number]);
  doc.text('PRODUCTOR / CLIENTE', margin + 4, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  setColor(GRAY1);
  doc.text(data.clientName.toUpperCase(), margin + 4, y + 18);

  if (data.clientPhone) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setColor(GRAY2);
    doc.text(`Tel: ${data.clientPhone}`, margin + 4, y + 26);
  }

  // Factor box
  const fx = margin + halfW + 6;
  setFill(NAVY);
  doc.roundedRect(fx, y, halfW, boxH, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  setColor([180, 190, 220] as [number,number,number]);
  doc.text('FACTOR DE RENDIMIENTO', fx + 4, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  setColor(WHITE);
  doc.text(data.factor.toFixed(2), fx + 4, y + 24);

  const pct = Math.abs(Math.round((data.factor - 1) * 100));
  const pctLabel = data.factor < 1
    ? `Descuento del ${pct}%`
    : data.factor > 1
    ? `Incremento del ${pct}%`
    : 'Sin ajuste (precio base)';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  setColor([150, 170, 220] as [number,number,number]);
  doc.text(pctLabel, fx + 4, y + 32);

  y += boxH + 10;

  // ── TABLE HEADER ─────────────────────────────────────────────────────────
  const cols = {
    producto:  { x: margin,        w: 60 },
    cantidad:  { x: margin + 60,   w: 28 },
    pBase:     { x: margin + 88,   w: 28 },
    factor:    { x: margin + 116,  w: 18 },
    pFinal:    { x: margin + 134,  w: 30 },
    subtotal:  { x: margin + 164,  w: cW - 164 },
  };

  setFill(NAVY);
  doc.rect(margin, y, cW, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  setColor(WHITE);
  doc.text('PRODUCTO',            cols.producto.x + 2,  y + 5.2);
  doc.text('CANT. (kg)',          cols.cantidad.x + 2,  y + 5.2);
  doc.text('P. BASE',            cols.pBase.x + 2,     y + 5.2);
  doc.text('FCT',                cols.factor.x + 2,    y + 5.2);
  doc.text('P. FINAL',           cols.pFinal.x + 2,    y + 5.2);
  doc.text('SUBTOTAL',           cols.subtotal.x + 2,  y + 5.2);
  y += 8;

  // ── TABLE ROWS ────────────────────────────────────────────────────────────
  data.items.forEach((item, i) => {
    const rowH = 9;
    // Alternating stripe
    if (i % 2 === 0) {
      setFill(GRAY3);
      doc.rect(margin, y, cW, rowH, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setColor(GRAY1);
    doc.text(item.productName.toUpperCase(), cols.producto.x + 2, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    // Quantity
    const qty = `${item.quantity.toLocaleString('es-CO')} kg`;
    doc.text(qty, cols.cantidad.x + 2, y + 6);

    // Base price
    setColor(GRAY2);
    doc.text(fmt(item.basePrice), cols.pBase.x + 2, y + 6);

    // Factor
    setColor([...ACCENT] as [number,number,number]);
    doc.setFont('helvetica', 'bold');
    doc.text(item.factor.toFixed(2), cols.factor.x + 2, y + 6);

    // Unit price (final)
    setColor([0, 130, 80]);
    doc.text(fmt(item.unitPrice), cols.pFinal.x + 2, y + 6);

    // Subtotal
    doc.setFont('helvetica', 'bold');
    setColor(GRAY1);
    const sub = fmt(item.subtotal);
    rightText(sub, y + 6, cols.subtotal.x + cols.subtotal.w - 2);

    y += rowH;
  });

  // Table bottom border
  setStroke([200, 205, 215]);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + cW, y);
  y += 8;

  // ── TOTALS BLOCK ──────────────────────────────────────────────────────────
  const totalBlockW = 90;
  const totalBlockX = pageW - margin - totalBlockW;

  // Total box (navy)
  setFill(NAVY);
  doc.roundedRect(totalBlockX, y, totalBlockW, 20, 3, 3, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setColor([180, 190, 220] as [number,number,number]);
  doc.text('TOTAL A PAGAR AL PRODUCTOR', totalBlockX + 4, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  setColor(WHITE);
  rightText(fmt(data.totalPrice), y + 18, totalBlockX + totalBlockW - 4);

  // Summary stats (left of totals)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setColor(GRAY2);
  doc.text(`${data.items.length} producto${data.items.length !== 1 ? 's' : ''}`, margin, y + 8);
  const totalKg = data.items.reduce((s, i) => s + i.quantity, 0);
  doc.text(`Total kg: ${totalKg.toLocaleString('es-CO')} kg`, margin, y + 16);

  y += 28;

  // ── OBSERVATION / NOTES AREA ──────────────────────────────────────────────
  setFill(GRAY3);
  setStroke([210, 215, 230]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, cW, 22, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  setColor(GRAY2);
  doc.text('OBSERVACIONES:', margin + 4, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setColor(GRAY1);
  doc.text(`Factor aplicado: ${data.factor.toFixed(2)}  ·  ${pctLabel}`, margin + 4, y + 15);

  y += 30;

  // ── SIGNATURE AREA ────────────────────────────────────────────────────────
  const sigW = (cW - 10) / 2;

  // Empresa firma
  setStroke([180, 180, 190]);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 16, margin + sigW, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  setColor(GRAY2);
  centerText('Firma responsable empresa', y + 20, 7);

  // Cliente firma
  const sig2X = margin + sigW + 10;
  doc.line(sig2X, y + 16, sig2X + sigW, y + 16);
  // Center within second sig box
  doc.setFontSize(7);
  const label2 = 'Firma productor / cliente';
  const lw2 = doc.getTextWidth(label2);
  doc.text(label2, sig2X + (sigW - lw2) / 2, y + 20);

  y += 28;

  // ── FOOTER ───────────────────────────────────────────────────────────────
  setFill([235, 237, 245]);
  doc.rect(0, pageH - 14, pageW, 14, 'F');
  setFill(ACCENT);
  doc.rect(0, pageH - 14, 6, 14, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  setColor(GRAY2);
  const footerLeft = `${data.company?.name ?? 'Axia Coffee'}  ·  Liquidación de compra por factor`;
  doc.text(footerLeft, margin + 4, pageH - 5.5);
  doc.setFontSize(7);
  rightText(`Generado: ${new Date().toLocaleString('es-CO')}`, pageH - 5.5, pageW - margin);

  return doc.output('blob');
}
