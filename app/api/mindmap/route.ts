import { generateText, Output } from "ai";
import { mindMapSchema } from "@/lib/mindmap";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { topic } = (await req.json().catch(() => ({}))) as { topic?: string };
  const clean = topic?.trim().slice(0, 100);
  if (!clean) {
    return Response.json({ error: "Please type a topic." }, { status: 400 });
  }

  try {
    const { output } = await generateText({
      model: "anthropic/claude-sonnet-5.5",
      output: Output.object({ schema: mindMapSchema }),
      system:
        "You create mind maps for students of all ages. Use simple words. Organise ideas from the main points to small details. Every label must be short (1-5 words), unique, and contain no punctuation. Be accurate.",
      prompt: `Create a mind map for the topic: ${clean}`,
    });
    return Response.json(output);
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Could not make the mind map. Please try again." },
      { status: 500 },
    );
  }
}
