"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical, Plus } from "lucide-react";
import { SortableCard } from "./SortableCard";

interface List {
  id: string;
  title: string;
  order: number;
  cards: Card[];
}

interface Card {
  id: string;
  title: string;
  description?: string;
  order: number;
  listId: string;
}

interface SortableListProps {
  list: List;
  onDelete: (listId: string) => void;
  onCreateCard: () => void;
  onDeleteCard: (cardId: string) => void;
}

export function SortableList({
  list,
  onDelete,
  onCreateCard,
  onDeleteCard,
}: SortableListProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: "list",
      list,
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
      className={`flex-shrink-0 w-72 ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {list.title}
            </h3>
          </div>
          <button
            onClick={() => onDelete(list.id)}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Cards */}
        <div className="space-y-2 mb-4">
          {list.cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onDelete={() => onDeleteCard(card.id)}
            />
          ))}
        </div>

        {/* Add Card Button */}
        <button
          onClick={onCreateCard}
          className="w-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add a card
        </button>
      </div>
    </div>
  );
}
