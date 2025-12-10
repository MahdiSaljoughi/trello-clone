// src/app/(dashboard)/boards/[boardId]/page.tsx (آپدیت شده)
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Board, Card } from "@/types";
import { fetchBoard } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DndProvider } from "@/components/providers/DndProvider";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { List } from "@/components/lists/List";

export default function BoardPage() {
  const params = useParams();
  const boardId = params.boardId as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allCards, setAllCards] = useState<Card[]>([]);

  useEffect(() => {
    if (boardId) {
      loadBoard();
    }
  }, [boardId]);

  const loadBoard = async () => {
    try {
      setIsLoading(true);
      const data = await fetchBoard(boardId);
      setBoard(data);

      // جمع‌آوری همه کارت‌ها برای DndProvider
      const cards: Card[] = [];
      data.lists.forEach((list) => {
        cards.push(...list.cards);
      });
      setAllCards(cards);
    } catch (error) {
      console.error("Failed to load board:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const { handleDragEnd } = useDragAndDrop({
    lists: board?.lists || [],
    onMoveSuccess: loadBoard,
  });

  const handleCardCreated = () => {
    loadBoard();
  };

  const handleCardUpdated = () => {
    // loadBoard();
  };

  const handleCardDeleted = () => {
    loadBoard();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Board not found</h2>
        <p className="text-gray-600 mt-2">
          The board you are looking for does not exist.
        </p>
        <Button asChild className="mt-4">
          <Link href="/boards">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Boards
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <DndProvider cards={allCards} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/boards">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">
                {board.title}
              </h1>
            </div>
            {board.description && (
              <p className="text-gray-600">{board.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={loadBoard}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Lists Container */}
        <div className="flex gap-6 overflow-x-auto pb-4">
          {board.lists.map((list) => (
            <List
              key={list.id}
              list={list}
              onCardCreated={handleCardCreated}
              onCardUpdated={handleCardUpdated}
              onCardDeleted={handleCardDeleted}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}
