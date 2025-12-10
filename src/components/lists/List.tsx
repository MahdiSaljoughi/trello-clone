// src/components/lists/List.tsx (جدید - بدون درگ)
"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { List as ListType } from "@/types";
import { SortableCard } from "@/components/cards/SortableCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditListDialog } from "./EditListDialog";
import { CreateCardDialog } from "@/components/cards/CreateCardDialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ListProps {
  list: ListType;
  onCardCreated: () => void;
  onCardUpdated?: () => void;
  onCardDeleted?: () => void;
}

export function List({
  list,
  onCardCreated,
  onCardUpdated,
  onCardDeleted,
}: ListProps) {
  const [showCreateCard, setShowCreateCard] = useState(false);
  const totalCards = list.cards.length;

  const { setNodeRef, isOver } = useDroppable({
    id: `list-${list.id}`, // اضافه کردن prefix برای تفکیک از card id
  });

  const handleCardCreated = () => {
    setShowCreateCard(false);
    onCardCreated();
  };

  return (
    <>
      <div className="w-80 flex-shrink-0">
        <Card
          className={cn(
            "h-full transition-colors duration-200",
            isOver && "bg-blue-50 border-2 border-blue-400 border-dashed"
          )}
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {list.title}
                </h3>
                {list.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {list.description}
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <EditListDialog list={list} onSuccess={onCardCreated} />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="text-sm text-gray-500">
              {totalCards} {totalCards === 1 ? "card" : "cards"}
            </div>
          </CardHeader>

          <CardContent
            ref={setNodeRef}
            className="space-y-3 pb-4 min-h-[100px]"
          >
            <SortableContext
              items={list.cards.map((card) => card.id)}
              strategy={verticalListSortingStrategy}
            >
              {/* Cards */}
              {list.cards.map((card) => (
                <SortableCard
                  key={card.id}
                  card={card}
                  onCardUpdated={onCardUpdated}
                  onCardDeleted={onCardDeleted}
                />
              ))}
            </SortableContext>

            {/* Add Card Button */}
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-500 hover:text-gray-700"
              onClick={() => setShowCreateCard(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add a card
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Create Card Dialog */}
      <CreateCardDialog
        open={showCreateCard}
        onOpenChange={setShowCreateCard}
        listId={list.id}
        onSuccess={handleCardCreated}
      />
    </>
  );
}
