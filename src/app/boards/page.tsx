// src/app/(dashboard)/boards/page.tsx (آپدیت شده)
"use client";

import { useEffect, useState } from "react";
import { Board } from "@/types";
import { fetchBoards } from "@/lib/api";
import { BoardCard } from "@/components/board/BoardCard";
import { CreateBoardDialog } from "@/components/board/CreateBoardDialog";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const data = await fetchBoards();
      setBoards(data);
    } catch (error) {
      console.error("Failed to load boards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Boards</h1>
          <p className="text-gray-600 mt-2">Manage your projects and tasks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadBoards}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <CreateBoardDialog onSuccess={loadBoards}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Board
            </Button>
          </CreateBoardDialog>
        </div>
      </div>

      {boards.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">
            No boards yet. Create your first board!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} onUpdate={loadBoards} />
          ))}
        </div>
      )}
    </div>
  );
}
