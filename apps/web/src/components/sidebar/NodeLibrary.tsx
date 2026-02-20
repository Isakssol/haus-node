"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { ALL_NODES, CATEGORY_META } from "@haus-node/node-registry";
import { useCanvasStore } from "@/stores/canvas.store";
import { useReactFlow } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { NodeDefinition } from "@haus-node/types";

interface NodeCardProps {
  def: NodeDefinition;
  onAdd: () => void;
}

function NodeCard({ def, onAdd }: NodeCardProps) {
  return (
    <button
      onClick={onAdd}
      className="group w-full rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:bg-accent active:scale-95"
    >
      <div className="flex items-start gap-2">
        <div
          className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full"
          style={{ backgroundColor: def.color }}
        />
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-foreground">
            {def.label}
          </div>
          <div className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">
            {def.description}
          </div>
        </div>
        <div className="ml-auto flex-shrink-0 rounded bg-muted px-1 py-0.5 text-[9px] font-mono text-muted-foreground">
          {def.creditCost > 0 ? `${def.creditCost}cr` : "free"}
        </div>
      </div>
    </button>
  );
}

export function NodeLibrary() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const addNode = useCanvasStore((s) => s.addNode);

  // screenToFlowPosition converts viewport-center pixel coords → canvas coords
  const { screenToFlowPosition } = useReactFlow();

  const filtered = useMemo(() => {
    return ALL_NODES.filter((node) => {
      const matchesSearch =
        !search ||
        node.label.toLowerCase().includes(search.toLowerCase()) ||
        node.description.toLowerCase().includes(search.toLowerCase()) ||
        node.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory =
        !selectedCategory || node.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const grouped = useMemo(() => {
    const groups = new Map<string, NodeDefinition[]>();
    for (const node of filtered) {
      const arr = groups.get(node.category) ?? [];
      arr.push(node);
      groups.set(node.category, arr);
    }
    return groups;
  }, [filtered]);

  const handleAddNode = (def: NodeDefinition) => {
    // Convert the visible canvas center to flow coordinates so the node
    // always appears where the user is looking, regardless of pan/zoom.
    // The sidebar is ~256px wide; the right inspector ~288px wide.
    const canvasEl = document.querySelector(".react-flow") as HTMLElement | null;
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    if (canvasEl) {
      const r = canvasEl.getBoundingClientRect();
      cx = r.left + r.width  / 2;
      cy = r.top  + r.height / 2;
    }
    // Add a small random jitter so stacked nodes don't fully overlap
    const jitter = () => (Math.random() - 0.5) * 80;
    const pos = screenToFlowPosition({ x: cx + jitter(), y: cy + jitter() });
    addNode(def, pos);
  };

  const categories = Object.entries(CATEGORY_META).sort(
    ([, a], [, b]) => a.order - b.order
  );

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-background py-2 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1 overflow-x-auto p-2 border-b border-border scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "flex-shrink-0 rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
            !selectedCategory
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          All
        </button>
        {categories.map(([key, meta]) => {
          const count = ALL_NODES.filter((n) => n.category === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() =>
                setSelectedCategory(selectedCategory === key ? null : key)
              }
              className={cn(
                "flex-shrink-0 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                selectedCategory === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {grouped.size === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No nodes found
          </div>
        ) : (
          Array.from(grouped.entries()).map(([category, nodes]) => {
            const meta = CATEGORY_META[category as keyof typeof CATEGORY_META];
            return (
              <div key={category}>
                <div className="mb-1.5 flex items-center gap-1.5 px-1">
                  <span className="text-xs">{meta.icon}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {meta.label}
                  </span>
                  <span className="ml-auto text-[9px] text-muted-foreground">
                    {nodes.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {nodes.map((def) => (
                    <NodeCard
                      key={def.id}
                      def={def}
                      onAdd={() => handleAddNode(def)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
