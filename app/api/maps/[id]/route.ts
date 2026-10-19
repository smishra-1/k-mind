import { createClient } from "@/lib/supabase/server";

export async function DELETE(_req: Request, ctx: RouteContext<"/api/maps/[id]">) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });

  const { error } = await supabase.from("mind_maps").delete().eq("id", id);
  if (error) return Response.json({ error: "Could not delete." }, { status: 500 });
  return Response.json({ ok: true });
}
