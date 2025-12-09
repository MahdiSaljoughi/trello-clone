"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical } from "lucide-react";

interface Card {
  id: string;
  title: string;
  description?: string;
  order: number;
  listId: string;
}

interface SortableCardProps {
  card: Card;
  onDelete: () => void;
}

export function SortableCard({ card, onDelete }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "card",
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-50 dark:bg-gray-700 rounded p-3 hover:shadow transition-shadow ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2 flex-1">
          {/* این handle باید باشه */}
          <button
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing mt-1"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {card.title}
            </h4>
            {card.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {card.description}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 ml-2"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
