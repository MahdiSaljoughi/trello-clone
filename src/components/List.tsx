"use client";

import { Trash2, Plus } from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableCard } from "./SortableCard";

interface ListProps {
  list: {
    id: string;
    title: string;
    cards: Array<{
      id: string;
      title: string;
      description?: string;
      order: number;
      listId: string;
    }>;
  };
  onDelete: () => void;
  onCreateCard: () => void;
  onDeleteCard: (cardId: string) => void;
}

export function List({
  list,
  onDelete,
  onCreateCard,
  onDeleteCard,
}: ListProps) {
  // کارت‌ها رو بر اساس order مرتب کن
  const sortedCards = [...list.cards].sort((a, b) => a.order - b.order);

  return (
    <div className="flex-shrink-0 w-72">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {list.title}
          </h3>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* SortableContext برای کارت‌ها */}
        <SortableContext
          items={sortedCards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 mb-4 min-h-[20px]">
            {sortedCards.map((card) => (
              <SortableCard
                key={card.id}
                card={card}
                onDelete={() => onDeleteCard(card.id)}
              />
            ))}
          </div>
        </SortableContext>

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
