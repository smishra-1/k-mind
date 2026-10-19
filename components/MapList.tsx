"use client";

import Link from "next/link";
import { useState } from "react";

type Item = { id: string; topic: string; created_at: string };

export default function MapList({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  async function remove(id: string) {
    setError(null);
    const res = await fetch(`/api/maps/${id}`, { method: "DELETE" });
    if (res.ok) setItems((l) => l.filter((i) => i.id !== id));
    else setError("Could not delete that map.");
  }

  if (items.length === 0) {
    return (
      <p className="mt-6 rounded-3xl border-2 border-dashed border-violet-200 p-8 text-center text-slate-500">
        No saved maps yet. <Link href="/" className="font-semibold text-violet-700 underline">Make your first one!</Link>
      </p>
    );
  }
  return (
    <>
      {error && <p role="alert" className="mt-4 text-red-600">{error}</p>}
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-violet-200 bg-white p-4">
            <Link href={`/maps/${m.id}`} className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold text-violet-800">{m.topic}</p>
              <p className="text-xs text-slate-400">{new Date(m.created_at).toLocaleDateString()}</p>
            </Link>
            <button
              onClick={() => remove(m.id)}
              aria-label={`Delete ${m.topic}`}
              className="rounded-full px-2 py-1 text-sm text-slate-400 hover:bg-red-50 hover:text-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
