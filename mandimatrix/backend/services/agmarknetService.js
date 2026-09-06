import axios from "axios";
import mongoose from "mongoose";

import PriceCache from "../models/PriceCache.js";

const cropAliases = {
  wheat: "Wheat",
  soybean: "Soybean",
  potato: "Potato",
};

const stateAliases = {
  MP: "Madhya Pradesh",
  "Madhya Pradesh": "Madhya Pradesh",
};

const mandiTemplates = {
  Indore: [
    { mandi: "Indore", district: "Indore", distanceKm: 8, offset: 0 },
    { mandi: "Mhow", district: "Indore", distanceKm: 24, offset: -35 },
    { mandi: "Dewas", district: "Dewas", distanceKm: 39, offset: 55 },
    { mandi: "Ujjain", district: "Ujjain", distanceKm: 56, offset: 85 },
  ],
  Bhopal: [
    { mandi: "Bhopal", district: "Bhopal", distanceKm: 10, offset: 0 },
    { mandi: "Sehore", district: "Sehore", distanceKm: 37, offset: 45 },
    { mandi: "Vidisha", district: "Vidisha", distanceKm: 58, offset: -25 },
    { mandi: "Raisen", district: "Raisen", distanceKm: 44, offset: 65 },
  ],
  Ujjain: [
    { mandi: "Ujjain", district: "Ujjain", distanceKm: 9, offset: 0 },
    { mandi: "Dewas", district: "Dewas", distanceKm: 41, offset: 50 },
    { mandi: "Nagda", district: "Ujjain", distanceKm: 55, offset: -20 },
    { mandi: "Indore", district: "Indore", distanceKm: 56, offset: 70 },
  ],
};

const basePrices = {
  Wheat: 2470,
  Soybean: 4380,
  Potato: 1320,
};

function dbReady() {
  return mongoose.connection.readyState === 1;
}

function normalizeCrop(crop = "wheat") {
  return cropAliases[crop.toLowerCase()] || crop;
}

function normalizeState(state = "MP") {
  return stateAliases[state] || state;
}

function normalizeDistrict(district = "Indore") {
  const found = Object.keys(mandiTemplates).find(
    (name) => name.toLowerCase() === district.toLowerCase(),
  );
  return found || "Indore";
}

function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function makeCacheKey({ crop, state, district }) {
  return `${crop}:${state}:${district}:${dateKey()}`.toLowerCase();
}

function seededWave(index, crop) {
  const cropSeed = crop
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Math.round(Math.sin((index + cropSeed) / 3) * 42 + (index % 5) * 11);
}

function buildMockHistory(crop, district, days = 30) {
  const base = basePrices[crop] || 2200;
  const districtBump = district.length * 9;

  return Array.from({ length: days }, (_, index) => {
    const daysAgo = days - index - 1;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    return {
      date: dateKey(date),
      modalPrice: base + districtBump + seededWave(index, crop),
    };
  });
}

function buildMockPrices(crop, state, district) {
  const history = buildMockHistory(crop, district);
  const latestPrice = history.at(-1).modalPrice;
  const templates = mandiTemplates[district] || mandiTemplates.Indore;

  const prices = templates.map((template, index) => {
    const modalPrice = latestPrice + template.offset + index * 12;
    return {
      mandi: template.mandi,
      market: template.mandi,
      crop,
      state,
      district: template.district,
      distanceKm: template.distanceKm,
      minPrice: modalPrice - 95,
      maxPrice: modalPrice + 110,
      modalPrice,
      arrivals: `${140 + index * 35} quintal`,
      lastUpdated: dateKey(),
    };
  });

  return { prices, history, source: "mock-fallback" };
}

async function fetchAgmarknetPrices({ crop, state, district }) {
  if (!process.env.AGMARKNET_API_KEY) {
    return null;
  }

  const resourceId =
    process.env.AGMARKNET_RESOURCE_ID || "9ef84268-d588-465a-a308-a864a43d0070";
  const response = await axios.get(`https://api.data.gov.in/resource/${resourceId}`, {
    timeout: 3500,
    params: {
      "api-key": process.env.AGMARKNET_API_KEY,
      format: "json",
      limit: 25,
      "filters[commodity]": crop,
      "filters[state]": state,
      "filters[district]": district,
    },
  });

  const records = response.data?.records || [];
  const prices = records
    .map((record, index) => {
      const modalPrice = Number(record.modal_price || record.modalPrice || 0);
      if (!modalPrice) return null;

      return {
        mandi: record.market || record.mandi || `Mandi ${index + 1}`,
        market: record.market || record.mandi || `Mandi ${index + 1}`,
        crop,
        state: record.state || state,
        district: record.district || district,
        distanceKm: 10 + index * 14,
        minPrice: Number(record.min_price || modalPrice - 80),
        maxPrice: Number(record.max_price || modalPrice + 80),
        modalPrice,
        arrivals: record.arrivals || "Demo estimate",
        lastUpdated: record.arrival_date || dateKey(),
      };
    })
    .filter(Boolean)
    .slice(0, 4);

  if (prices.length < 3) {
    return null;
  }

  return {
    prices,
    history: buildMockHistory(crop, district),
    source: "agmarknet-api",
  };
}

function withNetProfit(prices, transportCostPerKm) {
  return prices
    .map((price) => ({
      ...price,
      transportCost: Number((price.distanceKm * transportCostPerKm).toFixed(2)),
      netProfitPerQuintal: Number(
        (price.modalPrice - price.distanceKm * transportCostPerKm).toFixed(2),
      ),
    }))
    .sort((a, b) => b.netProfitPerQuintal - a.netProfitPerQuintal)
    .map((price, index) => ({ ...price, rank: index + 1 }));
}

export async function getPriceComparison({
  crop: rawCrop,
  state: rawState,
  district: rawDistrict,
  transportCostPerKm = 8,
}) {
  const crop = normalizeCrop(rawCrop);
  const state = normalizeState(rawState);
  const district = normalizeDistrict(rawDistrict);
  const numericTransportCost = Number(transportCostPerKm) || 8;
  const cacheKey = makeCacheKey({ crop, state, district });

  let payload = null;

  if (dbReady()) {
    const cached = await PriceCache.findOne({ cacheKey }).lean();
    if (cached) {
      payload = {
        prices: cached.prices,
        history: cached.history,
        source: cached.source,
      };
    }
  }

  if (!payload) {
    try {
      payload = await fetchAgmarknetPrices({ crop, state, district });
    } catch (error) {
      console.warn("Agmarknet fetch failed, using mock fallback:", error.message);
    }
  }

  if (!payload) {
    payload = buildMockPrices(crop, state, district);
  }

  if (dbReady()) {
    await PriceCache.findOneAndUpdate(
      { cacheKey },
      { cacheKey, crop, state, district, ...payload, refreshedOn: new Date() },
      { upsert: true, new: true },
    );
  }

  const mandis = withNetProfit(payload.prices, numericTransportCost);
  return {
    crop,
    state,
    district,
    transportCostPerKm: numericTransportCost,
    source: payload.source,
    mandis,
    bestMandi: mandis[0],
  };
}

export async function getPriceTrend({
  crop: rawCrop,
  district: rawDistrict,
  days = 30,
}) {
  const crop = normalizeCrop(rawCrop);
  const district = normalizeDistrict(rawDistrict);
  const numericDays = Math.min(Math.max(Number(days) || 30, 7), 60);

  if (dbReady()) {
    const cached = await PriceCache.findOne({
      crop,
      district,
      refreshedOn: { $gte: new Date(`${dateKey()}T00:00:00.000Z`) },
    }).lean();

    if (cached?.history?.length) {
      return {
        crop,
        district,
        days: numericDays,
        source: cached.source,
        history: cached.history.slice(-numericDays),
      };
    }
  }

  return {
    crop,
    district,
    days: numericDays,
    source: "mock-fallback",
    history: buildMockHistory(crop, district, numericDays),
  };
}
