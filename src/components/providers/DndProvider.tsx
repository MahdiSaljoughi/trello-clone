// src/components/providers/DndProvider.tsx (آپدیت شده)
"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ReactNode, useState } from "react";
import { Card } from "@/types";

interface DndProviderProps {
  children: ReactNode;
  cards: Card[];
  onDragEnd: (event: DragEndEvent) => void;
}

export function DndProvider({ children, cards, onDragEnd }: DndProviderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

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

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id as string);

    // پیدا کردن کارت فعال
    const card = cards.find((c) => c.id === active.id);
    setActiveCard(card || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    setActiveCard(null);
    onDragEnd(event);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
      <DragOverlay>
        {activeCard ? (
          <div className="opacity-80 bg-white border-2 border-blue-300 rounded-lg shadow-xl p-4 w-72">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900">{activeCard.title}</h4>
              <div
                className={`px-2 py-1 rounded text-xs ${
                  activeCard.priority === "URGENT"
                    ? "bg-red-100 text-red-800"
                    : activeCard.priority === "HIGH"
                    ? "bg-orange-100 text-orange-800"
                    : activeCard.priority === "MEDIUM"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {activeCard.priority}
              </div>
            </div>
            {activeCard.description && (
              <p className="text-sm text-gray-600 truncate">
                {activeCard.description}
              </p>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
