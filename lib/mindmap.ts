import { z } from "zod";

export const mindMapSchema = z.object({
  topic: z.string().describe("Short, clean title of the topic"),
  branches: z
    .array(
      z.object({
        label: z.string().describe("Main idea, 1-4 words"),
        children: z
          .array(z.string().describe("Supporting detail, 1-5 words"))
          .describe("2-4 small details for this branch"),
      }),
    )
    .describe("4-7 main branches"),
});

export type MindMapData = z.infer<typeof mindMapSchema>;

export const learnSchema = z.object({
  summary: z.string().describe("2-3 simple sentences explaining the idea"),
  keyPoints: z.array(z.string()).describe("3 short key points"),
  funFact: z.string().describe("One interesting fun fact, one sentence"),
});

export type LearnData = z.infer<typeof learnSchema>;

/** Mermaid mindmap text can't safely contain brackets, quotes or newlines. */
export function cleanLabel(text: string): string {
  return text.replace(/["'`()[\]{}<>#;:\\]/g, "").replace(/\s+/g, " ").trim();
}

export function normalize(text: string): string {
  return cleanLabel(text).toLowerCase();
}

export function toMermaid(data: MindMapData): string {
  const lines = ["mindmap", `  root((${cleanLabel(data.topic) || "Topic"}))`];
  for (const branch of data.branches) {
    lines.push(`    ${cleanLabel(branch.label)}`);
    for (const child of branch.children) {
      lines.push(`      ${cleanLabel(child)}`);
    }
  }
  return lines.join("\n");
}

/** Maps a clicked node's text to the path of ideas leading to it. */
export function buildPathIndex(data: MindMapData): Map<string, string[]> {
  const index = new Map<string, string[]>();
  const root = cleanLabel(data.topic);
  index.set(normalize(root), [root]);
  for (const branch of data.branches) {
    const b = cleanLabel(branch.label);
    if (!index.has(normalize(b))) index.set(normalize(b), [root, b]);
    for (const child of branch.children) {
      const c = cleanLabel(child);
      if (!index.has(normalize(c))) index.set(normalize(c), [root, b, c]);
    }
  }
  return index;
}
