import { MapPin, Trophy } from "lucide-react";

function rupee(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function PriceCard({ mandi }) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-950">{mandi.mandi}</h3>
            {mandi.rank === 1 && (
              <span className="inline-flex items-center gap-1 rounded bg-crop/20 px-2 py-1 text-xs font-semibold text-soil">
                <Trophy className="h-3.5 w-3.5" />
                Best
              </span>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
            <MapPin className="h-3.5 w-3.5" />
            {mandi.district}, {mandi.distanceKm} km
          </p>
        </div>
        <span className="rounded bg-leaf px-2 py-1 text-xs font-semibold text-white">
          #{mandi.rank}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">Modal price</dt>
          <dd className="font-semibold text-slate-950">{rupee(mandi.modalPrice)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Net profit/qtl</dt>
          <dd className="font-semibold text-leaf">{rupee(mandi.netProfitPerQuintal)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Transport</dt>
          <dd className="font-medium text-slate-800">{rupee(mandi.transportCost)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Range</dt>
          <dd className="font-medium text-slate-800">
            {rupee(mandi.minPrice)} - {rupee(mandi.maxPrice)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
