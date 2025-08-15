import { useState } from "react";
import { CustomerScreen } from "./components/CustomerScreen";
import { StaffScreen } from "./components/StaffScreen";
import { FooterBar } from "./components/UI";
import { PRODUCTS ,CATEGORIES, demoSeedOrders } from "./components/mockData";

export default function App() {
  const [tab, setTab] = useState<"customer" | "staff">("customer");
  console.log(PRODUCTS)

  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-900">
     <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-neutral-200">
  <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
    <div className="font-bold text-lg">🍺 Пабын QR Меню</div>
    <nav className="flex gap-1 text-sm">
      <button
        onClick={() => setTab("customer")}
        className={`px-3 py-1.5 rounded-full ${
          tab === "customer" ? "bg-black text-white" : "bg-neutral-100"
        }`}
      >
        Customer
      </button>
      <button
        onClick={() => setTab("staff")}
        className={`px-3 py-1.5 rounded-full ${
          tab === "staff" ? "bg-black text-white" : "bg-neutral-100"
        }`}
      >
        Staff
      </button>
    </nav>
  </div>
</header>

      <main className="mx-auto max-w-md px-4 pb-40">
        {tab === "customer" ? <CustomerScreen products={PRODUCTS} categories={CATEGORIES} /> : <StaffScreen seedOrders={demoSeedOrders()} />}
      </main>
      <FooterBar />
    </div>
  );
}


