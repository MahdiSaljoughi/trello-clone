"use client";

import { useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeleteBoardDialogProps {
  boardId: string;
  boardTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteBoardDialog({
  boardId,
  boardTitle,
  open,
  onOpenChange,
  onSuccess,
}: DeleteBoardDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      await axios.delete(`/api/boards/${boardId}`);

      toast.success("Success", {
        description: "Board deleted successfully",
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error deleting board:", error);
      toast.error("Error", {
        description: error.response?.data?.error || "Failed to delete board",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            <DialogTitle>Delete Board</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete
            <span className="font-semibold text-gray-900 dark:text-white">
              {boardTitle}
            </span>
            ?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This action cannot be undone. All lists, cards, and related data
            will be permanently deleted.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Board"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
