import { NextResponse } from 'next/server';

/**
 * ============================================
 * FÓRMULA OFICIAL FNC - PRECIO INTERNO DE REFERENCIA
 * ============================================
 *
 * Precio Excelso COP/kg = (NY / 100) × 2.20462 × TRM
 * Precio Cargo FR94 = (93.09 × Precio Excelso) + (8.16 × Precio Pasilla)
 *
 * Donde:
 *   - NY = Precio de cierre Bolsa de Nueva York (USc/lb)
 *   - TRM = Tasa de cambio (COP/USD)
 *   - 2.20462 = Conversión lb → kg
 *   - 93.09 kg de café excelso por carga (FR 94)
 *   - 8.16 kg de pasilla por carga (FR 94)
 *   - Precio pasilla = 10,000 COP/kg (fijo FNC)
 *
 * Verificado con FNC PDF (Julio 20/2026):
 *   NY=324.55, TRM≈3,263 → $2,255,000 COP/carga FR94 ✓
 */

const PRECIO_PASILLA = 10_000; // COP/kg (fijo FNC)

// Tabla de rendimiento por factor (FR → kg excelso y pasilla por carga de 125 kg)
const FR_TABLE: Record<number, { excelso: number; pasilla: number }> = {
  88: { excelso: 99.43, pasilla: 2.13 },
  89: { excelso: 98.31, pasilla: 4.20 },
  90: { excelso: 97.22, pasilla: 4.94 },
  91: { excelso: 96.15, pasilla: 5.55 },
  92: { excelso: 95.11, pasilla: 6.45 },
  93: { excelso: 94.09, pasilla: 7.19 },
  94: { excelso: 93.09, pasilla: 8.16 },
  95: { excelso: 92.11, pasilla: 8.93 },
  96: { excelso: 91.15, pasilla: 9.60 },
  97: { excelso: 90.21, pasilla: 10.52 },
  98: { excelso: 89.29, pasilla: 11.25 },
  99: { excelso: 88.38, pasilla: 12.16 },
  100: { excelso: 87.50, pasilla: 12.81 },
};

function getFRData(fr: number) {
  if (FR_TABLE[fr]) return FR_TABLE[fr];
  // Interpolación lineal para factores no enteros
  const floor = Math.floor(fr);
  const ceil = Math.ceil(fr);
  if (floor === ceil || !FR_TABLE[floor] || !FR_TABLE[ceil]) {
    return FR_TABLE[floor] || FR_TABLE[94];
  }
  const t = fr - floor;
  return {
    excelso: FR_TABLE[floor].excelso + t * (FR_TABLE[ceil].excelso - FR_TABLE[floor].excelso),
    pasilla: FR_TABLE[floor].pasilla + t * (FR_TABLE[ceil].pasilla - FR_TABLE[floor].pasilla),
  };
}

async function fetchYahoo(symbol: string): Promise<number> {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AxiaCoffee/1.0)',
        'Accept': 'application/json',
      },
      next: { revalidate: 300 },
    }
  );
  if (!res.ok) throw new Error(`Yahoo Finance error: ${symbol}`);
  const json = await res.json();
  return json.chart.result[0].meta.regularMarketPrice as number;
}

export async function GET() {
  try {
    const [nyRaw, trm] = await Promise.all([
      fetchYahoo('KC=F'),
      fetchYahoo('USDCOP=X'),
    ]);

    // Precio Excelso COP/kg = (NY / 100) × 2.20462 × TRM
    const precioExcelso = (nyRaw / 100) * 2.20462 * trm;

    // Calcular para FR 94 (default)
    const fr94 = getFRData(94);
    const valorExcelso = Math.round(fr94.excelso * precioExcelso);
    const valorPasilla = Math.round(fr94.pasilla * PRECIO_PASILLA);
    const estimatedCarga = valorExcelso + valorPasilla;

    return NextResponse.json({
      nyPrice:        +nyRaw.toFixed(2),          // USc/lb
      nyPriceUsd:     +(nyRaw / 100).toFixed(4),  // USD/lb
      trm:            Math.round(trm),             // COP/USD
      precioExcelso:  Math.round(precioExcelso),   // COP/kg excelso
      estimatedCarga,                               // COP/carga FR94
      kgCop:          Math.round(estimatedCarga / 125),
      valorExcelso,                                 // COP value excelso en carga
      valorPasilla,                                 // COP value pasilla en carga
      kgExcelso:      fr94.excelso,                // kg excelso por carga
      kgPasilla:      fr94.pasilla,                // kg pasilla por carga
      precioPasilla:  PRECIO_PASILLA,              // COP/kg pasilla
      factor:         94,
      lastUpdated:    new Date().toISOString(),
      source:         'NYSE · Yahoo Finance',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'No se pudo obtener el precio del café', detail: err.message },
      { status: 500 }
    );
  }
}
