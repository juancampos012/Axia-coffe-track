'use client';

import { jsPDF } from 'jspdf';

export interface FactorLiquidacionItem {
  productName: string;
  quantity:    number; // kg
  basePrice:   number;
  factor:      number;
  unitPrice:   number; // precio/kg calculado
  subtotal:    number;
}

export interface FactorLiquidacionData {
  receiptNumber:    string;
  date:             string;
  clientName:       string;
  clientPhone?:     string;
  factor:           number;
  cantidadMuestra?: number;
  gramosExcelso?:   number;
  precioBase?:      number;
  precioCarga?:     number;
  precioKg?:        number;
  items:            FactorLiquidacionItem[];
  totalPrice:       number;
  company?: {
    name?:    string;
    address?: string;
    nit?:     string;
    phone?:   string;
  };
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Math.round(n));

const num = (n: number) => n.toLocaleString('es-CO');

export function generateFactorLiquidacion(data: FactorLiquidacionData): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

  const pageW  = doc.internal.pageSize.getWidth();  // 215.9
  const pageH  = doc.internal.pageSize.getHeight(); // 279.4
  const ML     = 20;   // left margin
  const MR     = 20;   // right margin
  const cW     = pageW - ML - MR;

  // ── Palette ───────────────────────────────────────────────────────────────
  const INK      = [15,  20,  40]  as const;  // near-black
  const INK2     = [70,  75,  95]  as const;  // secondary text
  const INK3     = [130, 135, 155] as const;  // muted label
  const RULE     = [15,  20,  40]  as const;  // thick rule color = same as ink
  const ACCENT   = [30,  80,  180] as const;  // single accent (dark blue)
  const STRIPE   = [247, 248, 251] as const;  // table row stripe
  const BORDER   = [210, 213, 222] as const;  // box borders
  const WHITE    = [255, 255, 255] as const;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const sf = ([r,g,b]: readonly number[]) => doc.setFillColor(r, g, b);
  const ss = ([r,g,b]: readonly number[]) => doc.setDrawColor(r, g, b);
  const sc = ([r,g,b]: readonly number[]) => doc.setTextColor(r, g, b);

  const rText = (text: string, y: number, maxX: number) => {
    const w = doc.getTextWidth(text);
    doc.text(text, maxX - w, y);
  };

  const hRule = (y: number, h = 0.6) => {
    sf(RULE); doc.rect(ML, y, cW, h, 'F');
  };

  const thinRule = (y: number) => {
    ss(BORDER); doc.setLineWidth(0.25);
    doc.line(ML, y, ML + cW, y);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // WHITE PAPER BACKGROUND
  sf(WHITE); doc.rect(0, 0, pageW, pageH, 'F');

  // ── ACCENT LEFT STRIPE (thin, runs full height) ───────────────────────────
  sf(ACCENT); doc.rect(0, 0, 3, pageH, 'F');

  // ── HEADER ───────────────────────────────────────────────────────────────
  let y = 16;

  // Company name — top left
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  sc(INK);
  doc.text((data.company?.name ?? 'AXIA COFFEE').toUpperCase(), ML, y);

  // Document type — top right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  sc(ACCENT);
  rText('LIQUIDACIÓN DE COMPRA', y, ML + cW);

  y += 5;

  // Company sub-info — left
  const infoArr: string[] = [];
  if (data.company?.nit)     infoArr.push(`NIT ${data.company.nit}`);
  if (data.company?.address) infoArr.push(data.company.address);
  if (data.company?.phone)   infoArr.push(`Tel. ${data.company.phone}`);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  sc(INK2);
  doc.text(infoArr.join('   ·   '), ML, y);

  // Doc number + date — right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  sc(INK2);
  const dateStr = new Date(data.date).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  rText(`No. ${data.receiptNumber}   ·   ${dateStr}`, y, ML + cW);

  y += 7;
  hRule(y);          // thick horizontal rule
  y += 6;

  // ── PARTIES SECTION ───────────────────────────────────────────────────────
  // Left: empresa — Right: cliente
  const colW2 = (cW - 6) / 2;

  // Left column: label + data
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  sc(INK3);
  doc.text('EMPRESA COMPRADORA', ML, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  sc(INK);
  doc.text((data.company?.name ?? 'Axia Coffee').toUpperCase(), ML, y + 6);

  // Right column: cliente
  const rx = ML + colW2 + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  sc(INK3);
  doc.text('PRODUCTOR / PROVEEDOR', rx, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  sc(INK);
  doc.text(data.clientName.toUpperCase(), rx, y + 6);

  if (data.clientPhone) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    sc(INK2);
    doc.text(`Tel. ${data.clientPhone}`, rx, y + 12);
  }

  y += 20;
  thinRule(y);
  y += 8;

  // ── ANÁLISIS DE MUESTRA ───────────────────────────────────────────────────
  // Only render if we have sample data
  if (data.cantidadMuestra != null && data.gramosExcelso != null) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    sc(INK3);
    doc.text('ANÁLISIS DE MUESTRA', ML, y);
    y += 5;

    // 5-column data row
    const sampleCols = [
      { label: 'Muestra (g)',          value: `${num(data.cantidadMuestra)} g` },
      { label: 'Excelso (g)',           value: `${num(data.gramosExcelso)} g` },
      { label: 'Precio base',           value: data.precioBase != null ? fmt(data.precioBase) : '—' },
      { label: 'Factor calc.',          value: data.factor.toFixed(4) },
      { label: 'Precio / kg',          value: data.precioKg != null ? fmt(data.precioKg) : '—' },
    ];
    const sColW = cW / sampleCols.length;

    // Header stripe
    sf(STRIPE); doc.rect(ML, y, cW, 6.5, 'F');
    ss(BORDER); doc.setLineWidth(0.25);
    doc.rect(ML, y, cW, 6.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    sc(INK3);
    sampleCols.forEach((col, i) => {
      doc.text(col.label, ML + i * sColW + 3, y + 4.5);
    });
    y += 6.5;

    // Value row
    sf(WHITE); doc.rect(ML, y, cW, 8, 'F');
    ss(BORDER); doc.setLineWidth(0.25);
    doc.rect(ML, y, cW, 8, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    sc(INK);
    sampleCols.forEach((col, i) => {
      doc.text(col.value, ML + i * sColW + 3, y + 5.5);
    });
    y += 8;

    y += 10;
    thinRule(y);
    y += 8;
  }

  // ── PRODUCT TABLE ─────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  sc(INK3);
  doc.text('DETALLE DE PRODUCTOS', ML, y);
  y += 5;

  // Column definitions
  const C = {
    desc:     { x: ML,       w: 65 },
    qty:      { x: ML + 65,  w: 22 },
    pBase:    { x: ML + 87,  w: 28 },
    factor:   { x: ML + 115, w: 16 },
    pKg:      { x: ML + 131, w: 28 },
    subtotal: { x: ML + 159, w: cW - 159 },
  };
  const ROW_H = 8;
  const HEAD_H = 7;

  // Table header — dark background
  sf(INK); ss(INK); doc.setLineWidth(0);
  doc.rect(ML, y, cW, HEAD_H, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  sc(WHITE);
  doc.text('DESCRIPCIÓN',   C.desc.x + 2,     y + HEAD_H - 2);
  doc.text('CANT. (kg)',    C.qty.x + 2,      y + HEAD_H - 2);
  doc.text('PRECIO BASE',  C.pBase.x + 2,    y + HEAD_H - 2);
  doc.text('FACTOR',       C.factor.x + 2,   y + HEAD_H - 2);
  doc.text('PRECIO / KG',  C.pKg.x + 2,     y + HEAD_H - 2);
  rText('SUBTOTAL',        y + HEAD_H - 2,   C.subtotal.x + C.subtotal.w - 2);
  y += HEAD_H;

  // Rows
  data.items.forEach((item, i) => {
    if (i % 2 === 0) { sf(STRIPE); doc.rect(ML, y, cW, ROW_H, 'F'); }

    // vertical column rules
    ss(BORDER); doc.setLineWidth(0.2);
    [C.qty, C.pBase, C.factor, C.pKg, C.subtotal].forEach(col => {
      doc.line(col.x, y, col.x, y + ROW_H);
    });

    const baseline = y + 5.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    sc(INK);
    doc.text(item.productName.toUpperCase(), C.desc.x + 2, baseline);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    sc(INK2);
    doc.text(`${num(item.quantity)} kg`, C.qty.x + 2, baseline);

    sc(INK3);
    doc.text(fmt(item.basePrice), C.pBase.x + 2, baseline);

    doc.setFont('helvetica', 'bold');
    sc(ACCENT);
    doc.text(item.factor.toFixed(4), C.factor.x + 2, baseline);

    sc(INK2);
    doc.setFont('helvetica', 'normal');
    doc.text(fmt(item.unitPrice), C.pKg.x + 2, baseline);

    doc.setFont('helvetica', 'bold');
    sc(INK);
    rText(fmt(item.subtotal), baseline, C.subtotal.x + C.subtotal.w - 2);

    y += ROW_H;
  });

  // Table bottom border
  ss(INK); doc.setLineWidth(0.5);
  doc.line(ML, y, ML + cW, y);
  y += 8;

  // ── TOTALS ────────────────────────────────────────────────────────────────
  const totalKg = data.items.reduce((s, i) => s + i.quantity, 0);

  // Left summary
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  sc(INK3);
  doc.text(`Total: ${num(totalKg)} kg`, ML, y + 5);

  // Right totals block — 2 rows: precio carga / total
  const totBlockW = 95;
  const totBlockX = ML + cW - totBlockW;

  if (data.precioCarga != null) {
    thinRule(y);
    y += 5;
    // Label left, value right — on the same baseline
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    sc(INK3);
    doc.text('Precio por carga (125 kg)', ML, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    sc(INK2);
    rText(fmt(data.precioCarga), y + 5, ML + cW);
    y += 10;
    thinRule(y);
  }

  y += 5;

  // Final total — label then value on separate lines
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  sc(INK3);
  rText('TOTAL', y + 5, ML + cW);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  sc(INK);
  rText(fmt(data.totalPrice), y + 8, ML + cW);
  y += 14;

  hRule(y, 0.5);
  y += 10;

  // ── SIGNATURE AREA ────────────────────────────────────────────────────────
  const sigColW = (cW - 10) / 2;

  // Left sig
  ss(INK2); doc.setLineWidth(0.3);
  doc.line(ML, y + 14, ML + sigColW, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  sc(INK3);
  doc.text('FIRMA Y SELLO — EMPRESA', ML, y + 19);
  doc.setFont('helvetica', 'normal');
  doc.text(data.company?.name ?? '', ML, y + 24);

  // Right sig
  const sig2X = ML + sigColW + 10;
  doc.line(sig2X, y + 14, sig2X + sigColW, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  sc(INK3);
  doc.text('FIRMA — PRODUCTOR / PROVEEDOR', sig2X, y + 19);
  doc.setFont('helvetica', 'normal');
  doc.text(data.clientName, sig2X, y + 24);

  // ── FOOTER ───────────────────────────────────────────────────────────────
  thinRule(pageH - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  sc(INK3);
  doc.text(
    `${data.company?.name ?? 'Axia Coffee'}   ·   Liquidación de compra por factor No. ${data.receiptNumber}`,
    ML, pageH - 7
  );
  rText(`Generado el ${new Date().toLocaleString('es-CO')}`, pageH - 7, ML + cW);

  return doc.output('blob');
}
