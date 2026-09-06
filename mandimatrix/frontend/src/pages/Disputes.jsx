import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { createDispute, fetchDisputes } from "../services/api.js";

const fallbackLotId = "66f000000000000000000003";

export default function Disputes() {
  const [form, setForm] = useState({
    lotId: fallbackLotId,
    raisedBy: "farmer",
    category: "payment",
    description: "Payment confirmation is delayed after accepted offer.",
  });
  const [disputes, setDisputes] = useState([]);
  const [status, setStatus] = useState("");

  async function loadDisputes() {
    const data = await fetchDisputes();
    setDisputes(data.disputes || []);
  }

  useEffect(() => {
    loadDisputes().catch(() => setStatus("Unable to load disputes."));
  }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setStatus("Creating dispute...");
    try {
      await createDispute(form);
      setStatus("Dispute opened for admin tracking.");
      await loadDisputes();
    } catch (error) {
      setStatus(error.response?.data?.message || "Unable to create dispute.");
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-soil">Phase 3 polish</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Dispute tracking</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Raise payment, quality, or other grievances and track resolution status with badges.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadDisputes()}
          title="Reload disputes"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
        >
          <RefreshCw className="h-4 w-4" />
          Reload
        </button>
      </div>

      <form
        onSubmit={submit}
        className="rounded-md border border-slate-200 bg-white p-5 shadow-panel"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_160px_160px]">
          <Field label="Lot ID" value={form.lotId} onChange={(value) => update("lotId", value)} />
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Raised by</span>
            <select
              value={form.raisedBy}
              onChange={(event) => update("raisedBy", event.target.value)}
              className="min-h-10 w-full rounded-md border border-slate-300 px-3"
            >
              <option value="farmer">farmer</option>
              <option value="buyer">buyer</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Category</span>
            <select
              value={form.category}
              onChange={(event) => update("category", event.target.value)}
              className="min-h-10 w-full rounded-md border border-slate-300 px-3"
            >
              <option value="payment">payment</option>
              <option value="quality">quality</option>
              <option value="other">other</option>
            </select>
          </label>
        </div>
        <label className="mt-4 block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Description</span>
          <textarea
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            rows="3"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-soil px-4 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Open dispute
        </button>
        {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {disputes.map((dispute) => (
          <article
            key={dispute._id}
            className="rounded-md border border-slate-200 bg-white p-4 shadow-panel"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-950">{dispute.category}</h3>
                <p className="mt-1 text-sm text-slate-600">{dispute.description}</p>
              </div>
              <span
                className={`rounded px-2 py-1 text-xs font-semibold ${
                  dispute.status === "resolved"
                    ? "bg-leaf/10 text-leaf"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {dispute.status}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Lot {dispute.lotId} by {dispute.raisedBy}
            </p>
          </article>
        ))}
        {!disputes.length && (
          <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No disputes yet.
          </div>
        )}
      </div>
    </section>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 w-full rounded-md border border-slate-300 px-3"
      />
    </label>
  );
}
