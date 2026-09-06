import { Save } from "lucide-react";
import { useState } from "react";

import { registerBuyer } from "../services/api.js";

export default function BuyerLogin({ buyer, onRegistered }) {
  const [form, setForm] = useState({
    name: "Shree Agro Foods",
    phone: "9988700000",
    businessType: "processor",
    verified: true,
    location: "Indore, Madhya Pradesh",
  });
  const [status, setStatus] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setStatus("Saving...");
    try {
      const data = await registerBuyer(form);
      onRegistered(data.buyer);
      setStatus(`Registered through ${data.source}`);
    } catch (error) {
      setStatus(error.response?.data?.message || "Registration failed");
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form
        onSubmit={submit}
        className="rounded-md border border-slate-200 bg-white p-5 shadow-panel"
      >
        <p className="text-sm font-semibold uppercase tracking-normal text-market">Phase 2</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-950">Buyer registration</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={form.name} onChange={(value) => update("name", value)} />
          <Field label="Phone" value={form.phone} onChange={(value) => update("phone", value)} />
          <Field
            label="Business type"
            value={form.businessType}
            onChange={(value) => update("businessType", value)}
          />
          <Field
            label="Location"
            value={form.location}
            onChange={(value) => update("location", value)}
          />
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.verified}
              onChange={(event) => update("verified", event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Verified buyer
          </label>
        </div>
        <button
          type="submit"
          className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-market px-4 text-sm font-semibold text-white"
        >
          <Save className="h-4 w-4" />
          Register
        </button>
        {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
      </form>

      <aside className="rounded-md border border-slate-200 bg-white p-5 shadow-panel">
        <h3 className="font-semibold text-slate-950">Current buyer</h3>
        {buyer ? (
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-slate-900">{buyer.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Business</dt>
              <dd className="font-medium text-slate-900">{buyer.businessType}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Location</dt>
              <dd className="font-medium text-slate-900">{buyer.location}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-slate-500">Seeded demo buyers are available for matching.</p>
        )}
      </aside>
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
