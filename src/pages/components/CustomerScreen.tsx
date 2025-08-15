import React, { useState, useMemo, useEffect } from "react";
import { CartItem, Order, Product, Status } from "./types";
import { useTableFromURL } from "./hooks";
import { Chip, StatusBadge } from "./UI";

interface CustomerScreenProps {
  products: Product[];
  categories: { id: string; name: string }[];
}

export function CustomerScreen({ products, categories }: CustomerScreenProps) {
  const tableFromUrl = useTableFromURL();
  console.log(tableFromUrl)
  const [query, setQuery] = useState<string>("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [trackingId, setTrackingId] = useState<number | null>(null);
  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (activeCat === "all" || p.categoryId === activeCat) &&
          p.name.toLowerCase().includes(query.toLowerCase())
      ),
    [activeCat, query, products]
  );

  const subtotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.qty, 0), [cart]);
  const addToCart = (p: Product) =>
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.productId === p.id);
      if (idx >= 0) {
        const clone = [...prev];
        clone[idx] = { ...clone[idx], qty: clone[idx].qty + 1 };
        return clone;
      }
      return [...prev, { productId: p.id, name: p.name, price: p.price, qty: 1 }];
    });

  const decQty = (pid: string) =>
    setCart((prev) =>
      prev.map((x) => (x.productId === pid ? { ...x, qty: x.qty - 1 } : x)).filter((x) => x.qty > 0)
    );
  const clearCart = () => setCart([]);

  // --- Fetch existing orders for this table ---
  useEffect(() => {
    if (!tableFromUrl) return;
    fetch(`/api/orders?table=${tableFromUrl}`)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch(console.error);
  }, [tableFromUrl]);

  // --- Place order ---
  const placeOrder = async () => {
    if (!cart.length || !tableFromUrl) return;

    const body = { tableCode: tableFromUrl, items: cart };
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const order: Order = await res.json();
      setOrders((o) => [order, ...o]);
      setTrackingId(order._id);
      clearCart();
    } catch (err) {
      console.error(err);
    }
  };

  const currentTracking = orders.find((o) => o._id === trackingId) || null;

  return (
    <section className="py-4">
      {/* Table Info & Cart Summary */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-neutral-500">Ширээ</div>
          <div className="font-semibold text-lg">#{tableFromUrl || "—"}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-neutral-500">Сагс</div>
          <div className="font-semibold">{cart.length} бараа</div>
        </div>
      </div>

      {/* Search */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Хайх (ж: beer, fries)"
        className="w-full rounded-xl border border-neutral-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black mb-3"
      />

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto mb-4">
        <Chip label="Бүгд" active={activeCat === "all"} onClick={() => setActiveCat("all")} />
        {categories.map((c) => (
          <Chip key={c.id} label={c.name} active={activeCat === c.id} onClick={() => setActiveCat(c.id)} />
        ))}
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-2xl border bg-white p-3">
            <img src={p.img} alt={p.name} className="h-16 w-16 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-neutral-500">₮{p.price.toLocaleString()}</div>
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

      {/* Cart Inline */}
      {cart.length > 0 && (
        <div className="mt-5 rounded-2xl border bg-white p-4">
          <div className="mb-2 text-sm text-neutral-500">Сагс</div>
          <ul className="divide-y">
            {cart.map((it) => (
              <li key={it.productId} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-neutral-500">₮{it.price.toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decQty(it.productId)}
                    className="h-8 w-8 rounded-full border text-lg leading-none"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{it.qty}</span>
                  <button
                    onClick={() => addToCart(products.find((p) => p.id === it.productId)!)}
                    className="h-8 w-8 rounded-full border text-lg leading-none"
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
      {cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-20">
          <div className="mx-auto max-w-md px-4">
            <div className="rounded-2xl border bg-white p-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-600">
                  Сагс: {cart.reduce((a, b) => a + b.qty, 0)} ширхэг
                </div>
                <div className="font-semibold">₮{subtotal.toLocaleString()}</div>
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
      )}

      {/* Tracking */}
      {currentTracking && (
        <div className="mt-5 rounded-2xl border bg-white p-4">
          <div className="mb-2 text-sm text-neutral-500">Таны захиалга</div>
          <div className="flex items-center justify-between">
            <div className="font-semibold">
              #{currentTracking._id} – ₮{currentTracking.total.toLocaleString()}
            </div>
            <StatusBadge status={currentTracking.status} />
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {currentTracking.items.map((it) => (
              <li key={it.productId + it.name}>
                {it.name} × {it.qty}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-neutral-500">* Статусыг Staff Board-аас өөрчилнө.</p>
        </div>
      )}
    </section>
  );
}


