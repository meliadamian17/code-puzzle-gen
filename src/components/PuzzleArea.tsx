import { useState, useEffect, useMemo } from 'react';
import { useHistoryState } from '@uidotdev/usehooks';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragMoveEvent,
  pointerWithin
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CodeBlock } from '@/lib/types';
import { CodeBlockItem } from './CodeBlockItem';
import { Droppable } from './Droppable';

interface PuzzleAreaProps {
  initialBlocks: CodeBlock[];
  solution: CodeBlock[];
}

interface PuzzleState {
  blocks: CodeBlock[];
  solutionBlocks: CodeBlock[];
}

type HintDirection = 'up' | 'down' | 'left' | 'right';

interface HintState {
  id: string;
  direction: HintDirection;
}

export function PuzzleArea({ initialBlocks, solution }: PuzzleAreaProps) {
  const {
    state: { blocks, solutionBlocks = [] },
    set: setState,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistoryState<PuzzleState>({ blocks: initialBlocks, solutionBlocks: [] });

  const [showHint, setShowHint] = useState<HintState | null>(null);
  const [hintDisabled, setHintDisabled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentIndentation, setCurrentIndentation] = useState<number>(0);
  const [incorrectBlocks, setIncorrectBlocks] = useState<string[]>([]);

  // preprocess solution to handle identical blocks (i dont love this, but it was the easiest way for now)
  const processedSolution = useMemo(() => {
    const codeGroups = new Map<string, { position: number, block: CodeBlock }[]>();

    // group blocks by their code and store their positions
    solution.forEach((block, index) => {
      const existingGroup = codeGroups.get(block.code) || [];
      codeGroups.set(block.code, [...existingGroup, { position: index, block }]);
    });

    return codeGroups;
  }, [solution]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id.toString());
    setShowHint(null);
    setIncorrectBlocks([]);

    const block = [...blocks, ...solutionBlocks].find(b => b.id === active.id);
    if (block) {
      setCurrentIndentation(block.indentation);
    }
  };

  const handleDragMove = (event: DragMoveEvent) => {
    if (!activeId) return;

    const { delta } = event;
    const indentationChange = Math.round(delta.x / 16); // 16px = 2 spaces * 8px per space

    const block = [...blocks, ...solutionBlocks].find(b => b.id === activeId);
    if (block) {
      const newIndentation = Math.max(0, block.indentation + indentationChange);
      if (newIndentation !== currentIndentation) {
        setCurrentIndentation(newIndentation);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeBlock = [...blocks, ...solutionBlocks].find(block => block.id === active.id);
    if (!activeBlock) {
      setActiveId(null);
      return;
    }

    // update the block's indentation
    const updatedBlock = { ...activeBlock, indentation: currentIndentation };

    if (over.id === 'solution-area' && !solutionBlocks.some(block => block.id === active.id)) {
      // move from initial to solution
      setState({
        blocks: blocks.filter(block => block.id !== active.id),
        solutionBlocks: [...solutionBlocks, { ...updatedBlock, indentation: 0 }] // reset indentation when moving to solution (this looks weird since the indendation resets after the block moves)
      });
    } else if (over.id === 'initial-area' && !blocks.some(block => block.id === active.id)) {
      // move from solution to initial
      setState({
        blocks: [...blocks, { ...updatedBlock, indentation: 0 }], // reset indentation when moving to solution (this looks weird since the indendation resets after the block moves)
        solutionBlocks: solutionBlocks.filter(block => block.id !== active.id)
      });
    } else if (active.id !== over.id) {
      // reorder within the same area
      if (blocks.some(block => block.id === active.id)) {
        setState({
          blocks: arrayMove(
            blocks.map(b => b.id === active.id ? updatedBlock : b),
            blocks.findIndex(block => block.id === active.id),
            blocks.findIndex(block => block.id === over.id)
          ),
          solutionBlocks
        });
      } else {
        setState({
          blocks,
          solutionBlocks: arrayMove(
            solutionBlocks.map(b => b.id === active.id ? updatedBlock : b),
            solutionBlocks.findIndex(block => block.id === active.id),
            solutionBlocks.findIndex(block => block.id === over.id)
          )
        });
      }
    } else {
      // just handling indentation updates
      if (blocks.some(block => block.id === active.id)) {
        setState({
          blocks: blocks.map(b => b.id === active.id ? updatedBlock : b),
          solutionBlocks
        });
      } else {
        setState({
          blocks,
          solutionBlocks: solutionBlocks.map(b => b.id === active.id ? updatedBlock : b)
        });
      }
    }

    setActiveId(null);
    setCurrentIndentation(0);
  };

  const checkSolution = () => {
    setShowHint(null);
    setIncorrectBlocks([]);

    // solution validation 

    // first check if all blocks are in the solution area
    if (solutionBlocks.length !== solution.length) {
      setIncorrectBlocks(solutionBlocks.map(block => block.id));
      return;
    }

    // check each block against possible positions for identical blocks
    const wrongBlocks = solutionBlocks.filter(block => {
      const possibleSolutions = processedSolution.get(block.code) || [];
      // block is correct if it matches any of the possible positions for its code
      return !possibleSolutions.some(({ position, block: solutionBlock }) => {
        const currentPos = solutionBlocks.findIndex(b => b.id === block.id);
        const possiblePositions = solution.reduce((acc, s, i) => {
          if (s.code === block.code) acc.push(i);
          return acc;
        }, [] as number[]);

        return possiblePositions.includes(currentPos) && block.indentation === solutionBlock.indentation;
      });
    });

    if (wrongBlocks.length === 0) {
      alert('Congratulations! Your solution is correct!');
    } else {
      setIncorrectBlocks(wrongBlocks.map(block => block.id));
    }
  };

  const getHintDirection = (block: CodeBlock): HintDirection => {
    const possibleSolutions = processedSolution.get(block.code) || [];
    const currentPos = solutionBlocks.findIndex(b => b.id === block.id);

    // find the matching solution block
    const matchingSolution = possibleSolutions.find(({ position, block: solution }) => {
      // first try to find a solution block that matches the current position
      return position === currentPos;
    }) || possibleSolutions[0]; // if no match at current position, use the first possible position

    const { position: correctPos, block: correctBlock } = matchingSolution;

    // check if we need to fix position or indentation
    const isWrongPosition = currentPos !== correctPos;
    const isWrongIndentation = block.indentation !== correctBlock.indentation;

    if (isWrongPosition) {
      return currentPos > correctPos ? 'up' : 'down';
    } else if (isWrongIndentation) {
      return block.indentation > correctBlock.indentation ? 'left' : 'right';
    }

    return 'up';
  };

  // lots of duplicate logic from solution validation but abstracting seems pointless atm
  const handleHint = () => {
    if (hintDisabled) return;

    setShowHint(null);
    setIncorrectBlocks([]);

    // find incorrect blocks
    const wrongBlocks = solutionBlocks.filter(block => {
      const possibleSolutions = processedSolution.get(block.code) || [];
      return !possibleSolutions.some(({ position, block: solution }) => {
        const currentPos = solutionBlocks.findIndex(b => b.id === block.id);
        // a block is correct if it's in a valid position AND has correct indentation
        return position === currentPos && block.indentation === solution.indentation;
      });
    });

    if (wrongBlocks.length > 0) {
      const randomBlock = wrongBlocks[Math.floor(Math.random() * wrongBlocks.length)];
      const direction = getHintDirection(randomBlock);

      setShowHint({
        id: randomBlock.id,
        direction
      });
      setHintDisabled(true);
      setTimeout(() => {
        setHintDisabled(false);
        setShowHint(null);
      }, 10000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        if (canUndo) undo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  const activeBlock = activeId ?
    [...blocks, ...solutionBlocks].find(block => block.id === activeId) :
    null;

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button
          onClick={checkSolution}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          Check Solution
        </button>
        <button
          onClick={handleHint}
          disabled={hintDisabled}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
        >
          {hintDisabled ? 'Hint (10s)' : 'Get Hint'}
        </button>
        <button
          onClick={undo}
          disabled={!canUndo}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 font-medium"
        >
          Undo (Ctrl+Z)
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 font-medium"
        >
          Redo (Ctrl+Y)
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-2 gap-8">
          <Droppable
            id="initial-area"
            className="min-h-[700px] w-full p-6 bg-gray-800 rounded-lg border border-gray-700"
          >
            <SortableContext
              items={blocks}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col">
                {blocks.map((block) => (
                  <CodeBlockItem
                    key={block.id}
                    block={block}
                    showHint={showHint?.id === block.id}
                    hintDirection={showHint?.direction}
                    indentation={0}
                    isIncorrect={incorrectBlocks.includes(block.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </Droppable>

          <Droppable
            id="solution-area"
            className="min-h-[700px] w-full p-6 bg-gray-800 rounded-lg border border-gray-700"
          >
            <SortableContext
              items={solutionBlocks}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col">
                {solutionBlocks.map((block) => (
                  <CodeBlockItem
                    key={block.id}
                    block={block}
                    showHint={showHint?.id === block.id}
                    hintDirection={showHint?.direction}
                    indentation={block.indentation}
                    isIncorrect={incorrectBlocks.includes(block.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </Droppable>
        </div>

        <DragOverlay>
          {activeBlock ? (
            <CodeBlockItem
              block={activeBlock}
              showHint={showHint?.id === activeBlock.id}
              hintDirection={showHint?.direction}
              indentation={currentIndentation}
              isIncorrect={incorrectBlocks.includes(activeBlock.id)}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
} 
