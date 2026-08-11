import { NextResponse } from 'next/server';

export const revalidate = 86400; 

export async function GET() {
  const apiKey = process.env.GOLDAPI_KEY;

  try {
    const fetchMetal = async (symbol: string) => {
      if (!apiKey) return null;
      const res = await fetch(`https://www.goldapi.io/api/${symbol}/AUD`, {
        headers: { 'x-access-token': apiKey },
      });
      if (!res.ok) return null;
      return await res.json();
    };

    const [gold, silver] = await Promise.all([
      fetchMetal('XAU'),
      fetchMetal('XAG')
    ]);

    // If GoldAPI returns an error or empty data (e.g. limit reached)
    if (!gold?.price || !silver?.price) {
      return NextResponse.json({
        goldAud: 6048.63,
        goldChange: 0.71,
        silverAud: 88.52,
        silverChange: -0.51,
        gsr: 68.33,
        rateLimitExceeded: true, // Triggers the banner if needed
      });
    }

    return NextResponse.json({
      goldAud: gold.price,
      goldChange: gold?.chp || 0.0,
      silverAud: silver.price,
      silverChange: silver?.chp || 0.0,
      gsr: gold.price / silver.price,
      rateLimitExceeded: false,
    });
  } catch (error) {
    return NextResponse.json({
      goldAud: 6048.63,
      goldChange: 0.71,
      silverAud: 88.52,
      silverChange: -0.51,
      gsr: 68.33,
      rateLimitExceeded: true,
    });
  }
}