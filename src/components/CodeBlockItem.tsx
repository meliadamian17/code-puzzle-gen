import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMonaco } from '@monaco-editor/react';
import { useState, useEffect, useRef } from "react";
import { CodeBlock } from "@/lib/types";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

interface CodeBlockItemProps {
  block: CodeBlock;
  showHint?: boolean;
  hintDirection?: 'up' | 'down' | 'left' | 'right';
  indentation?: number;
  isIncorrect?: boolean;
}

export function CodeBlockItem({ block, showHint, hintDirection, indentation = 0, isIncorrect = false }: CodeBlockItemProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const monaco = useMonaco();
  const [editorInstance, setEditorInstance] = useState<any>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (monaco && editorRef.current) {
      const editor = monaco.editor.create(editorRef.current, {
        value: block.code.trimStart(),
        language: 'python',
        theme: 'vs-dark',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 13,
        lineHeight: 18,
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
        automaticLayout: false,
        padding: {
          top: 4,
          bottom: 4
        },
        wordWrap: 'off',
        fixedOverflowWidgets: true
      });

      const model = editor.getModel();
      const lines = model?.getLinesContent() || [];
      const longestLine = Math.max(...lines.map((line: string) => line.length));
      const baseWidth = Math.max(longestLine * 8 + 20, 100); // content width and some padding
      const totalWidth = baseWidth + (indentation * 16); // 16px move per indent level (seemed close enough to 2-space indentation)
      editorRef.current.style.width = `${totalWidth}px`;

      if (indentation > 0) {
        const indent = ' '.repeat(indentation * 2);
        editor.setValue(indent + block.code.trimStart());
      }

      editor.layout();

      setEditorInstance(editor);

      return () => {
        editor.dispose();
      };
    }
  }, [monaco, block.code, indentation]);

  const getHintArrow = () => {
    if (!showHint || !hintDirection) return null;

    const IconComponent = {
      up: ArrowUp,
      down: ArrowDown,
      left: ArrowLeft,
      right: ArrowRight
    }[hintDirection];

    const positionStyle = {
      up: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
      down: 'top-full mt-2 left-1/2 -translate-x-1/2',
      left: 'right-full mr-2 top-1/2 -translate-y-1/2',
      right: 'left-full ml-2 top-1/2 -translate-y-1/2'
    }[hintDirection];

    return (
      <div className={`absolute z-10 ${positionStyle}`}>
        <IconComponent className="w-5 h-5 text-red-500" />
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative group cursor-move rounded-lg shadow-sm my-1 w-full ${showHint
        ? 'bg-red-900/20 border-2 border-red-500'
        : isIncorrect
          ? 'bg-gray-700 border-2 border-red-500'
          : 'bg-gray-700 border border-gray-600'
        } p-1.5 touch-none`}
    >
      <div className="flex items-start justify-between w-full">
        <div
          ref={editorRef}
          className="h-[26px] w-full"
        />
        <button
          className="ml-2 w-5 h-5 rounded-full bg-gray-500 text-white flex items-center justify-center hover:bg-gray-400 absolute -right-2.5 -top-2.5 z-10 text-sm flex-shrink-0"
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
      {getHintArrow()}
    </div>
  );
}

