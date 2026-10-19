"use client";

import { useEffect, useId, useRef } from "react";
import { normalize, toMermaid, type MindMapData } from "@/lib/mindmap";

const COLORS = [
  "#fb923c", "#a78bfa", "#34d399", "#60a5fa", "#f472b6", "#facc15",
  "#2dd4bf", "#f87171", "#818cf8", "#a3e635", "#38bdf8", "#e879f9",
];

type Props = {
  data: MindMapData;
  selected: string | null;
  onSelect: (label: string) => void;
};

export default function MindMap({ data, selected, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const id = "mm" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mermaid = (await import("mermaid")).default;
      const themeVariables: Record<string, string> = { fontSize: "16px" };
      COLORS.forEach((c, i) => {
        themeVariables[`cScale${i}`] = c;
        themeVariables[`cScaleLabel${i}`] = "#1e1b4b";
      });
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        themeVariables,
        mindmap: { useMaxWidth: true, padding: 14 },
      });
      const { svg } = await mermaid.render(id, toMermaid(data));
      if (!cancelled && ref.current) ref.current.innerHTML = svg;
    })().catch((e) => console.error(e));
    return () => {
      cancelled = true;
    };
  }, [data, id]);

  // Highlight the selected node.
  useEffect(() => {
    const nodes = ref.current?.querySelectorAll<SVGGElement>(".mindmap-node");
    nodes?.forEach((n) => {
      const on = !!selected && normalize(n.textContent ?? "") === selected;
      n.classList.toggle("kmind-selected", on);
    });
  }, [selected, data]);

  return (
    <div
      ref={ref}
      className="kmind-map w-full overflow-auto"
      onClick={(e) => {
        const node = (e.target as Element).closest(".mindmap-node");
        if (node?.textContent) onSelectRef.current(node.textContent);
      }}
    />
  );
}
