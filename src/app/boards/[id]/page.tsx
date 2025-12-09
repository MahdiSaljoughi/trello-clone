"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Plus, MoreVertical, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Board {
  id: string;
  title: string;
  description?: string;
  lists: List[];
}

interface List {
  id: string;
  title: string;
  order: number;
  cards: Card[];
}

interface Card {
  id: string;
  title: string;
  description?: string;
  order: number;
}

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [newList, setNewList] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchBoard();
    }
  }, [params.id]);

  const fetchBoard = async () => {
    try {
      const { data } = await axios.get(`/api/boards/${params.id}`);
      setBoard(data);
    } catch (error) {
      toast.error("Failed to load board");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const createList = async () => {
    if (!newList.trim()) {
      toast.error("List title is required");
      return;
    }

    try {
      const { data } = await axios.post("/api/lists", {
        title: newList,
        boardId: params.id,
      });

      setBoard((prev) =>
        prev
          ? {
              ...prev,
              lists: [...prev.lists, data],
            }
          : null
      );

      setNewList("");
      toast.success("List created");
    } catch (error) {
      toast.error("Failed to create list");
    }
  };

  const createCard = async (listId: string) => {
    const title = prompt("Card title:");
    if (!title?.trim()) return;

    try {
      const { data } = await axios.post("/api/cards", {
        title,
        listId,
      });

      setBoard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          lists: prev.lists.map((list) =>
            list.id === listId
              ? { ...list, cards: [...list.cards, data] }
              : list
          ),
        };
      });

      toast.success("Card created");
    } catch (error) {
      toast.error("Failed to create card");
    }
  };

  const deleteList = async (listId: string) => {
    if (!confirm("Delete this list and all its cards?")) return;

    try {
      await axios.delete(`/api/lists/${listId}`);
      setBoard((prev) =>
        prev
          ? {
              ...prev,
              lists: prev.lists.filter((list) => list.id !== listId),
            }
          : null
      );

      toast.success("List deleted");
    } catch (error) {
      toast.error("Failed to delete list");
    }
  };

  const deleteCard = async (cardId: string, listId: string) => {
    if (!confirm("Delete this card?")) return;

    try {
      await axios.delete(`/api/cards/${cardId}`);
      setBoard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          lists: prev.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  cards: list.cards.filter((card) => card.id !== cardId),
                }
              : list
          ),
        };
      });

      toast.success("Card deleted");
    } catch (error) {
      toast.error("Failed to delete card");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48 mb-4" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-72 bg-gray-100 dark:bg-gray-800 rounded p-4"
            >
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
              <div className="space-y-2">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!board) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {board.title}
            </h1>
            {board.description && (
              <p className="text-gray-600 dark:text-gray-400">
                {board.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {/* Existing Lists */}
          {board.lists.map((list) => (
            <div
              key={list.id}
              className="flex-shrink-0 w-72 bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {list.title}
                </h3>
                <button
                  onClick={() => deleteList(list.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Cards */}
              <div className="space-y-2 mb-4">
                {list.cards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded p-3 hover:shadow transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {card.title}
                        </h4>
                        {card.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {card.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteCard(card.id, list.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Card Button */}
              <button
                onClick={() => createCard(list.id)}
                className="w-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                + Add a card
              </button>
            </div>
          ))}

          {/* Add List Form */}
          <div className="flex-shrink-0 w-72">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <input
                type="text"
                value={newList}
                onChange={(e) => setNewList(e.target.value)}
                placeholder="Enter list title..."
                className="w-full p-2 border rounded mb-3"
                onKeyPress={(e) => e.key === "Enter" && createList()}
              />
              <div className="flex gap-2">
                <Button onClick={createList} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Add List
                </Button>
                <button
                  onClick={() => setNewList("")}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
