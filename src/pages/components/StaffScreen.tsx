import React, { useState, useMemo, useEffect } from "react";
import { Order, Status } from "./types";
import { TabBtn, StatusBadge } from "./UI";

interface StaffScreenProps {
  seedOrders?: Order[];
}

export function StaffScreen({ seedOrders }: StaffScreenProps) {
  const [pin, setPin] = useState<string>("");
  const [authed, setAuthed] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>(seedOrders || []);
  const [tab, setTab] = useState<Status>("pending");

  const doLogin = () => {
    if (pin === "1234") setAuthed(true);
  };
  useEffect(() => {
    if (!authed) return;

    fetch("/api/orders")
      .then((res) => res.json())
      .then((data: Order[]) => setOrders(data))
      .catch(console.error);
  }, [authed]);
  const lists = useMemo(
    () => ({
      pending: orders.filter((o) => o.status === "pending"),
      in_progress: orders.filter((o) => o.status === "in_progress"),
      served: orders.filter((o) => o.status === "served"),
      paid: orders.filter((o) => o.status === "paid"),
    }),
    [orders]
  );
  const nextStatus = (s: Status) =>
    s === "pending"
      ? "in_progress"
      : s === "in_progress"
      ? "served"
      : s === "served"
      ? "paid"
      : "paid";
  const advance = async (order: Order) => {
    const newStatus = nextStatus(order.status);

    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      const updatedOrder: Order = await res.json();

      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (!authed) {
    return (
      <section className="py-10 flex flex-col items-center justify-center">
        <h2 className="mb-4 text-xl font-semibold">Staff Login</h2>
        <input
          type="password"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="mb-3 rounded border px-3 py-2"
        />
        <button
          onClick={doLogin}
          className="rounded bg-black px-4 py-2 text-white font-medium"
        >
          Нэвтрэх
        </button>
      </section>
    );
  }

  return (
    <section className="py-4">
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {(["pending", "in_progress", "served", "paid"] as Status[]).map((s) => (
          <TabBtn
            key={s}
            label={s}
            active={tab === s}
            onClick={() => setTab(s)}
          />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {lists[tab].length === 0 && (
          <div className="text-center text-sm text-neutral-500">
            Захиалга алга.
          </div>
        )}

        {lists[tab].map((o) => (
          <div
            key={o._id}
            className="rounded-2xl border bg-white p-4 shadow-sm flex flex-col gap-2"
          >
            <div className="flex justify-between items-center">
              <div className="font-semibold">
                #{o._id?.slice(-6)} – {o.tableCode}
              </div>
              <StatusBadge status={o.status} />
            </div>
            <ul className="list-disc pl-5 text-sm">
              {o.items.map((it) => (
                <li key={it.productId + it.name}>
                  {it.name} × {it.qty}
                </li>
              ))}
            </ul>
            {o.status !== "paid" && (
              <button
                onClick={() => advance(o)}
                className="mt-2 rounded bg-black px-3 py-1.5 text-white text-sm font-medium"
              >
                Next Status
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}




