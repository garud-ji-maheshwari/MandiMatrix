import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import LotCard from "../components/LotCard.jsx";
import {
  acceptOffer,
  createLot,
  createOffer,
  fetchLots,
  fetchMatchingBuyers,
  fetchOffers,
  updatePaymentStatus,
} from "../services/api.js";

const fallbackFarmerId = "66f000000000000000000001";
const fallbackBuyerId = "66f000000000000000000002";

export default function LotListing({ farmer, buyer }) {
  const [form, setForm] = useState({
    cropType: "Wheat",
    quantity: 35,
    qualityGrade: "A",
    location: "Indore, Madhya Pradesh",
  });
  const [lots, setLots] = useState([]);
  const [matchesByLot, setMatchesByLot] = useState({});
  const [offersByLot, setOffersByLot] = useState({});
  const [offerPriceByLot, setOfferPriceByLot] = useState({});
  const [status, setStatus] = useState("");

  async function loadLots() {
    const data = await fetchLots();
    setLots(data.lots || []);

    const offerEntries = await Promise.all(
      (data.lots || []).map(async (lot) => {
        const offerData = await fetchOffers(lot._id);
        return [lot._id, offerData.offers || []];
      }),
    );
    setOffersByLot(Object.fromEntries(offerEntries));
  }

  useEffect(() => {
    loadLots().catch(() => setStatus("Unable to load lots."));
  }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitLot(event) {
    event.preventDefault();
    setStatus("Creating lot...");
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      await createLot({
        ...form,
        farmerId: farmer?._id || fallbackFarmerId,
        quantity: Number(form.quantity),
        auctionWindowEnd: tomorrow.toISOString(),
      });
      setStatus("Lot listed and visible to buyers.");
      await loadLots();
    } catch (error) {
      setStatus(error.response?.data?.message || "Unable to create lot.");
    }
  }

  async function matchBuyers(lotId) {
    setStatus("Matching buyers...");
    try {
      const data = await fetchMatchingBuyers(lotId);
      setMatchesByLot((current) => ({
        ...current,
        [lotId]: data.matchingBuyers || [],
      }));
      setStatus("Buyer matching complete.");
    } catch (error) {
      setStatus(error.response?.data?.message || "Unable to match buyers.");
    }
  }

  async function submitOffer(lotId) {
    const pricePerQuintal = Number(offerPriceByLot[lotId] || 0);
    if (!pricePerQuintal) {
      setStatus("Enter a valid offer price.");
      return;
    }

    setStatus("Submitting offer...");
    try {
      await createOffer({
        lotId,
        buyerId: buyer?._id || fallbackBuyerId,
        pricePerQuintal,
        message: "Interested in direct purchase after quality check.",
      });
      const offerData = await fetchOffers(lotId);
      setOffersByLot((current) => ({ ...current, [lotId]: offerData.offers || [] }));
      await loadLots();
      setStatus("Offer submitted.");
    } catch (error) {
      setStatus(error.response?.data?.message || "Unable to submit offer.");
    }
  }

  async function acceptBid(offerId) {
    setStatus("Accepting offer...");
    try {
      await acceptOffer(offerId);
      await loadLots();
      setStatus("Offer accepted; other offers marked rejected.");
    } catch (error) {
      setStatus(error.response?.data?.message || "Unable to accept offer.");
    }
  }

  async function togglePayment(lot) {
    setStatus("Updating mock payment status...");
    const nextStatus =
      lot.paymentStatus === "payment_received" ? "payment_pending" : "payment_received";
    try {
      await updatePaymentStatus(lot._id, nextStatus);
      await loadLots();
      setStatus("Mock payment status updated.");
    } catch (error) {
      setStatus(error.response?.data?.message || "Unable to update payment.");
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-market">Phase 2 and 3</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Lot listing and offers</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Farmers list crop lots with a self-declared A/B/C quality grade; buyers place digital offers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadLots()}
          title="Reload lots"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
        >
          <RefreshCw className="h-4 w-4" />
          Reload
        </button>
      </div>

      <form
        onSubmit={submitLot}
        className="rounded-md border border-slate-200 bg-white p-5 shadow-panel"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Crop" value={form.cropType} onChange={(value) => update("cropType", value)} />
          <Field
            label="Quantity"
            value={form.quantity}
            onChange={(value) => update("quantity", value)}
            inputMode="decimal"
          />
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Quality grade</span>
            <select
              value={form.qualityGrade}
              onChange={(event) => update("qualityGrade", event.target.value)}
              className="min-h-10 w-full rounded-md border border-slate-300 px-3"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </label>
          <Field
            label="Location"
            value={form.location}
            onChange={(value) => update("location", value)}
          />
          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center gap-2 self-end rounded-md bg-leaf px-4 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            List lot
          </button>
        </div>
        {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
      </form>

      <div className="space-y-4">
        {lots.map((lot) => (
          <LotCard
            key={lot._id}
            lot={lot}
            offers={offersByLot[lot._id]}
            matchingBuyers={matchesByLot[lot._id]}
            onMatch={matchBuyers}
            onOffer={submitOffer}
            onAccept={acceptBid}
            onPaymentToggle={togglePayment}
            offerPrice={offerPriceByLot[lot._id] || ""}
            setOfferPrice={(value) =>
              setOfferPriceByLot((current) => ({ ...current, [lot._id]: value }))
            }
          />
        ))}
        {!lots.length && (
          <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Create the first lot to start buyer matching.
          </div>
        )}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, inputMode = "text" }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode={inputMode}
        className="min-h-10 w-full rounded-md border border-slate-300 px-3"
      />
    </label>
  );
}
