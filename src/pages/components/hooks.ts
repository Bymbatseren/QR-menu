import { useEffect, useState } from "react";

export function useTableFromURL() {
  const [table, setTable] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("table");
    if (t) setTable(t);
  }, []);

  return table;
}

