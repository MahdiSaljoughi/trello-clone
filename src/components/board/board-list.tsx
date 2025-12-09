"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Grid,
  List as ListIcon,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Users,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreateBoardDialog } from "./CreateBoardDialog";
import { EditBoardDialog } from "./EditBoardDialog";
import { DeleteBoardDialog } from "./DeleteBoardDialog";
import { useBoardApi } from "@/hooks/useBoardApi";
import { toast } from "sonner";

interface Board {
  id: string;
  title: string;
  description?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  lists?: {
    id: string;
    title: string;
    order: number;
    _count?: {
      cards: number;
    };
  }[];
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function BoardList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const boardApi = useBoardApi();

  // State
  const [boards, setBoards] = useState<Board[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "title">(
    "updatedAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Get current page from URL or default to 1
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Fetch boards on mount and when filters change
  const fetchBoards = useCallback(async () => {
    try {
      const response = await boardApi.fetchBoards({
        page: currentPage,
        limit: pagination.limit,
        userId: searchParams.get("userId") || undefined,
      });

      if (response.success && response.data) {
        if (response.data.boards) {
          setBoards(response.data.boards);
          if (response.data.pagination) {
            setPagination(response.data.pagination);
          }
        } else {
          setBoards(response.data);
          setPagination((prev) => ({ ...prev, total: response.data.length }));
        }
      } else {
        toast.error("Error", {
          description: response.error || "Failed to load boards",
        });
      }
    } catch (error) {
      console.error("Failed to fetch boards:", error);
    }
  }, [currentPage, pagination.limit, searchParams, boardApi, toast]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        // Filter boards locally for now
        // In production, you might want to implement server-side search
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  // Handle board actions
  const handleEditSuccess = () => {
    fetchBoards();
    toast.success("Success", {
      description: "Board updated successfully",
    });
  };

  const handleDeleteSuccess = () => {
    fetchBoards();
    toast.success("Success", {
      description: "Board deleted successfully",
    });
  };

  const handleCreateSuccess = () => {
    fetchBoards();
    toast.success("Success", {
      description: "Board created successfully",
    });
  };

  // Filtered and sorted boards
  const filteredBoards = boards.filter(
    (board) =>
      board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (board.description &&
        board.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedBoards = [...filteredBoards].sort((a, b) => {
    if (sortBy === "title") {
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }

    const dateA = new Date(sortBy === "createdAt" ? a.createdAt : a.updatedAt);
    const dateB = new Date(sortBy === "createdAt" ? b.createdAt : b.updatedAt);

    return sortOrder === "asc"
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  });

  // Loading state
  if (boardApi.loading && boards.length === 0) {
    return <LoadingBoardList />;
  }

  // Error state
  if (boardApi.error && boards.length === 0) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{boardApi.error}</AlertDescription>
        </Alert>
        <Button onClick={fetchBoards} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Boards
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {boards.length === 0
              ? "Create your first board to get started"
              : `Total ${pagination.total} board${
                  pagination.total !== 1 ? "s" : ""
                }`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search boards..."
              className="pl-9 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort */}
          <Select
            value={sortBy}
            onValueChange={(value: any) => setSortBy(value)}
          >
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">Recently Updated</SelectItem>
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>

          {/* Order */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "Ascending" : "Descending"}
          </Button>

          {/* View Toggle */}
          <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-lg">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-l-lg border-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-r-lg border-0"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Create Button */}
          <CreateBoardDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSuccess={handleCreateSuccess}
          />
        </div>
      </div>

      {/* Stats */}
      {boards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Boards"
            value={pagination.total}
            description="All your boards"
            color="blue"
          />
          <StatCard
            title="Active Lists"
            value={boards.reduce(
              (sum, board) => sum + (board.lists?.length || 0),
              0
            )}
            description="Across all boards"
            color="green"
          />
          <StatCard
            title="Total Cards"
            value={boards.reduce(
              (sum, board) =>
                sum +
                  board.lists?.reduce(
                    (listSum, list) => listSum + (list._count?.cards || 0),
                    0
                  ) || 0,
              0
            )}
            description="All tasks and items"
            color="purple"
          />
          <StatCard
            title="This Page"
            value={boards.length}
            description={`Page ${currentPage} of ${pagination.totalPages}`}
            color="orange"
          />
        </div>
      )}

      {/* Boards */}
      {sortedBoards.length === 0 ? (
        <EmptyState
          onCreate={() => setShowCreateDialog(true)}
          hasSearch={searchQuery.length > 0}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedBoards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onEdit={() => setEditingBoard(board)}
              onDelete={() =>
                setDeletingBoard({ id: board.id, title: board.title })
              }
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedBoards.map((board) => (
            <BoardListItem
              key={board.id}
              board={board}
              onEdit={() => setEditingBoard(board)}
              onDelete={() =>
                setDeletingBoard({ id: board.id, title: board.title })
              }
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="font-medium">{pagination.total}</span> boards
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-9 h-9 p-0"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      {editingBoard && (
        <EditBoardDialog
          board={editingBoard}
          open={!!editingBoard}
          onOpenChange={(open) => !open && setEditingBoard(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {deletingBoard && (
        <DeleteBoardDialog
          boardId={deletingBoard.id}
          boardTitle={deletingBoard.title}
          open={!!deletingBoard}
          onOpenChange={(open) => !open && setDeletingBoard(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}

// Loading Component
function LoadingBoardList() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-2 w-full" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({
  onCreate,
  hasSearch,
}: {
  onCreate: () => void;
  hasSearch: boolean;
}) {
  return (
    <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
        <Plus className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {hasSearch ? "No boards found" : "No boards yet"}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {hasSearch
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Create your first board to start organizing your tasks and projects."}
      </p>
      {!hasSearch && (
        <Button onClick={onCreate} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Create Your First Board
        </Button>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  description,
  color,
}: {
  title: string;
  value: number;
  description: string;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    green:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    orange:
      "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
  };

  const textClasses = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    purple: "text-purple-600 dark:text-purple-400",
    orange: "text-orange-600 dark:text-orange-400",
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
        {title}
      </p>
      <p className={`text-2xl font-bold ${textClasses[color]} mb-1`}>
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}

// Board Card Component (Grid View)
function BoardCard({
  board,
  onEdit,
  onDelete,
}: {
  board: Board;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const totalLists = board.lists?.length || 0;
  const totalCards =
    board.lists?.reduce((sum, list) => sum + (list._count?.cards || 0), 0) || 0;

  const boardColors = [
    "bg-gradient-to-br from-blue-500 to-blue-600",
    "bg-gradient-to-br from-green-500 to-green-600",
    "bg-gradient-to-br from-purple-500 to-purple-600",
    "bg-gradient-to-br from-pink-500 to-pink-600",
    "bg-gradient-to-br from-orange-500 to-orange-600",
    "bg-gradient-to-br from-teal-500 to-teal-600",
  ];

  const boardColor = boardColors[board.id.charCodeAt(0) % boardColors.length];

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div className={`h-2 ${boardColor}`} />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Link href={`/boards/${board.id}`} className="flex-1">
            <CardTitle className="text-lg hover:text-primary transition-colors line-clamp-1">
              {board.title}
            </CardTitle>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/boards/${board.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {board.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
            {board.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2">
          {totalLists > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <ListIcon className="w-3 h-3" />
              {totalLists} list{totalLists !== 1 ? "s" : ""}
            </Badge>
          )}

          {totalCards > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {totalCards} card{totalCards !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              {new Date(board.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {board.user?.image ? (
              <img
                src={board.user.image}
                alt={board.user.name || "User"}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Users className="h-3 w-3 text-gray-500" />
              </div>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

// Board List Item Component (List View)
function BoardListItem({
  board,
  onEdit,
  onDelete,
}: {
  board: Board;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const totalLists = board.lists?.length || 0;
  const totalCards =
    board.lists?.reduce((sum, list) => sum + (list._count?.cards || 0), 0) || 0;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-3 h-12 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />

        <div className="flex-1">
          <Link href={`/boards/${board.id}`}>
            <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors">
              {board.title}
            </h3>
          </Link>
          {board.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
              {board.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Stats */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <ListIcon className="h-4 w-4" />
            <span>
              {totalLists} list{totalLists !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span>
              {totalCards} card{totalCards !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {new Date(board.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/boards/${board.id}`, "_blank")}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
