import React, { useEffect, useMemo, useState } from "react";

// ✅ SINGLE-FILE, MOBILE-FIRST DEMO (TypeScript)
// - Customer QR Menu (menu → cart → place order → track status)
// - Staff Board with simple PIN login (1234)
// - No backend: mock data + local state only (ready to swap with your MERN APIs)
// - TailwindCSS utility classes; zero external UI deps
// - Designed for phones, still works on desktop

// -----------------------------
// Helpers & Types
// -----------------------------
const currency = (n: number) => `₮${n.toLocaleString("en-US")}`;

export enum Status {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  SERVED = "served",
  PAID = "paid",
}

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  img: string;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

interface Order {
  id: number;
  tableCode: string;
  items: CartItem[];
  total: number;
  status: Status;
  createdAt?: string;
}

// -----------------------------
// Mock Data
// -----------------------------
const CATEGORIES: Category[] = [
  { id: "c1", name: "🍻 Ундаа" },
  { id: "c2", name: "🍟 Хоол/Закуска" },
  { id: "c3", name: "☕ Кофе/Бусад" },
];

const PRODUCTS: Product[] = [
  { id: "p1", name: "Beer 500ml", price: 6500, categoryId: "c1", img: "https://placehold.co/80x80" },
  { id: "p2", name: "Mojito", price: 8000, categoryId: "c1", img: "https://placehold.co/80x80" },
  { id: "p3", name: "Fries", price: 4500, categoryId: "c2", img: "https://placehold.co/80x80" },
  { id: "p4", name: "Chicken Wings", price: 12000, categoryId: "c2", img: "https://placehold.co/80x80" },
  { id: "p5", name: "Americano", price: 6000, categoryId: "c3", img: "https://placehold.co/80x80" },
];

// Seed order id generator
let orderCounter = 105;

// -----------------------------
// Root App
// -----------------------------
export default function App() {
  const [tab, setTab] = useState<"customer" | "staff">("customer");

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

      <main className="mx-auto max-w-md px-4 pb-28">
        {tab === "customer" ? <CustomerScreen /> : <StaffScreen />}
      </main>

      <FooterBar />
    </div>
  );
}

// -----------------------------
// Customer Screen
// -----------------------------
function CustomerScreen() {
  const tableFromUrl = useTableFromURL();
  const [query, setQuery] = useState<string>("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]); // {productId, name, price, qty}
  const [orders, setOrders] = useState<Order[]>([]); // placed orders for this session
  const [trackingId, setTrackingId] = useState<number | null>(null);

  const filtered = useMemo<Product[]>(() => {
    return PRODUCTS.filter(
      (p) =>
        (activeCat === "all" || p.categoryId === activeCat) &&
        p.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [activeCat, query]);

  const subtotal = useMemo<number>(
    () => cart.reduce((sum, i) => sum + i.price * i.qty, 0),
    [cart]
  );

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.productId === p.id);
      if (idx >= 0) {
        const clone = [...prev];
        clone[idx] = { ...clone[idx], qty: clone[idx].qty + 1 };
        return clone;
      }
      return [...prev, { productId: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  };

  const decQty = (pid: string) =>
    setCart((prev) =>
      prev
        .map((x) => (x.productId === pid ? { ...x, qty: x.qty - 1 } : x))
        .filter((x) => x.qty > 0)
    );

  const clearCart = () => setCart([]);

  const placeOrder = () => {
    if (!cart.length) return;
    const newOrder: Order = {
      id: ++orderCounter,
      tableCode: tableFromUrl || "T?",
      items: cart.map((c) => ({ ...c })),
      total: subtotal,
      status: Status.PENDING,
      createdAt: new Date().toISOString(),
    };
    setOrders((o) => [newOrder, ...o]);
    setTrackingId(newOrder.id);
    clearCart();
  };

  const currentTracking = orders.find((o) => o.id === trackingId) || null;

  return (
    <section className="py-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-neutral-500">Ширээ</div>
          <div className="font-semibold text-lg">#{tableFromUrl || "—"}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-neutral-500">Таны сагс</div>
          <div className="font-semibold">{cart.length} бараа</div>
        </div>
      </div>

      {/* Search */}
      <div className="mt-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Хайх (ж: beer, fries)"
          className="w-full rounded-xl border border-neutral-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Categories */}
      <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
        <Chip label="Бүгд" active={activeCat === "all"} onClick={() => setActiveCat("all")} />
        {CATEGORIES.map((c) => (
          <Chip key={c.id} label={c.name} active={activeCat === c.id} onClick={() => setActiveCat(c.id)} />
        ))}
      </div>

      {/* Products */}
      <div className="mt-4 grid grid-cols-1 gap-3">
        {filtered.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.img} alt={p.name} className="h-16 w-16 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-neutral-500">{currency(p.price)}</div>
            </div>
            <button
              onClick={() => addToCart(p)}
              className="rounded-xl bg-black px-3 py-2 text-sm font-medium text-white active:scale-[0.98]"
            >
              Сагсанд
            </button>
          </div>
        ))}
        {!filtered.length && (
          <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-neutral-500">
            Илэрц олдсонгүй.
          </div>
        )}
      </div>

      {/* Cart List (inline) */}
      {cart.length > 0 && (
        <div className="mt-5 rounded-2xl border bg-white p-4">
          <div className="mb-2 text-sm text-neutral-500">Сагс</div>
          <ul className="divide-y">
            {cart.map((it) => (
              <li key={it.productId} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-neutral-500">{currency(it.price)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decQty(it.productId)}
                    className="h-8 w-8 rounded-full border text-lg leading-none"
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{it.qty}</span>
                  <button
                    onClick={() => addToCart(PRODUCTS.find((p) => p.id === it.productId)!)}
                    className="h-8 w-8 rounded-full border text-lg leading-none"
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sticky Cart Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-20">
        <div className="mx-auto max-w-md px-4">
          <div className="rounded-2xl border bg-white p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-600">
                Сагс: {cart.reduce((a, b) => a + b.qty, 0)} ширхэг
              </div>
              <div className="font-semibold">{currency(subtotal)}</div>
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={clearCart} className="flex-1 rounded-xl border px-3 py-2 text-sm">
                Цэвэрлэх
              </button>
              <button
                onClick={placeOrder}
                className="flex-1 rounded-xl bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                disabled={!cart.length}
              >
                Захиалах
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking */}
      {currentTracking && (
        <div className="mt-5 rounded-2xl border bg-white p-4">
          <div className="mb-2 text-sm text-neutral-500">Таны захиалга</div>
          <div className="flex items-center justify-between">
            <div className="font-semibold">#{currentTracking.id} – {currency(currentTracking.total)}</div>
            <StatusBadge status={currentTracking.status} />
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {currentTracking.items.map((it) => (
              <li key={it.productId + it.name}>
                {it.name} × {it.qty}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-neutral-500">* Энэхүү демо-д статусыг Staff Board-аас өөрчилнө.</p>
        </div>
      )}

      {/* Show previous orders for demo */}
      {orders.length > 0 && (
        <div className="mt-5 space-y-2">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border bg-white p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">#{o.id} – {currency(o.total)}</div>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// -----------------------------
// Staff Screen (PIN login + Boards)
// -----------------------------
function StaffScreen() {
  const [pin, setPin] = useState<string>("");
  const [authed, setAuthed] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>(() => demoSeedOrders());
  const [tab, setTab] = useState<Status>(Status.PENDING);

  const lists = useMemo(
    () => ({
      [Status.PENDING]: orders.filter((o) => o.status === Status.PENDING),
      [Status.IN_PROGRESS]: orders.filter((o) => o.status === Status.IN_PROGRESS),
      [Status.SERVED]: orders.filter((o) => o.status === Status.SERVED),
      [Status.PAID]: orders.filter((o) => o.status === Status.PAID),
    }),
    [orders]
  );

  const doLogin = () => {
    if (pin === "1234") setAuthed(true);
  };

  const nextStatus = (s: Status): Status => {
    if (s === Status.PENDING) return Status.IN_PROGRESS;
    if (s === Status.IN_PROGRESS) return Status.SERVED;
    if (s === Status.SERVED) return Status.PAID;
    return Status.PAID;
  };

  const advance = (id: number) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: nextStatus(o.status) } : o)));

  if (!authed) {
    return (
      <section className="py-10">
        <div className="mx-auto max-w-sm rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-2 text-sm text-neutral-500">PIN нэвтрэх</div>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="4 оронтой PIN (1234)"
            inputMode="numeric"
            maxLength={4}
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button onClick={doLogin} className="mt-3 w-full rounded-xl bg-black px-4 py-3 font-medium text-white">
            Нэвтрэх
          </button>
          <p className="mt-3 text-xs text-neutral-500">* Жижиг паб-д тохирох энгийн шийдэл. PROD дээр JWT/Role хийхийг зөвлөе.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4">
      <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar">
        <TabBtn label="Шинэ" active={tab === Status.PENDING} onClick={() => setTab(Status.PENDING)} />
        <TabBtn label="Бэлтгэж байна" active={tab === Status.IN_PROGRESS} onClick={() => setTab(Status.IN_PROGRESS)} />
        <TabBtn label="Бэлэн" active={tab === Status.SERVED} onClick={() => setTab(Status.SERVED)} />
        <TabBtn label="Төлсөн" active={tab === Status.PAID} onClick={() => setTab(Status.PAID)} />
      </div>

      <div className="space-y-3">
        {lists[tab].map((o) => (
          <div key={o.id} className="rounded-2xl border bg-white p-4">
            <div className="mb-1 flex items-center justify-between">
              <div className="font-semibold">#{o.id} • {o.tableCode}</div>
              <StatusBadge status={o.status} />
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
              {o.items.map((it) => (
                <li key={it.name + it.qty}>{it.name} × {it.qty}</li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between">
              <div className="font-medium">Нийт: {currency(o.total)}</div>
              {o.status !== Status.PAID ? (
                <button onClick={() => advance(o.id)} className="rounded-xl bg-black px-3 py-2 text-sm font-medium text-white">
                  {o.status === Status.PENDING && "Бэлтгэж эхлэх"}
                  {o.status === Status.IN_PROGRESS && "Бэлэн болсон"}
                  {o.status === Status.SERVED && "Төлсөн"}
                </button>
              ) : (
                <span className="text-sm text-green-600">✔ Төлөгдсөн</span>
              )}
            </div>
          </div>
        ))}

        {!lists[tab].length && (
          <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-neutral-500">
            Энэ ангилалд захиалга алга.
          </div>
        )}
      </div>
    </section>
  );
}

// -----------------------------
// UI Bits
// -----------------------------
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
        active ? "bg-black text-white" : "bg-neutral-200 text-neutral-800"
      }`}
    >
      {label}
    </button>
  );
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm ${
        active ? "bg-black text-white" : "bg-neutral-200"
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const s = (
    {
      [Status.PENDING]: { text: "Хүлээгдэж", cls: "bg-red-100 text-red-700" },
      [Status.IN_PROGRESS]: { text: "Бэлтгэж", cls: "bg-amber-100 text-amber-800" },
      [Status.SERVED]: { text: "Бэлэн", cls: "bg-green-100 text-green-700" },
      [Status.PAID]: { text: "Төлсөн", cls: "bg-neutral-200 text-neutral-700" },
    } as const
  )[status];
  return <span className={`rounded-full px-2 py-0.5 text-xs ${s.cls}`}>{s.text}</span>;
}

function FooterBar() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 border-t bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-md px-4 py-2 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Пабын QR меню • Демо UI (MERN-д бэлэн scaffold)
      </div>
    </footer>
  );
}

function useTableFromURL(): string | null {
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const t = url.searchParams.get("table") || url.searchParams.get("T") || url.searchParams.get("tableId");
      if (t) setCode(t);
    } catch {}
  }, []);
  return code;
}

function demoSeedOrders(): Order[] {
  return [
    {
      id: 104,
      tableCode: "T12",
      items: [
        { productId: "p1", name: "Beer 500ml", price: 6500, qty: 2 },
        { productId: "p3", name: "Fries", price: 4500, qty: 1 },
      ],
      total: 17500,
      status: Status.PENDING,
    },
    {
      id: 103,
      tableCode: "T5",
      items: [{ productId: "p2", name: "Mojito", price: 8000, qty: 1 }],
      total: 8000,
      status: Status.IN_PROGRESS,
    },
    {
      id: 101,
      tableCode: "T3",
      items: [{ productId: "p5", name: "Americano", price: 6000, qty: 1 }],
      total: 6000,
      status: Status.SERVED,
    },
  ];
}

