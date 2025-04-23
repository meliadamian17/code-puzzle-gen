// components/CodeBlockItem.tsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CodeBlock } from "@/lib/types";
import { useState } from "react";

interface Props {
  block: CodeBlock;
}

export function CodeBlockItem({ block }: Props) {
  const [showExplanation, setShowExplanation] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${block.indentation * 1.5}rem`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group cursor-move bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-600 my-2 hover:bg-gray-600"
    >
      <div className="flex items-start justify-between">
        <pre className="font-mono text-sm text-gray-100">{block.code}</pre>
        <button
          className="ml-2 w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center hover:bg-gray-400"
          onMouseEnter={() => setShowExplanation(true)}
          onMouseLeave={() => setShowExplanation(false)}
        >
          ?
        </button>
      </div>
      {showExplanation && (
        <div className="absolute z-10 top-full left-0 mt-2 p-2 bg-gray-800 text-gray-100 text-sm rounded-lg shadow-lg max-w-xs border border-gray-600">
          {block.explanation}
        </div>
      )}
    </div>
  );
}
