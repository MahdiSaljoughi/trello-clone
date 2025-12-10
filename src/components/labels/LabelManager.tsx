// src/components/labels/LabelManager.tsx (کامل)
"use client";

import { useState } from "react";
import { Label as LabelType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Plus, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColorPicker } from "./ColorPicker";
import { addLabelToCard, removeLabelFromCard, createLabel } from "@/lib/api";
import { toast } from "sonner";

interface LabelManagerProps {
  boardId: string;
  cardId: string;
  availableLabels: LabelType[];
  cardLabels: LabelType[];
  onLabelsChange: (labels: LabelType[]) => void;
}

export function LabelManager({
  boardId,
  cardId,
  availableLabels,
  cardLabels,
  onLabelsChange,
}: LabelManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3b82f6");
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAddLabel = async (labelId: string) => {
    if (isLoading) return;

    try {
      setIsLoading(`add-${labelId}`);
      await addLabelToCard(cardId, labelId);

      // پیدا کردن label اضافه شده
      const addedLabel = availableLabels.find((l) => l.id === labelId);
      if (addedLabel) {
        const newCardLabels = [...cardLabels, addedLabel];
        onLabelsChange(newCardLabels);
        toast.success("Label added to card");
      }
    } catch (error) {
      console.error("Failed to add label:", error);
      toast.error("Failed to add label");
    } finally {
      setIsLoading(null);
    }
  };

  const handleRemoveLabel = async (labelId: string) => {
    if (isLoading) return;

    try {
      setIsLoading(`remove-${labelId}`);
      await removeLabelFromCard(cardId, labelId);

      // حذف label از لیست
      const newCardLabels = cardLabels.filter((l) => l.id !== labelId);
      onLabelsChange(newCardLabels);
      toast.success("Label removed from card");
    } catch (error) {
      console.error("Failed to remove label:", error);
      toast.error("Failed to remove label");
    } finally {
      setIsLoading(null);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim() || isLoading) return;

    try {
      setIsLoading("create");

      // ایجاد label جدید
      const newLabel = await createLabel(boardId, {
        name: newLabelName.trim(),
        color: newLabelColor,
      });

      // اضافه کردن به کارت
      await addLabelToCard(cardId, newLabel.id);

      // آپدیت stateها
      const newCardLabels = [...cardLabels, newLabel];
      onLabelsChange(newCardLabels);

      // ریست فرم
      setNewLabelName("");
      setNewLabelColor("#3b82f6");
      setIsCreating(false);

      toast.success("Label created and added to card");
    } catch (error: any) {
      console.error("Failed to create label:", error);

      // اگر label با این نام وجود داشته باشه
      if (error.response?.data?.error?.includes("unique")) {
        toast.error("A label with this name already exists");
      } else {
        toast.error("Failed to create label");
      }
    } finally {
      setIsLoading(null);
    }
  };

  // فیلتر کردن labels که در دسترس هستند ولی روی کارت نیستند
  const availableLabelsFiltered = availableLabels.filter(
    (label) => !cardLabels.some((cardLabel) => cardLabel.id === label.id)
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Tag className="h-4 w-4 mr-2" />
          Labels
          {cardLabels.length > 0 && (
            <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
              {cardLabels.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h4 className="font-medium">Labels</h4>

          {/* Selected Labels */}
          {cardLabels.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Selected:</p>
              <div className="flex flex-wrap gap-2">
                {cardLabels.map((label) => (
                  <div
                    key={label.id}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
                      "text-white transition-all"
                    )}
                    style={{ backgroundColor: label.color }}
                  >
                    <span>{label.name}</span>
                    <button
                      onClick={() => handleRemoveLabel(label.id)}
                      disabled={isLoading === `remove-${label.id}`}
                      className="hover:bg-white/20 rounded disabled:opacity-50"
                      title="Remove label"
                    >
                      {isLoading === `remove-${label.id}` ? (
                        <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Labels */}
          {availableLabelsFiltered.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Available labels:</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {availableLabelsFiltered.map((label) => {
                  const isAdding = isLoading === `add-${label.id}`;
                  return (
                    <button
                      key={label.id}
                      onClick={() => handleAddLabel(label.id)}
                      disabled={isLoading !== null}
                      className={cn(
                        "flex items-center justify-between w-full p-2 rounded hover:bg-gray-50",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="text-sm">{label.name}</span>
                      </div>
                      {isAdding ? (
                        <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Create New Label */}
          {isCreating ? (
            <div className="space-y-3 p-3 border rounded-lg">
              <Input
                placeholder="Label name"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                autoFocus
                disabled={isLoading === "create"}
                className="w-full"
              />
              <ColorPicker
                value={newLabelColor}
                onChange={setNewLabelColor}
                // @ts-ignore
                disabled={isLoading === "create"}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateLabel}
                  disabled={!newLabelName.trim() || isLoading === "create"}
                  className="flex-1"
                >
                  {isLoading === "create" ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create & Add"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setNewLabelName("");
                    setNewLabelColor("#3b82f6");
                  }}
                  disabled={isLoading === "create"}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setIsCreating(true)}
              disabled={isLoading !== null}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create new label
            </Button>
          )}

          {/* اگر هیچ labelی وجود نداشته باشه */}
          {availableLabels.length === 0 &&
            cardLabels.length === 0 &&
            !isCreating && (
              <div className="text-center py-4 border rounded-lg">
                <Tag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No labels created yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Create your first label to organize cards
                </p>
              </div>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
