import { useDroppable } from '@dnd-kit/core';

interface DroppableProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function Droppable({ id, children, className }: DroppableProps) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  );
} 