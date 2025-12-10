// src/components/cards/SortableCard.tsx (آپدیت شده)
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card as CardType } from "@/types";
import { CardComponent } from "./Card";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableCardProps {
  card: CardType;
  onCardUpdated?: () => void;
  onCardDeleted?: () => void;
}

export function SortableCard({
  card,
  onCardUpdated,
  onCardDeleted,
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("relative", isDragging && "opacity-50 z-50")}
    >
      <div className="flex items-start gap-2 group">
        <button
          className={cn(
            "cursor-grab active:cursor-grabbing",
            "p-1 -ml-1 rounded hover:bg-gray-100 transition-colors",
            "opacity-60 hover:opacity-100"
          )}
          {...attributes}
          {...listeners}
          title="Drag to move"
        >
          <GripVertical className="h-4 w-4 text-gray-500" />
        </button>
        <div className="flex-1">
          <CardComponent
            card={card}
            onCardUpdated={onCardUpdated}
            onCardDeleted={onCardDeleted}
          />
        </div>
      </div>
    </div>
  );
}
