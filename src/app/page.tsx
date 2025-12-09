"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Folder, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Board {
  id: string;
  title: string;
  description?: string;
}

export default function HomePage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBoard, setNewBoard] = useState({ title: "", description: "" });

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const { data } = await axios.get("/api/boards");
      setBoards(data);
    } catch (error) {
      toast.error("Failed to load boards");
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async () => {
    if (!newBoard.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const { data } = await axios.post("/api/boards", newBoard);
      setBoards([data, ...boards]);
      setNewBoard({ title: "", description: "" });
      toast.success("Board created");
    } catch (error) {
      toast.error("Failed to create board");
    }
  };

  const deleteBoard = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      await axios.delete(`/api/boards/${id}`);
      setBoards(boards.filter((board) => board.id !== id));
      toast.success("Board deleted");
    } catch (error) {
      toast.error("Failed to delete board");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Boards
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and manage your project boards
        </p>
      </div>

      {/* Create Board Form */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Board Title *
              </label>
              <input
                type="text"
                value={newBoard.title}
                onChange={(e) =>
                  setNewBoard({ ...newBoard, title: e.target.value })
                }
                placeholder="e.g., Project Tasks"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <textarea
                value={newBoard.description}
                onChange={(e) =>
                  setNewBoard({ ...newBoard, description: e.target.value })
                }
                placeholder="What's this board about?"
                className="w-full p-2 border rounded-md"
                rows={2}
              />
            </div>
            <Button onClick={createBoard}>
              <Plus className="h-4 w-4 mr-2" />
              Create Board
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Boards Grid */}
      {boards.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No boards yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first board to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <Card key={board.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Link href={`/boards/${board.id}`} className="flex-1">
                    <CardTitle className="hover:text-blue-600 transition-colors">
                      {board.title}
                    </CardTitle>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/boards/${board.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const title = prompt("New title:", board.title);
                          if (title && title !== board.title) {
                            axios
                              .put(`/api/boards/${board.id}`, {
                                title,
                                description: board.description,
                              })
                              .then(() => {
                                fetchBoards();
                                toast.success("Board updated");
                              })
                              .catch(() => toast.error("Failed to update"));
                          }
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => deleteBoard(board.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {board.description ? (
                  <p className="text-gray-600 dark:text-gray-400">
                    {board.description}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">No description</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
