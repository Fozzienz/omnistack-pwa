import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'VGS.AX';

  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch stock price');
    const data = await res.json();
    const price = data.chart?.result[0]?.meta?.regularMarketPrice || 0;
    const previousClose = data.chart?.result[0]?.meta?.previousClose || price;
    const change = price - previousClose;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;

    return NextResponse.json({ symbol, price, change, changePercent });
  } catch (error) {
    const fallbacks: Record<string, number> = { 'VGS.AX': 163.59, 'A200.AX': 153.88, 'WES.AX': 89.50, 'DHHF.AX': 34.80, 'IOZ.AX': 31.50 };
    return NextResponse.json({ symbol, price: fallbacks[symbol] || 100.00, change: 0, changePercent: 0, fallback: true });
  }
}
