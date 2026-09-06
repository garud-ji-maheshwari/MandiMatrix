import Anthropic from "@anthropic-ai/sdk";

function buildFallbackExplanation(message, cropContext = {}) {
  const crop = cropContext.crop || "selected crop";
  const district = cropContext.district || "your district";
  const history = cropContext.history || [];
  const first = history[0]?.modalPrice;
  const last = history.at?.(-1)?.modalPrice || history[history.length - 1]?.modalPrice;
  const direction =
    first && last ? (last >= first ? "upar ja raha hai" : "neeche aa raha hai") : "stable hai";

  return `Aapke sawal "${message}" ke hisaab se ${district} me ${crop} ka daam abhi ${direction}. Demo data ke mutabik 2-3 mandiyon ka net-profit compare karke sabse pehle highest net-profit wali mandi dekhiye. Agar daam badh raha hai aur storage possible hai, 3-5 din wait karna better ho sakta hai; warna verified buyer offer milte hi sell karna safer rahega.`;
}

export async function explainPriceTrend(message, cropContext) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      reply: buildFallbackExplanation(message, cropContext),
      source: "mock-llm",
    };
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20240620",
    max_tokens: 350,
    messages: [
      {
        role: "user",
        content: `Explain this mandi price trend in simple Hindi/Marathi-friendly language and suggest whether a farmer should sell soon. User question: ${message}. Crop context: ${JSON.stringify(cropContext)}`,
      },
    ],
  });

  return {
    reply: response.content?.[0]?.text || buildFallbackExplanation(message, cropContext),
    source: "anthropic",
  };
}
