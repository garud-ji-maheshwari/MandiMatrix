import { explainPriceTrend } from "../services/llmService.js";

export async function chat(req, res, next) {
  try {
    const { message, cropContext = {} } = req.body;

    if (!message) {
      return res.status(400).json({ message: "message is required" });
    }

    const data = await explainPriceTrend(message, cropContext);
    return res.json(data);
  } catch (error) {
    next(error);
  }
}
