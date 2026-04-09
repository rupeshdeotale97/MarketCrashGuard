import { NextResponse } from "next/server";

export const runtime = "nodejs";

type FeedSource = {
  name: string;
  url: string;
  region: "Global" | "India";
};

type NewsItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  summary: string;
  region: "Global" | "India";
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  impact: "HIGH" | "MEDIUM" | "LOW";
  catalysts: string[];
  score: number;
};

const FEEDS: FeedSource[] = [
  {
    name: "Bing News",
    url: "https://www.bing.com/news/search?q=stock%20market%20OR%20fed%20OR%20inflation%20OR%20oil%20OR%20bond%20market&format=rss",
    region: "Global",
  },
  {
    name: "Google News",
    url: "https://news.google.com/rss/search?q=stock%20market%20OR%20fed%20OR%20inflation%20OR%20oil%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
    region: "Global",
  },
  {
    name: "Google News India",
    url: "https://news.google.com/rss/search?q=nifty%20OR%20sensex%20OR%20rupee%20OR%20rbi%20when%3A1d&hl=en-IN&gl=IN&ceid=IN:en",
    region: "India",
  },
  {
    name: "MarketWatch",
    url: "https://feeds.marketwatch.com/marketwatch/topstories/",
    region: "Global",
  },
];

const POSITIVE_TERMS = [
  "rally",
  "gain",
  "gains",
  "surge",
  "rebound",
  "cools",
  "easing",
  "beat",
  "beats",
  "growth",
  "stimulus",
  "cut",
  "cuts",
  "approval",
  "deal",
];

const NEGATIVE_TERMS = [
  "crash",
  "selloff",
  "slump",
  "plunge",
  "fall",
  "falls",
  "war",
  "tariff",
  "recession",
  "default",
  "downgrade",
  "inflation",
  "spike",
  "rate hike",
  "layoffs",
  "miss",
  "misses",
  "weak",
];

const HIGH_IMPACT_TERMS = [
  "fed",
  "federal reserve",
  "rbi",
  "inflation",
  "cpi",
  "ppi",
  "jobs",
  "payrolls",
  "treasury",
  "bond",
  "yield",
  "oil",
  "crude",
  "opec",
  "war",
  "tariff",
  "sanction",
  "earnings",
  "guidance",
  "downgrade",
  "default",
  "rupee",
  "usd/inr",
  "nifty",
  "sensex",
  "bank nifty",
  "bitcoin",
  "crypto",
];

const RELEVANCE_TERMS = [
  "market",
  "stocks",
  "stock",
  "equity",
  "equities",
  "index",
  "indices",
  "fed",
  "rbi",
  "inflation",
  "oil",
  "yield",
  "treasury",
  "rupee",
  "nifty",
  "sensex",
  "dow",
  "s&p",
  "nasdaq",
  "bitcoin",
  "crypto",
];

function decodeEntities(input: string) {
  return input
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripTags(input: string) {
  return decodeEntities(input).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getTagValue(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripTags(match[1]) : "";
}

function parseDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function inferSentiment(text: string): NewsItem["sentiment"] {
  const lower = text.toLowerCase();
  const positive = POSITIVE_TERMS.filter((term) => lower.includes(term)).length;
  const negative = NEGATIVE_TERMS.filter((term) => lower.includes(term)).length;
  if (negative > positive) return "NEGATIVE";
  if (positive > negative) return "POSITIVE";
  return "NEUTRAL";
}

function extractCatalysts(text: string) {
  const lower = text.toLowerCase();
  return HIGH_IMPACT_TERMS.filter((term) => lower.includes(term)).slice(0, 3);
}

function computeScore(text: string, publishedAt: string) {
  const lower = text.toLowerCase();
  const relevance = RELEVANCE_TERMS.filter((term) => lower.includes(term)).length;
  const catalystCount = HIGH_IMPACT_TERMS.filter((term) => lower.includes(term)).length;
  const positiveCount = POSITIVE_TERMS.filter((term) => lower.includes(term)).length;
  const negativeCount = NEGATIVE_TERMS.filter((term) => lower.includes(term)).length;

  let recencyBoost = 0;
  if (publishedAt) {
    const hoursOld = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld <= 6) recencyBoost = 3;
    else if (hoursOld <= 24) recencyBoost = 2;
    else if (hoursOld <= 48) recencyBoost = 1;
  }

  return relevance * 2 + catalystCount * 3 + positiveCount + negativeCount + recencyBoost;
}

function inferImpact(score: number): NewsItem["impact"] {
  if (score >= 11) return "HIGH";
  if (score >= 6) return "MEDIUM";
  return "LOW";
}

function parseItems(xml: string, source: FeedSource): NewsItem[] {
  const matches = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

  return matches
    .map((block, index) => {
      const title = getTagValue(block, "title");
      const link = getTagValue(block, "link");
      const description = getTagValue(block, "description");
      const publishedAt = parseDate(getTagValue(block, "pubDate"));
      const text = `${title} ${description}`.trim();
      const score = computeScore(text, publishedAt);

      return {
        id: `${source.name}-${index}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title,
        link,
        source: source.name,
        publishedAt,
        summary: description,
        region: source.region,
        sentiment: inferSentiment(text),
        impact: inferImpact(score),
        catalysts: extractCatalysts(text),
        score,
      } satisfies NewsItem;
    })
    .filter((item) => item.title && item.link && item.score >= 4);
}

function dedupe(items: NewsItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.title.toLowerCase()}|${item.link.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function GET() {
  const warnings: string[] = [];

  try {
    const settled = await Promise.all(
      FEEDS.map(async (feed) => {
        try {
          const response = await fetch(feed.url, {
            next: { revalidate: 300 },
            headers: {
              "User-Agent": "Mozilla/5.0 (MarketCrashGuard)",
              Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
            },
          });

          if (!response.ok) {
            throw new Error(`${feed.name} feed failed (${response.status}).`);
          }

          const xml = await response.text();
          return parseItems(xml, feed);
        } catch (error: any) {
          warnings.push(error?.message || `${feed.name} unavailable.`);
          return [] as NewsItem[];
        }
      })
    );

    const items = dedupe(settled.flat())
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
      })
      .slice(0, 8)
      .map(({ score, ...item }) => item);

    return NextResponse.json({
      asOf: new Date().toISOString(),
      items,
      warnings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unable to fetch market-impact news." },
      { status: 500 }
    );
  }
}
