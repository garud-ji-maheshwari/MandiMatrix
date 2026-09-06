import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 8000,
});

export async function fetchPrices(params) {
  const { data } = await api.get("/prices", { params });
  return data;
}

export async function fetchTrend(params) {
  const { data } = await api.get("/prices/trend", { params });
  return data;
}

export async function registerFarmer(payload) {
  const { data } = await api.post("/farmers/register", payload);
  return data;
}

export async function registerBuyer(payload) {
  const { data } = await api.post("/buyers/register", payload);
  return data;
}

export async function createLot(payload) {
  const { data } = await api.post("/lots", payload);
  return data;
}

export async function fetchLots() {
  const { data } = await api.get("/lots");
  return data;
}

export async function fetchMatchingBuyers(lotId) {
  const { data } = await api.get(`/lots/${lotId}/matching-buyers`);
  return data;
}

export async function createOffer(payload) {
  const { data } = await api.post("/offers", payload);
  return data;
}

export async function fetchOffers(lotId) {
  const { data } = await api.get("/offers", { params: { lotId } });
  return data;
}

export async function acceptOffer(offerId) {
  const { data } = await api.patch(`/offers/${offerId}/accept`);
  return data;
}

export async function updatePaymentStatus(lotId, paymentStatus) {
  const { data } = await api.patch(`/lots/${lotId}/payment-status`, {
    paymentStatus,
  });
  return data;
}

export async function createDispute(payload) {
  const { data } = await api.post("/disputes", payload);
  return data;
}

export async function fetchDisputes() {
  const { data } = await api.get("/disputes");
  return data;
}

export async function sendChatMessage(payload) {
  const { data } = await api.post("/chat", payload);
  return data;
}
