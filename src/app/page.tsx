"use client";

import { useState, useRef } from "react";
import { CodeBlock, PuzzleData } from "@/lib/types";
import { APIKeyModal } from "@/components/APIKeyModal";
import { useAPIKey } from "@/hooks/useAPIKey";
import { PuzzleArea } from "@/components/PuzzleArea";

export default function Home() {
  const { apiKey, setApiKey, clearApiKey, isKeySet } = useAPIKey();
  const [prompt, setPrompt] = useState("");
  const [blocks, setBlocks] = useState<CodeBlock[]>([]);
  const [solution, setSolution] = useState<CodeBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestCache = useRef(new Map<string, PuzzleData>());
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

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

  return (
    <main className="min-h-screen p-8 bg-[#1E1E1E] text-[#D4D4D4]">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your programming task..."
            className="w-full p-4 border rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-[#264F78] bg-[#2A2D2E] text-[#D4D4D4] placeholder-[#6A6A6A] border-[#3A3D41]"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 bg-[#0E639C] text-white font-bold rounded-lg hover:bg-[#1177BB] disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Generating..." : "Generate Puzzle"}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-[#2A2D2E] text-[#D4D4D4] border border-[#3A3D41] rounded-lg">{error}</div>
        )}

        {blocks.length > 0 && (
          <PuzzleArea initialBlocks={blocks} solution={solution} />
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
