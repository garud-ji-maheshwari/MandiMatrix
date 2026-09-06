import { BarChart3, HandCoins, MessageCircle, Scale, Store, UserRound } from "lucide-react";
import { useState } from "react";

import heroImg from "./assets/hero.png";
import ChatWidget from "./components/ChatWidget.jsx";
import BuyerLogin from "./pages/BuyerLogin.jsx";
import Disputes from "./pages/Disputes.jsx";
import FarmerLogin from "./pages/FarmerLogin.jsx";
import LotListing from "./pages/LotListing.jsx";
import PriceCompare from "./pages/PriceCompare.jsx";

const tabs = [
  { id: "prices", label: "Prices", icon: BarChart3 },
  { id: "farmer", label: "Farmer", icon: UserRound },
  { id: "buyer", label: "Buyer", icon: Store },
  { id: "lots", label: "Lots", icon: HandCoins },
  { id: "disputes", label: "Disputes", icon: Scale },
];

function App() {
  const [activeTab, setActiveTab] = useState("prices");
  const [farmer, setFarmer] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const [priceContext, setPriceContext] = useState(null);

  return (
    <main className="min-h-screen bg-[#f7f8f2] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <img
              src={heroImg}
              alt="Fresh produce"
              className="h-16 w-16 rounded-md object-cover shadow-panel"
            />
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-soil sm:text-3xl">
                MandiMatrix
              </h1>
              <p className="max-w-2xl text-sm text-slate-600">
                Farmer market linkage, price discovery, buyer offers, and grievance tracking for SIH 2026.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2">
            <span className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
              Farmer: {farmer?.name || "Not registered"}
            </span>
            <span className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
              Buyer: {buyer?.name || "Demo buyers available"}
            </span>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                aria-label={tab.label}
                className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border px-3 transition sm:gap-2 ${
                  isActive
                    ? "border-leaf bg-leaf text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-market hover:text-market"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden text-sm font-medium sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === "prices" && <PriceCompare onContextChange={setPriceContext} />}
        {activeTab === "farmer" && <FarmerLogin farmer={farmer} onRegistered={setFarmer} />}
        {activeTab === "buyer" && <BuyerLogin buyer={buyer} onRegistered={setBuyer} />}
        {activeTab === "lots" && <LotListing farmer={farmer} buyer={buyer} />}
        {activeTab === "disputes" && <Disputes />}
      </div>

      <ChatWidget cropContext={priceContext} />

      <button
        type="button"
        onClick={() => setActiveTab("prices")}
        title="Open price dashboard"
        aria-label="Open price dashboard"
        className="fixed bottom-5 left-5 hidden h-11 w-11 items-center justify-center rounded-md bg-market text-white shadow-panel sm:inline-flex"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    </main>
  );
}

export default App;
