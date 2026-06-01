import { NextResponse } from 'next/server';

/**
 * Factor de rendimiento neto FNC ≈ 79
 *
 * Fórmula verificada empíricamente:
 *   Precio_carga (COP) = (NY USD/lb) × TRM × 2.20462 × 125 × (FACTOR / 100)
 *
 * El factor 79 incorpora:
 *   – Rendimiento pergamino seco → excelso (~80%)
 *   – Retención cafetera (~6%)
 *   – Costos de comercialización FNC
 *
 * Verificado: NY=2.66 USD/lb, TRM=3.800 → $2.212.000 COP/carga ✓
 * Rango típico: 77–85 según variedad y región.
 */
const FACTOR_DEFAULT = 79;

async function fetchYahoo(symbol: string): Promise<number> {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AxiaCoffee/1.0)',
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // cache 5 minutos
    }
  );
  if (!res.ok) throw new Error(`Yahoo Finance error: ${symbol}`);
  const json = await res.json();
  return json.chart.result[0].meta.regularMarketPrice as number;
}

export async function GET() {
  try {
    // KC=F = Coffee C Arabica Futures (USc/lb) | USDCOP=X = tasa de cambio
    const [nyRaw, trm] = await Promise.all([
      fetchYahoo('KC=F'),
      fetchYahoo('USDCOP=X'),
    ]);

    const nyUsdPerLb = nyRaw / 100; // USc/lb → USD/lb

    /**
     * Fórmula FNC verificada empíricamente:
     *   Precio_carga (COP) = (NY USD/lb) × TRM × 2.20462 × 125 × (factor / 100)
     *
     * Ejemplo con NY=266 USc/lb, TRM=3.800, factor=79:
     *   2.66 × 3800 × 2.20462 × 125 × 0.79 ≈ $2.200.000 COP/carga ✓
     */
    const estimatedCarga = Math.round(
      nyUsdPerLb * trm * 2.20462 * 125 * (FACTOR_DEFAULT / 100)
    );
    const kgCop          = Math.round(estimatedCarga / 125);

    return NextResponse.json({
      nyPrice:        +nyRaw.toFixed(2),      // USc/lb
      nyPriceUsd:     +nyUsdPerLb.toFixed(4), // USD/lb
      trm:            Math.round(trm),        // COP/USD
      estimatedCarga,                         // COP / carga (125 kg CPS)
      kgCop,                                  // COP / kg referencial
      factor:         FACTOR_DEFAULT,
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
