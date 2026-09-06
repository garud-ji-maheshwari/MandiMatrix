import { Save } from "lucide-react";
import { useState } from "react";

import { registerFarmer } from "../services/api.js";

export default function FarmerLogin({ farmer, onRegistered }) {
  const [form, setForm] = useState({
    name: "Ramesh Patidar",
    phone: "9876500000",
    state: "Madhya Pradesh",
    district: "Indore",
    village: "Sanwer",
    preferredLanguage: "hi",
  });
  const [status, setStatus] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setStatus("Saving...");

    try {
      const data = await registerFarmer({
        name: form.name,
        phone: form.phone,
        preferredLanguage: form.preferredLanguage,
        location: {
          state: form.state,
          district: form.district,
          village: form.village,
        },
      });
      onRegistered(data.farmer);
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
        <p className="text-sm font-semibold uppercase tracking-normal text-leaf">Phase 1 core</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-950">Farmer registration</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={form.name} onChange={(value) => update("name", value)} />
          <Field label="Phone" value={form.phone} onChange={(value) => update("phone", value)} />
          <Field label="State" value={form.state} onChange={(value) => update("state", value)} />
          <Field label="District" value={form.district} onChange={(value) => update("district", value)} />
          <Field label="Village" value={form.village} onChange={(value) => update("village", value)} />
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Language</span>
            <select
              value={form.preferredLanguage}
              onChange={(event) => update("preferredLanguage", event.target.value)}
              className="min-h-10 w-full rounded-md border border-slate-300 px-3"
            >
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
        <button
          type="submit"
          className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-leaf px-4 text-sm font-semibold text-white"
        >
          <Save className="h-4 w-4" />
          Register
        </button>
        {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
      </form>

      <aside className="rounded-md border border-slate-200 bg-white p-5 shadow-panel">
        <h3 className="font-semibold text-slate-950">Current farmer</h3>
        {farmer ? (
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-slate-900">{farmer.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Phone</dt>
              <dd className="font-medium text-slate-900">{farmer.phone}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Location</dt>
              <dd className="font-medium text-slate-900">
                {farmer.location.village}, {farmer.location.district}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No farmer registered in this browser session.</p>
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
