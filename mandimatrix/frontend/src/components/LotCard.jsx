import { Check, CreditCard, Users } from "lucide-react";

function rupee(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function LotCard({
  lot,
  offers,
  matchingBuyers,
  onMatch,
  onOffer,
  onAccept,
  onPaymentToggle,
  offerPrice,
  setOfferPrice,
}) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{lot.cropType}</h3>
          <p className="text-sm text-slate-600">
            {lot.quantity} quintal, grade {lot.qualityGrade}, {lot.location}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700">
            {lot.status}
          </span>
          <span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
            {lot.paymentStatus === "payment_received" ? "Payment received" : "Payment pending"}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => onMatch(lot._id)}
          title="Find matching buyers"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-market px-3 text-sm font-semibold text-market hover:bg-market hover:text-white"
        >
          <Users className="h-4 w-4" />
          Match buyers
        </button>
        <button
          type="button"
          onClick={() => onPaymentToggle(lot)}
          title="Toggle mock payment status"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          <CreditCard className="h-4 w-4" />
          Mock payment
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border border-slate-200 p-3">
          <h4 className="text-sm font-semibold text-slate-950">Matching buyers</h4>
          <div className="mt-2 space-y-2">
            {(matchingBuyers || []).map((buyer) => (
              <div
                key={buyer._id}
                className="flex items-center justify-between gap-2 rounded bg-slate-50 px-3 py-2 text-sm"
              >
                <span>
                  {buyer.name}{" "}
                  <span className="text-slate-500">({buyer.businessType})</span>
                </span>
                <span className="text-xs font-semibold text-leaf">Score {buyer.matchScore}</span>
              </div>
            ))}
            {!matchingBuyers?.length && (
              <p className="text-sm text-slate-500">Run buyer matching for this lot.</p>
            )}
          </div>
        </section>

        <section className="rounded-md border border-slate-200 p-3">
          <h4 className="text-sm font-semibold text-slate-950">Digital offers</h4>
          <div className="mt-2 flex gap-2">
            <input
              value={offerPrice}
              onChange={(event) => setOfferPrice(event.target.value)}
              inputMode="numeric"
              placeholder="Price/qtl"
              className="min-h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            />
            <button
              type="button"
              onClick={() => onOffer(lot._id)}
              title="Submit offer"
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-leaf px-3 text-sm font-semibold text-white"
            >
              Bid
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {(offers || []).map((offer) => (
              <div
                key={offer._id}
                className="flex items-center justify-between gap-3 rounded bg-slate-50 px-3 py-2 text-sm"
              >
                <span>
                  {rupee(offer.pricePerQuintal)}{" "}
                  <span className="text-slate-500">{offer.status}</span>
                </span>
                {offer.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => onAccept(offer._id)}
                    title="Accept offer"
                    aria-label="Accept offer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-market text-white"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {!offers?.length && <p className="text-sm text-slate-500">No offers yet.</p>}
          </div>
        </section>
      </div>
    </article>
  );
}
