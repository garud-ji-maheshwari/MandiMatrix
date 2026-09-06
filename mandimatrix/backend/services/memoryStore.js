export const memoryStore = {
  farmers: [],
  buyers: [
    {
      _id: "buyer_demo_1",
      name: "Mahakal Agro Traders",
      phone: "9000000001",
      businessType: "wholesaler",
      verified: true,
      location: "Indore, Madhya Pradesh",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "buyer_demo_2",
      name: "Narmada Food Processors",
      phone: "9000000002",
      businessType: "processor",
      verified: true,
      location: "Bhopal, Madhya Pradesh",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "buyer_demo_3",
      name: "Ujjain Fresh Supply",
      phone: "9000000003",
      businessType: "retailer",
      verified: false,
      location: "Ujjain, Madhya Pradesh",
      createdAt: new Date().toISOString(),
    },
  ],
  lots: [],
  offers: [],
  disputes: [],
};

export function makeDemoId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
