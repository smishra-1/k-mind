import { generateText, Output } from "ai";
import { learnSchema } from "@/lib/mindmap";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { path } = (await req.json().catch(() => ({}))) as { path?: string[] };
  if (!Array.isArray(path) || path.length === 0) {
    return Response.json({ error: "Missing node." }, { status: 400 });
  }
  const trail = path.slice(0, 5).map((p) => String(p).slice(0, 100));

  try {
    const { output } = await generateText({
      model: "anthropic/claude-sonnet-5.5",
      output: Output.object({ schema: learnSchema }),
      system:
        "You are a friendly teacher explaining one idea from a mind map to a student. Use simple, clear words that kids and grown-ups can both follow. Be accurate.",
      prompt: `Mind map path (main topic first): ${trail.join(" > ")}\nExplain the last idea, "${trail[trail.length - 1]}", in the context of "${trail[0]}".`,
    });
    return Response.json(output);
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Could not load details. Please try again." },
      { status: 500 },
    );
  }
}
