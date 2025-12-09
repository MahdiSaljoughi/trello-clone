"use client";

import { Card } from "@/generated/prisma/client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical, Check, Calendar, Flag } from "lucide-react";

interface SortableCardProps {
  card: Card;
  onDelete: () => void;
  onUpdate: (updates: Partial<Card>) => void;
}

export function SortableCard({ card, onDelete, onUpdate }: SortableCardProps) {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="bg-white dark:bg-gray-700 rounded shadow p-3 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <button
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing mt-1"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="flex-1 ml-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdate({ isCompleted: !card.isCompleted })}
                  className={`p-1 rounded border ${
                    card.isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <Check className="h-3 w-3" />
                </button>
                <h4
                  className={`font-medium ${
                    card.isCompleted
                      ? "line-through text-gray-500"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {card.title}
                </h4>
              </div>

              <div className="flex items-center gap-1">
                {card.dueDate && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(card.dueDate).toLocaleDateString()}
                  </span>
                )}
                <span
                  className={`w-3 h-3 rounded-full ${getPriorityColor(
                    card.priority
                  )}`}
                />
              </div>
            </div>

            {card.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {card.description}
              </p>
            )}

            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center gap-2">
                <Flag
                  className={`h-3 w-3 ${getPriorityColor(card.priority).replace(
                    "bg-",
                    "text-"
                  )}`}
                />
                <span className="text-xs text-gray-500 capitalize">
                  {card.priority}
                </span>
              </div>

              <button
                onClick={onDelete}
                className="text-gray-400 hover:text-red-500 p-1"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
