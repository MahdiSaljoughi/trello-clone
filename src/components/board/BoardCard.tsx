// src/components/boards/BoardCard.tsx (آپدیت شده)
import { Board } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ListTodo, MoreVertical } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { EditBoardDialog } from "./EditBoardDialog";
import { DeleteBoardDialog } from "./DeleteBoardDialog";

interface BoardCardProps {
  board: Board;
  onUpdate?: () => void;
}

export function BoardCard({ board, onUpdate }: BoardCardProps) {
  const totalCards = board.lists.reduce(
    (sum, list) => sum + list.cards.length,
    0
  );

  const handleSuccess = () => {
    if (onUpdate) onUpdate();
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 group">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Link href={`/boards/${board.id}`}>
              <h3 className="font-semibold text-lg text-gray-900 hover:text-primary transition-colors cursor-pointer">
                {board.title}
              </h3>
            </Link>
            {board.description && (
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {board.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <EditBoardDialog board={board} onSuccess={handleSuccess} />
              <DeleteBoardDialog board={board} onSuccess={handleSuccess} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ListTodo className="h-4 w-4" />
            <span>{totalCards} cards</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDistanceToNow(new Date(board.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/boards/${board.id}`}>Open</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
