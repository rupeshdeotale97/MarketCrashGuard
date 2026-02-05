import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch real-time sentiment data from the Fear & Greed Index API
    const sentimentResponse = await fetch('https://api.alternative.me/fng/?limit=1', { cache: 'no-store' });
    if (!sentimentResponse.ok) {
      throw new Error(`Failed to fetch sentiment data: ${sentimentResponse.statusText}`);
    }
    const sentimentData = await sentimentResponse.json();
    const currentSentiment = sentimentData.data[0];

    // --- Dynamic Data Simulation ---
    // NOTE: Real-time APIs for inflation and credit spreads often require API keys.
    // For this demonstration, we'll simulate dynamic values to show the functionality.
    
    // Simulate dynamic inflation data (e.g., between 2.0% and 5.0%)
    const simulatedInflation = (Math.random() * (5.0 - 2.0) + 2.0).toFixed(1) + '%';

    // Simulate dynamic credit spread data (e.g., between +30bps and +90bps)
    const simulatedCreditSpreads = '+' + Math.floor(Math.random() * (90 - 30) + 30) + 'bps';

    const data = {
      inflation: simulatedInflation,
      creditSpreads: simulatedCreditSpreads,
      sentiment: parseInt(currentSentiment.value),
      sentimentLabel: currentSentiment.value_classification
    };

    return NextResponse.json(data);

  } catch (error) {
    console.error("Market Sentiments API Error:", error);
    
    // Return a static fallback response in case of an external API error
    const fallbackData = {
      inflation: '--%',
      creditSpreads: '+--bps',
      sentiment: 50,
      sentimentLabel: 'Error'
    };
    return NextResponse.json(fallbackData, { status: 500 });
  }
}
