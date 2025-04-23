import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMonaco } from '@monaco-editor/react';
import { useState, useEffect, useRef } from "react";
import { CodeBlock } from "@/lib/types";

interface CodeBlockItemProps {
  block: CodeBlock;
  showHint?: boolean;
}

export function CodeBlockItem({ block, showHint }: CodeBlockItemProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const monaco = useMonaco();

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

  useEffect(() => {
    if (monaco && editorRef.current) {
      const editor = monaco.editor.create(editorRef.current, {
        value: block.code,
        language: 'python',
        theme: 'vs-dark',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: "off",
        folding: false,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 0,
        renderLineHighlight: "none",
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        contextmenu: false,
        readOnly: true,
        scrollbar: {
          vertical: 'hidden',
          horizontal: 'hidden'
        },
        renderValidationDecorations: 'off',
        overviewRulerLanes: 0,
        glyphMargin: false,
        automaticLayout: true
      });

      return () => {
        editor.dispose();
      };
    }
  }, [monaco, block.code]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative group cursor-move rounded-lg shadow-sm my-2 ${showHint
        ? 'bg-red-900/20 border-2 border-red-500'
        : 'bg-gray-700 border border-gray-600'
        } p-2`}
    >
      <div className="flex items-start justify-between">
        <div
          ref={editorRef}
          className="w-full h-[20px]"
        />
        <button
          className="ml-2 w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center hover:bg-gray-400 absolute top-2 right-2 z-10"
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

