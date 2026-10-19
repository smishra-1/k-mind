import { createClient } from "@/lib/supabase/server";
import { mindMapSchema } from "@/lib/mindmap";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Please log in to save." }, { status: 401 });

  const parsed = mindMapSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid mind map." }, { status: 400 });

  const { data, error } = await supabase
    .from("mind_maps")
    .insert({ user_id: user.id, topic: parsed.data.topic.slice(0, 200), data: parsed.data })
    .select("id")
    .single();
  if (error) {
    console.error(error);
    return Response.json({ error: "Could not save the map." }, { status: 500 });
  }
  return Response.json({ id: data.id });
}
