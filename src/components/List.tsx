"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableCard } from "./SortableCard";
import { useDroppable } from "@dnd-kit/core";

// Types
interface Card {
  id: string;
  title: string;
  description?: string;
  order: number;
  listId: string;
  priority: "low" | "medium" | "high" | "urgent";
  isCompleted: boolean;
  dueDate?: string;
}

interface ListProps {
  list: {
    id: string;
    title: string;
    cards: Card[];
  };
  onDelete: () => void;
  onCreateCard: (cardData: {
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high" | "urgent";
    dueDate?: string;
  }) => Promise<void>;
  onDeleteCard: (cardId: string) => void;
  onUpdateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
}

export function List({
  list,
  onDelete,
  onCreateCard,
  onDeleteCard,
  onUpdateCard,
}: ListProps) {
  const [showCardForm, setShowCardForm] = useState(false);
  const [newCard, setNewCard] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
  });

  // Use droppable for the list to accept cards
  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: {
      type: "list",
      list,
    },
  });

  // Sort cards by priority and order
  const sortedCards = [...list.cards].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.order - b.order;
  });

  const handleCreateCard = async () => {
    if (!newCard.title.trim()) return;

    await onCreateCard(newCard);
    setNewCard({ title: "", description: "", priority: "medium" });
    setShowCardForm(false);
  };

  // Stats
  const totalCards = list.cards.length;
  const completedCards = list.cards.filter((card) => card.isCompleted).length;
  const progress =
    totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  return (
    <div
      ref={setNodeRef}
      className={`shrink-0 w-80 ${
        isOver ? "ring-2 ring-blue-500 ring-inset rounded-lg" : ""
      }`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {list.title}
            </h3>
            {totalCards > 0 && (
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span>{totalCards} cards</span>
                <span>•</span>
                <span>{completedCards} done</span>
                <span>•</span>
                <span>{progress}%</span>
              </div>
            )}
          </div>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 p-1"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Bar */}
        {totalCards > 0 && (
          <div className="mb-4">
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Cards Container */}
        <div className="mb-4 min-h-[40px]">
          <SortableContext
            items={sortedCards.map((card) => card.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {sortedCards.map((card) => (
                <SortableCard
                  key={card.id}
                  card={card}
                  onDelete={() => onDeleteCard(card.id)}
                  onUpdate={(updates) => onUpdateCard(card.id, updates)}
                />
              ))}
            </div>
          </SortableContext>
        </div>

        {/* Add Card Form */}
        {showCardForm ? (
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-2">
            <input
              type="text"
              value={newCard.title}
              onChange={(e) =>
                setNewCard({ ...newCard, title: e.target.value })
              }
              placeholder="Enter a title..."
              className="w-full p-2 border rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />

            <textarea
              value={newCard.description}
              onChange={(e) =>
                setNewCard({ ...newCard, description: e.target.value })
              }
              placeholder="Description (optional)"
              className="w-full p-2 border rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-500">Priority:</span>
              <select
                value={newCard.priority}
                onChange={(e) =>
                  setNewCard({
                    ...newCard,
                    priority: e.target.value as
                      | "low"
                      | "medium"
                      | "high"
                      | "urgent",
                  })
                }
                className="text-xs border rounded p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreateCard}
                className="flex-1 bg-blue-500 text-white text-sm py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Add Card
              </button>
              <button
                onClick={() => {
                  setShowCardForm(false);
                  setNewCard({
                    title: "",
                    description: "",
                    priority: "medium",
                  });
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCardForm(true)}
            className="w-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center gap-1 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add a card
          </button>
        )}
      </div>
    </div>
  );
}
