import { NextResponse } from "next/server";

export const runtime = "nodejs";

type FredObservation = {
  date: string;
  value: string;
};

type FredResponse = {
  observations?: FredObservation[];
  error_code?: string;
  error_message?: string;
};

type MarketStat = {
  price: number;
  change1d: number;
  change5d: number;
  asOf: string;
};

type PocketPortfolioResponse = {
  symbol?: string;
  change_24h?: number | null;
  history_sample?: Array<{
    date: string;
    close: number;
  }>;
};

const DEFAULT_SYMBOLS = {
  nifty: "NSE",
  niftyYahoo: "^NSEI",
  sensexYahoo: "^BSESN",
  bankniftyYahoo: "^NSEBANK",
  spx: "SP500",
  vix: "VIXCLS",
  usdinr: "DEXINUS",
  gold: "GC.C",
  btcusd: "XBTUSD",
  ethusd: "ETHUSD",
};

function getEnv(name: string) {
  return process.env[name]?.trim() || "";
}

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function computeStats(values: Array<{ date: string; close: number }>): MarketStat {
  const latest = values[0]?.close ?? 0;
  const prev = values[1]?.close ?? 0;
  const fiveDay = values[Math.min(5, values.length - 1)]?.close ?? 0;
  const change1d = prev ? ((latest - prev) / prev) * 100 : 0;
  const change5d = fiveDay ? ((latest - fiveDay) / fiveDay) * 100 : 0;
  return {
    price: latest,
    change1d,
    change5d,
    asOf: values[0]?.date || "",
  };
}

async function fetchFredSeries(seriesId: string, apiKey: string, limit = 6) {
  const url = new URL("https://api.stlouisfed.org/fred/series/observations");
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("sort_order", "desc");
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!response.ok) {
    throw new Error(`FRED request failed (${response.status}).`);
  }

  const json = (await response.json()) as FredResponse;
  if (json.error_message) {
    throw new Error(json.error_message);
  }
  if (!json.observations || json.observations.length < 2) {
    throw new Error(`Not enough data for ${seriesId}.`);
  }
  return json.observations
    .filter((obs) => obs.value !== ".")
    .map((obs) => ({ date: obs.date, close: parseNumber(obs.value) }));
}

async function fetchKrakenTicker(pair: string) {
  const url = new URL("https://api.kraken.com/0/public/Ticker");
  url.searchParams.set("pair", pair);
  const response = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!response.ok) {
    throw new Error(`Kraken request failed (${response.status}).`);
  }
  const json = await response.json();
  const result = json?.result || {};
  const key = Object.keys(result)[0];
  if (!key) {
    throw new Error(`Kraken response missing ${pair}.`);
  }
  const ticker = result[key];
  const last = parseNumber(ticker?.c?.[0] ?? "0");
  const open = parseNumber(ticker?.o ?? "0");
  const change1d = open ? ((last - open) / open) * 100 : 0;
  return {
    price: last,
    change1d,
    change5d: change1d,
    asOf: new Date().toISOString().split("T")[0],
  } as MarketStat;
}

async function fetchStooqGold(symbol: string) {
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(symbol)}&i=d`;
  const response = await fetch(url, { next: { revalidate: 60 } });
  if (!response.ok) {
    throw new Error(`Stooq request failed (${response.status}).`);
  }
  const csv = await response.text();
  const rows = csv.trim().split("\n");
  if (rows.length < 3) {
    throw new Error("Not enough gold data.");
  }
  const data = rows.slice(1).map((line) => {
    const [date, , , , close] = line.split(",");
    return { date, close: parseNumber(close) };
  });
  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  const fiveDay = data[Math.max(0, data.length - 6)];
  return computeStats([
    { date: latest.date, close: latest.close },
    { date: prev.date, close: prev.close },
    { date: fiveDay.date, close: fiveDay.close },
  ]);
}

async function fetchYahooChart(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=7d&interval=1d`;
  const response = await fetch(url, {
    next: { revalidate: 300 },
    headers: {
      "User-Agent": "Mozilla/5.0 (MarketCrashGuard)",
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Yahoo Finance request failed (${response.status}).`);
  }
  const json = await response.json();
  const result = json?.chart?.result?.[0];
  const timestamps: number[] = result?.timestamp || [];
  const closes: Array<number | null> = result?.indicators?.quote?.[0]?.close || [];
  const points = timestamps
    .map((ts, index) => ({
      date: new Date(ts * 1000).toISOString().split("T")[0],
      close: closes[index],
    }))
    .filter((point) => typeof point.close === "number") as Array<{ date: string; close: number }>;

  if (points.length < 2) {
    throw new Error("Yahoo Finance returned insufficient data.");
  }
  const latest = points[points.length - 1];
  const prev = points[points.length - 2];
  const fiveDay = points[Math.max(0, points.length - 6)];
  return computeStats([
    { date: latest.date, close: latest.close },
    { date: prev.date, close: prev.close },
    { date: fiveDay.date, close: fiveDay.close },
  ]);
}

async function fetchNseSnapshot(symbol: string) {
  try {
    return await fetchYahooChart(symbol);
  } catch (error) {
    const response = await fetch("https://www.pocketportfolio.app/api/tickers/NSE/json", {
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      throw new Error(`NSE request failed (${response.status}).`);
    }
    const json = (await response.json()) as PocketPortfolioResponse;
    const sample = json.history_sample || [];
    if (sample.length >= 2) {
      const latest = sample[sample.length - 1];
      const prev = sample[sample.length - 2];
      const fiveDay = sample[Math.max(0, sample.length - 6)];
      return computeStats([
        { date: latest.date, close: latest.close },
        { date: prev.date, close: prev.close },
        { date: fiveDay.date, close: fiveDay.close },
      ]);
    }

    return {
      price: 0,
      change1d: json.change_24h ?? 0,
      change5d: json.change_24h ?? 0,
      asOf: "",
    };
  }
}

function buildOutlook(spx: MarketStat, nifty: MarketStat, vix: MarketStat) {
  const riskScore =
    (spx.change5d < -2 ? 2 : spx.change5d < 0 ? 1 : 0) +
    (nifty.change5d < -2 ? 2 : nifty.change5d < 0 ? 1 : 0) +
    (vix.price > 24 ? 2 : vix.price > 18 ? 1 : 0);

  const mode = riskScore >= 4 ? "DEFENSIVE" : riskScore >= 2 ? "BALANCED" : "GROWTH";

  const prediction =
    mode === "DEFENSIVE"
      ? "Short-term risk remains elevated. Preserve capital and avoid concentration."
      : mode === "BALANCED"
        ? "Mixed signals. Keep a balanced stance and rebalance gradually."
        : "Momentum is constructive. Risk can be taken selectively.";

  return { mode, prediction, riskScore };
}

export async function GET() {
  try {
    const apiKey = getEnv("FRED_API_KEY");
    const warnings: string[] = [];
    if (!apiKey) {
      warnings.push("Missing FRED_API_KEY. FRED-based indices will be unavailable.");
    }

    const symbols = {
      nifty: getEnv("NSE_SYMBOL") || DEFAULT_SYMBOLS.nifty,
      niftyYahoo: getEnv("NIFTY_YAHOO_SYMBOL") || DEFAULT_SYMBOLS.niftyYahoo,
      sensexYahoo: getEnv("SENSEX_YAHOO_SYMBOL") || DEFAULT_SYMBOLS.sensexYahoo,
      bankniftyYahoo: getEnv("BANKNIFTY_YAHOO_SYMBOL") || DEFAULT_SYMBOLS.bankniftyYahoo,
      spx: getEnv("FRED_SYMBOL_SPX") || DEFAULT_SYMBOLS.spx,
      vix: getEnv("FRED_SYMBOL_VIX") || DEFAULT_SYMBOLS.vix,
      usdinr: getEnv("FRED_SYMBOL_USDINR") || DEFAULT_SYMBOLS.usdinr,
      gold: getEnv("STOOQ_SYMBOL_GOLD") || DEFAULT_SYMBOLS.gold,
      btcusd: DEFAULT_SYMBOLS.btcusd,
      ethusd: DEFAULT_SYMBOLS.ethusd,
    };

    const [nifty, sensex, banknifty, spxValues, vixValues, fxValues, gold, btcusd, ethusd] =
      await Promise.all([
        fetchNseSnapshot(symbols.niftyYahoo).catch((error) => {
          warnings.push(error?.message || "NIFTY data unavailable.");
          return { price: 0, change1d: 0, change5d: 0, asOf: "" } as MarketStat;
        }),
        fetchNseSnapshot(symbols.sensexYahoo).catch((error) => {
          warnings.push(error?.message || "SENSEX data unavailable.");
          return { price: 0, change1d: 0, change5d: 0, asOf: "" } as MarketStat;
        }),
        fetchNseSnapshot(symbols.bankniftyYahoo).catch((error) => {
          warnings.push(error?.message || "BANKNIFTY data unavailable.");
          return { price: 0, change1d: 0, change5d: 0, asOf: "" } as MarketStat;
        }),
        apiKey
          ? fetchFredSeries(symbols.spx, apiKey).catch((error) => {
              warnings.push(error?.message || "S&P 500 data unavailable.");
              return [] as Array<{ date: string; close: number }>;
            })
          : Promise.resolve([] as Array<{ date: string; close: number }>),
        apiKey
          ? fetchFredSeries(symbols.vix, apiKey).catch((error) => {
              warnings.push(error?.message || "VIX data unavailable.");
              return [] as Array<{ date: string; close: number }>;
            })
          : Promise.resolve([] as Array<{ date: string; close: number }>),
        apiKey
          ? fetchFredSeries(symbols.usdinr, apiKey).catch((error) => {
              warnings.push(error?.message || "USD/INR data unavailable.");
              return [] as Array<{ date: string; close: number }>;
            })
          : Promise.resolve([] as Array<{ date: string; close: number }>),
        fetchStooqGold(symbols.gold).catch((error) => {
          warnings.push(error?.message || "Gold data unavailable.");
          return { price: 0, change1d: 0, change5d: 0, asOf: "" } as MarketStat;
        }),
        fetchKrakenTicker(symbols.btcusd).catch((error) => {
          warnings.push(error?.message || "BTC data unavailable.");
          return { price: 0, change1d: 0, change5d: 0, asOf: "" } as MarketStat;
        }),
        fetchKrakenTicker(symbols.ethusd).catch((error) => {
          warnings.push(error?.message || "ETH data unavailable.");
          return { price: 0, change1d: 0, change5d: 0, asOf: "" } as MarketStat;
        }),
      ]);

    const spx = spxValues.length ? computeStats(spxValues) : { price: 0, change1d: 0, change5d: 0, asOf: "" };
    const vix = vixValues.length ? computeStats(vixValues) : { price: 0, change1d: 0, change5d: 0, asOf: "" };
    const usdinr = fxValues.length ? computeStats(fxValues) : { price: 0, change1d: 0, change5d: 0, asOf: "" };
    const xauusd = gold;

    const outlook = buildOutlook(spx, nifty, vix);

    return NextResponse.json({
      asOf: [nifty.asOf, sensex.asOf, banknifty.asOf, spx.asOf, vix.asOf, usdinr.asOf]
        .filter(Boolean)
        .sort()
        .reverse()[0] || "",
      indices: { nifty, sensex, banknifty, spx, vix },
      fx: { usdinr },
      metals: { xauusd },
      crypto: { btcusd, ethusd },
      outlook,
      symbols,
      warnings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unable to fetch market data." },
      { status: 500 }
    );
  }
}
