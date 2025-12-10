// src/components/boards/DeleteBoardDialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteBoard } from "@/lib/api";
import { Board } from "@/types";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { DialogClose } from "@radix-ui/react-dialog";

interface DeleteBoardDialogProps {
  board: Board;
  onSuccess?: () => void;
}

export function DeleteBoardDialog({
  board,
  onSuccess,
}: DeleteBoardDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    try {
      setIsLoading(true);
      await deleteBoard(board.id);
      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }

      // Redirect to boards page
      router.push("/boards");
    } catch (error) {
      console.error("Failed to delete board:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the board
            {board.title} and all of its lists, cards, and checklist items.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose disabled={isLoading}>Cancel</DialogClose>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Deleting..." : "Delete Board"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
