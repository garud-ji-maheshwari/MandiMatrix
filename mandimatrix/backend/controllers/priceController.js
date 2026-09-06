import { getPriceComparison, getPriceTrend } from "../services/agmarknetService.js";

export async function listPrices(req, res, next) {
  try {
    const data = await getPriceComparison(req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function listPriceTrend(req, res, next) {
  try {
    const data = await getPriceTrend(req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
}
