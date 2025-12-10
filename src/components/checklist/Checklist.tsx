// src/components/checklist/Checklist.tsx
"use client";

import { useState } from "react";
import { ChecklistItem as ChecklistItemType } from "@/types";
import { ChecklistItem } from "./ChecklistItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { createChecklistItem } from "@/lib/api";

interface ChecklistProps {
  cardId: string;
  items: ChecklistItemType[];
  onUpdate: () => void;
}

export function Checklist({ cardId, items, onUpdate }: ChecklistProps) {
  const [newItemTitle, setNewItemTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) return;

    try {
      setIsAdding(true);
      await createChecklistItem(cardId, {
        title: newItemTitle.trim(),
      });
      setNewItemTitle("");
      onUpdate();
    } catch (error) {
      console.error("Failed to add checklist item:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <div className="space-y-3">
      {/* Existing Items */}
      {items.map((item) => (
        <ChecklistItem key={item.id} item={item} onUpdate={onUpdate} />
      ))}

      {/* Add New Item */}
      <div className="flex gap-2">
        <Input
          placeholder="Add an item..."
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isAdding}
        />
        <Button
          onClick={handleAddItem}
          disabled={!newItemTitle.trim() || isAdding}
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
