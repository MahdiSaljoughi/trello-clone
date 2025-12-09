"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  Settings,
  Users,
  Bell,
  Share2,
  Filter,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Board {
  id: string;
  title: string;
  description?: string;
  lists: Array<{
    id: string;
    title: string;
    order: number;
    cards: Array<{
      id: string;
      title: string;
      description?: string;
      order: number;
      labels: Array<{ id: string; title: string; color: string }>;
    }>;
  }>;
}

export default function SingleBoard() {
  const params = useParams();
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchBoard(params.id as string);
    }
  }, [params.id]);

  const fetchBoard = async (id: string) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/boards/${id}`);
      setBoard(data.data || data);
    } catch (error) {
      console.error("Failed to fetch board:", error);
      router.push("/boards");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
          <div className="h-16 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8" />
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
        <div className="p-6">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Board not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The board you are looking for does not exist or you do not have
            access.
          </p>
          <Button onClick={() => router.push("/boards")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Boards
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Board Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
        <div className="h-16 px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/boards")}
              className="hidden md:inline-flex"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {board.title}
              </h1>
              {board.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-md">
                  {board.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>

            <Button variant="outline" size="sm">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline ml-2">Members</span>
            </Button>

            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="p-4 lg:p-6">
        <BoardView board={board} />
      </div>
    </div>
  );
}
