"use client";

import type { LearnData } from "@/lib/mindmap";

type Props = {
  title: string;
  state: "loading" | "ready" | "error";
  data?: LearnData;
  error?: string;
  onClose: () => void;
  onRetry: () => void;
};

export default function DetailPanel({ title, state, data, error, onClose, onRetry }: Props) {
  return (
    <aside className="rounded-3xl border-2 border-sky-300 bg-white p-5 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <h2 className="rounded-xl bg-sky-100 px-3 py-1.5 text-lg font-bold text-sky-900">
          {title}
        </h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-full px-2 text-2xl leading-none text-slate-400 hover:text-slate-700"
        >
          ×
        </button>
      </div>

      {state === "loading" && (
        <div className="mt-4 space-y-3" aria-busy="true">
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
      )}

      {state === "error" && (
        <div className="mt-4">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={onRetry} className="mt-2 text-sm font-semibold text-sky-700 underline">
            Try again
          </button>
        </div>
      )}

      {state === "ready" && data && (
        <div className="mt-4 space-y-4">
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">In short</p>
            <p className="mt-1 text-slate-800">{data.summary}</p>
          </section>
          <section className="rounded-2xl bg-yellow-100 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700">Key points</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-800">
              {data.keyPoints.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl bg-green-100 p-3 text-slate-800">
            <span className="font-semibold text-green-800">Fun fact: </span>
            {data.funFact}
          </section>
        </div>
      )}
    </aside>
  );
}
