import { Status } from "./types";

export function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${active ? "bg-black text-white" : "bg-neutral-200 text-neutral-800"}`}
    >
      {label}
    </button>
  );
}

export function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-sm ${active ? "bg-black text-white" : "bg-neutral-200"}`}>
      {label}
    </button>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const s = {
    [Status.PENDING]: { text: "Хүлээгдэж", cls: "bg-red-100 text-red-700" },
    [Status.IN_PROGRESS]: { text: "Бэлтгэж", cls: "bg-amber-100 text-amber-800" },
    [Status.SERVED]: { text: "Бэлэн", cls: "bg-green-100 text-green-700" },
    [Status.PAID]: { text: "Төлсөн", cls: "bg-neutral-200 text-neutral-700" },
  }[status];
  return <span className={`rounded-full px-2 py-0.5 text-xs ${s.cls}`}>{s.text}</span>;
}

export function FooterBar() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 border-t bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-md px-4 py-2 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Пабын QR меню • Демо UI (MERN-д бэлэн scaffold)
      </div>
    </footer>
  );
}
