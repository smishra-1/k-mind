import { Suspense } from "react";
import { notFound } from "next/navigation";
import KMindApp from "@/components/KMindApp";
import { mindMapSchema } from "@/lib/mindmap";
import { createClient } from "@/lib/supabase/server";

async function SavedMap({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("mind_maps").select("data").eq("id", id).maybeSingle();
  const parsed = mindMapSchema.safeParse(data?.data);
  if (!parsed.success) notFound();
  return <KMindApp initialMap={parsed.data} initialId={id} />;
}

export default function SavedMapPage(props: PageProps<"/maps/[id]">) {
  return (
    <Suspense fallback={<p className="p-8 text-center text-slate-500">Loading…</p>}>
      <SavedMap params={props.params} />
    </Suspense>
  );
}
