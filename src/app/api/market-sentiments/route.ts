import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    const [sentimentResponse, pulseResponse] = await Promise.all([
      fetch('https://api.alternative.me/fng/?limit=1', { cache: 'no-store' }),
      fetch(`${origin}/api/market-pulse`, { cache: 'no-store' }).catch(() => null),
    ]);

    if (!sentimentResponse.ok) {
      throw new Error(`Failed to fetch sentiment data: ${sentimentResponse.statusText}`);
    }

    const sentimentData = await sentimentResponse.json();
    const currentSentiment = sentimentData.data[0];

    let inflation = 'N/A';
    let creditSpreads = 'N/A';

    if (pulseResponse && pulseResponse.ok) {
      const pulse = await pulseResponse.json();
      const vix = Number(pulse?.indices?.vix?.price || 0);
      const usdinr5d = Number(pulse?.fx?.usdinr?.change5d || 0);
      const inflationProxy = Math.max(1.5, Math.min(8.5, 4 + usdinr5d * 0.6));
      const creditSpreadProxy = Math.max(20, Math.round((vix - 12) * 10));
      inflation = `${inflationProxy.toFixed(1)}%`;
      creditSpreads = `+${creditSpreadProxy}bps`;
    }

    const data = {
      inflation,
      creditSpreads,
      sentiment: parseInt(currentSentiment.value),
      sentimentLabel: currentSentiment.value_classification
    };

    return NextResponse.json(data);

  } catch (error) {
    console.error("Market Sentiments API Error:", error);
    return NextResponse.json(
      { error: 'Unable to fetch market sentiments in realtime.' },
      { status: 503 }
    );
  }
}
