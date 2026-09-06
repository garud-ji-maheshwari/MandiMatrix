import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import PriceCard from "../components/PriceCard.jsx";
import { fetchPrices, fetchTrend } from "../services/api.js";

const crops = ["wheat", "soybean", "potato"];
const districts = ["Indore", "Bhopal", "Ujjain"];

export default function PriceCompare({ onContextChange }) {
  const [crop, setCrop] = useState("wheat");
  const [district, setDistrict] = useState("Indore");
  const [transportCostPerKm, setTransportCostPerKm] = useState(8);
  const [comparison, setComparison] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [priceData, trendData] = await Promise.all([
        fetchPrices({
          crop,
          state: "MP",
          district,
          transportCostPerKm,
        }),
        fetchTrend({ crop, district, days: 30 }),
      ]);

      setComparison(priceData);
      setTrend(trendData.history || []);
      onContextChange?.({
        crop: priceData.crop,
        district: priceData.district,
        bestMandi: priceData.bestMandi,
        history: trendData.history || [],
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load prices.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-leaf">Phase 1 core</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Price comparison</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Compare nearby mandis by modal price, estimated transport cost, and net profit per quintal.
          </p>
        </div>

        <form
          className="grid gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-panel sm:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            loadData();
          }}
        >
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Crop</span>
            <select
              value={crop}
              onChange={(event) => setCrop(event.target.value)}
              className="min-h-10 w-full rounded-md border border-slate-300 px-3"
            >
              {crops.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">District</span>
            <select
              value={district}
              onChange={(event) => setDistrict(event.target.value)}
              className="min-h-10 w-full rounded-md border border-slate-300 px-3"
            >
              {districts.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Transport/km</span>
            <input
              value={transportCostPerKm}
              onChange={(event) => setTransportCostPerKm(event.target.value)}
              inputMode="decimal"
              className="min-h-10 w-full rounded-md border border-slate-300 px-3"
            />
          </label>
          <button
            type="submit"
            title="Refresh prices"
            className="inline-flex min-h-10 items-center justify-center gap-2 self-end rounded-md bg-leaf px-4 text-sm font-semibold text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(comparison?.mandis || []).map((mandi) => (
          <PriceCard key={`${mandi.mandi}-${mandi.rank}`} mandi={mandi} />
        ))}
      </div>

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">30-day price trend</h3>
            <p className="text-sm text-slate-500">
              Source: {comparison?.source || "loading"}; crop: {comparison?.crop || crop}
            </p>
          </div>
          {comparison?.bestMandi && (
            <span className="rounded bg-leaf/10 px-3 py-2 text-sm font-semibold text-leaf">
              Best net: {comparison.bestMandi.mandi}
            </span>
          )}
        </div>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ left: 4, right: 18, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={24} />
              <YAxis tick={{ fontSize: 11 }} width={58} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="modalPrice"
                stroke="#167047"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </section>
  );
}
