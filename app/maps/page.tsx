import { Suspense } from "react";
import MapList from "@/components/MapList";
import { createClient } from "@/lib/supabase/server";

async function Maps() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mind_maps")
    .select("id, topic, created_at")
    .order("created_at", { ascending: false });
  return <MapList initial={data ?? []} />;
}

export default function MapsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold text-violet-700">My maps</h1>
      <Suspense fallback={<p className="mt-6 text-slate-500">Loading…</p>}>
        <Maps />
      </Suspense>
    </main>
  );
}
