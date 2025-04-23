// app/page.tsx
"use client";

import { useState, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CodeBlock, PuzzleData } from "@/lib/types";
import { CodeBlockItem } from "@/components/CodeBlockItem";
import { APIKeyModal } from "@/components/APIKeyModal";
import { useAPIKey } from "@/hooks/useAPIKey";

export default function Home() {
  const { apiKey, setApiKey, clearApiKey, isKeySet } = useAPIKey();
  const [prompt, setPrompt] = useState("");
  const [blocks, setBlocks] = useState<CodeBlock[]>([]);
  const [solution, setSolution] = useState<CodeBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestCache = useRef(new Map<string, PuzzleData>());
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleGenerate = async () => {
    if (!prompt) return;

    if (!isKeySet) {
      setShowApiKeyModal(true);
      return;
    }
    setLoading(true);
    setError("");

    try {
      const key = prompt;
      if (requestCache.current.has(key)) {
        const cachedData = requestCache.current.get(key)!;
        setBlocks(cachedData.blocks);
        setSolution(cachedData.solution);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/gen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, apiKey }),
      });

      if (!response.ok) throw new Error("Failed to generate puzzle");

      const data = await response.json();
      requestCache.current.set(key, data);
      setBlocks(data.blocks);
      setSolution(data.solution);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your programming task..."
            className="w-full p-4 border rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white placeholder-gray-400 border-gray-700"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Puzzle"}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-900 text-red-100 rounded-lg">{error}</div>
        )}

        {blocks.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Solution Area</h2>
                <div className="min-h-[400px] p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <SortableContext
                    items={blocks}
                    strategy={verticalListSortingStrategy}
                  >
                    {blocks.map((block) => (
                      <CodeBlockItem key={block.id} block={block} />
                    ))}
                  </SortableContext>
                </div>
              </div>
            </div>
          </DndContext>
        )}
        <APIKeyModal
          isOpen={showApiKeyModal}
          onClose={() => setShowApiKeyModal(false)}
          onSubmit={(key) => {
            setApiKey(key);
            handleGenerate();
          }}
        />
      </div>
    </main>
  );
}
