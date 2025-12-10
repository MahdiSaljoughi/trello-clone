// src/components/checklist/ChecklistItem.tsx
"use client";

import { useState } from "react";
import { ChecklistItem as ChecklistItemType } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { updateChecklistItem, deleteChecklistItem } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ChecklistItemProps {
  item: ChecklistItemType;
  onUpdate: () => void;
}

export function ChecklistItem({ item, onUpdate }: ChecklistItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleComplete = async () => {
    try {
      setIsLoading(true);
      await updateChecklistItem(item.id, {
        isCompleted: !item.isCompleted,
      });
      onUpdate();
    } catch (error) {
      console.error("Failed to update item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;

    try {
      setIsLoading(true);
      await updateChecklistItem(item.id, {
        title: editTitle.trim(),
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Failed to update item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteChecklistItem(item.id);
      onUpdate();
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditTitle(item.title);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50",
        item.isCompleted && "opacity-60"
      )}
    >
      <Checkbox
        checked={item.isCompleted}
        onCheckedChange={handleToggleComplete}
        disabled={isLoading}
        className="data-[state=checked]:bg-green-500"
      />

      {isEditing ? (
        <>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            autoFocus
            disabled={isLoading}
            className="flex-1"
          />
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSaveEdit}
              disabled={isLoading || !editTitle.trim()}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setEditTitle(item.title);
              }}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1">
            <span
              className={cn(
                "cursor-pointer hover:text-gray-700",
                item.isCompleted && "line-through text-gray-500"
              )}
              onClick={() => setIsEditing(true)}
            >
              {item.title}
            </span>
          </div>
          <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-6 w-6"
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDelete}
              disabled={isLoading}
              className="h-6 w-6 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
