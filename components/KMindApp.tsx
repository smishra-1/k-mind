"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import MindMap from "./MindMap";
import DetailPanel from "./DetailPanel";
import {
  buildPathIndex,
  normalize,
  type LearnData,
  type MindMapData,
} from "@/lib/mindmap";

const EXAMPLES = [
  "Photosynthesis",
  "World War 2",
  "The Water Cycle",
  "Solar System",
];

type Detail =
  | { state: "loading"; path: string[] }
  | { state: "ready"; path: string[]; data: LearnData }
  | { state: "error"; path: string[]; error: string };

type SaveState = "idle" | "saving" | "login" | "error";

export default function KMindApp({
  initialMap,
  initialId,
}: {
  initialMap?: MindMapData;
  initialId?: string;
}) {
  const [topic, setTopic] = useState(initialMap?.topic ?? "");
  const [map, setMap] = useState<MindMapData | null>(initialMap ?? null);
  const [savedId, setSavedId] = useState<string | null>(initialId ?? null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);

  const index = useMemo(() => (map ? buildPathIndex(map) : null), [map]);

  const generate = useCallback(
    async (value: string) => {
      const t = value.trim();
      if (!t || busy) return;
      setBusy(true);
      setError(null);
      setDetail(null);
      setSavedId(null);
      setSaveState("idle");
      try {
        const res = await fetch("/api/mindmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: t }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
        setMap(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        setBusy(false);
      }
    },
    [busy],
  );

  const learn = useCallback(async (path: string[]) => {
    setDetail({ state: "loading", path });
    try {
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      setDetail((d) =>
        d && d.path === path ? { state: "ready", path, data: json } : d,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setDetail((d) =>
        d && d.path === path ? { state: "error", path, error: msg } : d,
      );
    }
  }, []);

  const save = useCallback(async () => {
    if (!map) return;
    setSaveState("saving");
    try {
      const res = await fetch("/api/maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(map),
      });
      if (res.status === 401) return setSaveState("login");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSavedId(json.id);
      setSaveState("idle");
    } catch {
      setSaveState("error");
    }
  }, [map]);

  const onSelect = useCallback(
    (label: string) => {
      const path = index?.get(normalize(label));
      if (path) learn(path);
    },
    [index, learn],
  );

  const selected = detail
    ? normalize(detail.path[detail.path.length - 1])
    : null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-violet-700">
          K-Mind <span aria-hidden>🧠</span>
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Type any topic. Get a mind map. Click a branch to learn more.
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          generate(topic);
        }}
        className="mx-auto mt-6 flex w-full max-w-2xl gap-2"
      >
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          maxLength={100}
          placeholder="e.g. photosynthesis, World War 2…"
          aria-label="Topic"
          className="min-w-0 flex-1 rounded-2xl border-2 border-violet-200 bg-white px-4 py-3 text-lg text-slate-900 shadow-sm outline-none focus:border-violet-500"
        />
        <button
          type="submit"
          disabled={busy || !topic.trim()}
          className="rounded-2xl bg-violet-600 px-5 py-3 text-lg font-bold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50"
        >
          {busy ? "Building…" : "Make my map ✨"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => {
              setTopic(ex);
              generate(ex);
            }}
            disabled={busy}
            className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 hover:bg-amber-200 disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="mx-auto mt-6 rounded-xl bg-red-50 px-4 py-2 text-red-700"
        >
          {error}
        </p>
      )}

      {busy && (
        <p className="mt-16 text-center text-xl font-semibold text-violet-600 animate-pulse">
          Building your map…
        </p>
      )}

      {map && !busy && (
        <>
          <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
            {savedId ? (
              <span className="text-sm font-medium text-green-700">
                ✓ Saved ·{" "}
                <Link href="/maps" className="underline">
                  My maps
                </Link>
              </span>
            ) : (
              <>
                {saveState === "login" && (
                  <span className="text-sm text-slate-600">
                    <Link
                      href="/login"
                      className="font-semibold text-violet-700 underline"
                    >
                      Log in
                    </Link>{" "}
                    to save this map.
                  </span>
                )}
                {saveState === "error" && (
                  <span className="text-sm text-red-600">
                    Could not save. Try again.
                  </span>
                )}
                <button
                  onClick={save}
                  disabled={saveState === "saving"}
                  className="rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50"
                >
                  {saveState === "saving" ? "Saving…" : "💾 Save map"}
                </button>
              </>
            )}
          </div>
          <div className="mt-3 grid flex-1 gap-6 lg:grid-cols-[1fr_340px]">
            <div className="rounded-3xl border-2 border-violet-200 bg-white p-2 shadow-sm">
              <MindMap data={map} selected={selected} onSelect={onSelect} />
            </div>
            <div className="lg:sticky lg:top-6 lg:self-start">
              {detail ? (
                <DetailPanel
                  title={detail.path[detail.path.length - 1]}
                  state={detail.state}
                  data={detail.state === "ready" ? detail.data : undefined}
                  error={detail.state === "error" ? detail.error : undefined}
                  onClose={() => setDetail(null)}
                  onRetry={() => learn(detail.path)}
                />
              ) : (
                <p className="rounded-3xl border-2 border-dashed border-sky-200 p-5 text-center text-slate-500">
                  👆 Tap any branch to learn more about it.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
