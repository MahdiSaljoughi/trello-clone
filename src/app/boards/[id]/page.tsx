"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Plus, ArrowLeft, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import DND Kit
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { List } from "@/components/List";

// Types
interface Card {
  id: string;
  title: string;
  description?: string;
  order: number;
  listId: string;
  priority: "low" | "medium" | "high" | "urgent";
  isCompleted: boolean;
  dueDate?: string;
}

interface ListType {
  id: string;
  title: string;
  order: number;
  cards: Card[];
}

interface Board {
  id: string;
  title: string;
  description?: string;
  lists: ListType[];
}

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [newList, setNewList] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  // Setup drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch board
  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/boards/${params.id}`);
      setBoard(data);
    } catch (error) {
      toast.error("Failed to load board");
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (params.id) {
      fetchBoard();
    }
  }, [params.id, fetchBoard]);

  // Create list
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

  // Create card
  const createCard = async (
    listId: string,
    cardData: {
      title: string;
      description?: string;
      priority?: "low" | "medium" | "high" | "urgent";
      dueDate?: string;
    }
  ) => {
    try {
      const { data } = await axios.post("/api/cards", {
        ...cardData,
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

  // Delete list
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

  // Delete card
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

  // Update card
  const updateCard = async (cardId: string, updates: Partial<Card>) => {
    try {
      const { data } = await axios.put(`/api/cards/${cardId}`, updates);

      setBoard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
              card.id === cardId ? { ...card, ...data } : card
            ),
          })),
        };
      });

      toast.success("Card updated");
    } catch (error) {
      toast.error("Failed to update card");
      fetchBoard();
    }
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end - فقط برای کارت‌ها
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !board) {
      setActiveId(null);
      return;
    }

    setActiveId(null);

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // اگر از نوع کارت باشد
    if (active.data.current?.type === "card") {
      const activeCard = active.data.current.card as Card;

      // پیدا کردن لیست فعلی کارت
      const activeListIndex = board.lists.findIndex(
        (list) => list.id === activeCard.listId
      );

      // بررسی اینکه روی کدام عنصر رها شده
      const overListIndex = board.lists.findIndex((list) => {
        // اگر روی لیست رها شده
        if (list.id === overId) return true;
        // یا اگر روی کارتی در این لیست رها شده
        return list.cards.some((card) => card.id === overId);
      });

      if (activeListIndex === -1 || overListIndex === -1) return;

      const activeList = board.lists[activeListIndex];
      const overList = board.lists[overListIndex];

      // اگر در همان لیست هستیم
      if (activeList.id === overList.id) {
        const newCards = [...activeList.cards];
        const oldIndex = newCards.findIndex((card) => card.id === activeId);
        const overIndex = newCards.findIndex((card) => card.id === overId);

        if (oldIndex !== -1 && overIndex !== -1) {
          const [movedCard] = newCards.splice(oldIndex, 1);
          newCards.splice(overIndex, 0, movedCard);

          const newLists = [...board.lists];
          newLists[activeListIndex] = {
            ...activeList,
            cards: newCards.map((card, index) => ({
              ...card,
              order: index,
            })),
          };

          setBoard({
            ...board,
            lists: newLists,
          });

          // آپدیت در دیتابیس
          try {
            await axios.put(`/api/cards/${activeCard.id}`, {
              order: overIndex,
            });
          } catch (error) {
            toast.error("Failed to reorder card");
            fetchBoard();
          }
        }
      } else {
        // انتقال به لیست دیگر
        const newActiveCards = activeList.cards.filter(
          (card) => card.id !== activeId
        );

        const overCardIndex = overList.cards.findIndex(
          (card) => card.id === overId
        );
        const insertIndex =
          overCardIndex !== -1 ? overCardIndex : overList.cards.length;

        const newOverCards = [...overList.cards];
        newOverCards.splice(insertIndex, 0, {
          ...activeCard,
          listId: overList.id,
        });

        const newLists = [...board.lists];
        newLists[activeListIndex] = {
          ...activeList,
          cards: newActiveCards.map((card, index) => ({
            ...card,
            order: index,
          })),
        };
        newLists[overListIndex] = {
          ...overList,
          cards: newOverCards.map((card, index) => ({
            ...card,
            order: index,
          })),
        };

        setBoard({
          ...board,
          lists: newLists,
        });

        // آپدیت در دیتابیس
        try {
          await axios.put(`/api/cards/${activeCard.id}`, {
            listId: overList.id,
            order: insertIndex,
          });
          toast.success("Card moved to another list");
        } catch (error) {
          toast.error("Failed to move card");
          fetchBoard();
        }
      }
    }
  };

  // Move card to different list
  const moveCardToList = async (
    activeCard: Card,
    sourceListIndex: number,
    destinationListIndex: number
  ) => {
    if (sourceListIndex === destinationListIndex) return;

    const sourceList = board!.lists[sourceListIndex];
    const destinationList = board!.lists[destinationListIndex];

    const newSourceCards = sourceList.cards.filter(
      (card) => card.id !== activeCard.id
    );
    const newDestinationCards = [
      ...destinationList.cards,
      {
        ...activeCard,
        listId: destinationList.id,
        order: destinationList.cards.length,
      },
    ];

    const newLists = [...board!.lists];
    newLists[sourceListIndex] = {
      ...sourceList,
      cards: newSourceCards,
    };
    newLists[destinationListIndex] = {
      ...destinationList,
      cards: newDestinationCards,
    };

    setBoard({
      ...board!,
      lists: newLists,
    });

    // Update in database
    try {
      await axios.put(`/api/cards/${activeCard.id}`, {
        listId: destinationList.id,
        order: destinationList.cards.length,
      });
      toast.success("Card moved");
    } catch (error) {
      toast.error("Failed to move card");
      fetchBoard();
    }
  };

  // Move card to specific position
  const moveCardToPosition = async (
    activeCard: Card,
    sourceListIndex: number,
    destinationListIndex: number,
    overCardIndex: number
  ) => {
    const sourceList = board!.lists[sourceListIndex];
    const destinationList = board!.lists[destinationListIndex];

    if (sourceListIndex === destinationListIndex) {
      // Reorder within same list
      const cards = [...destinationList.cards];
      const oldIndex = cards.findIndex((card) => card.id === activeCard.id);

      if (oldIndex !== overCardIndex) {
        const newCards = arrayMove(cards, oldIndex, overCardIndex);

        const newLists = [...board!.lists];
        newLists[destinationListIndex] = {
          ...destinationList,
          cards: newCards.map((card, index) => ({
            ...card,
            order: index,
          })),
        };

        setBoard({
          ...board!,
          lists: newLists,
        });

        // Update in database
        try {
          await axios.put(`/api/cards/${activeCard.id}`, {
            order: overCardIndex,
          });
        } catch (error) {
          toast.error("Failed to reorder card");
          fetchBoard();
        }
      }
    } else {
      // Move to different list
      const sourceCards = [...sourceList.cards];
      const oldIndex = sourceCards.findIndex(
        (card) => card.id === activeCard.id
      );
      sourceCards.splice(oldIndex, 1);

      const destinationCards = [...destinationList.cards];
      destinationCards.splice(overCardIndex, 0, {
        ...activeCard,
        listId: destinationList.id,
      });

      const newLists = [...board!.lists];
      newLists[sourceListIndex] = {
        ...sourceList,
        cards: sourceCards.map((card, index) => ({
          ...card,
          order: index,
        })),
      };
      newLists[destinationListIndex] = {
        ...destinationList,
        cards: destinationCards.map((card, index) => ({
          ...card,
          order: index,
        })),
      };

      setBoard({
        ...board!,
        lists: newLists,
      });

      // Update in database
      try {
        await axios.put(`/api/cards/${activeCard.id}`, {
          listId: destinationList.id,
          order: overCardIndex,
        });
        toast.success("Card moved");
      } catch (error) {
        toast.error("Failed to move card");
        fetchBoard();
      }
    }
  };

  // Loading state
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

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Board not found</h1>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
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

      {/* Lists with DND */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {/* Existing Lists - غیر sortable */}
            {board.lists.map((list) => (
              <List
                key={list.id}
                list={list}
                onDelete={() => deleteList(list.id)}
                onCreateCard={(cardData) => createCard(list.id, cardData)}
                onDeleteCard={(cardId) => deleteCard(cardId, list.id)}
                onUpdateCard={(cardId, updates) => updateCard(cardId, updates)}
              />
            ))}

            {/* Add List Form */}
            <div className="shrink-0 w-80">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <input
                  type="text"
                  value={newList}
                  onChange={(e) => setNewList(e.target.value)}
                  placeholder="Enter list title..."
                  className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === "Enter" && createList()}
                />
                <div className="flex gap-2">
                  <Button onClick={createList} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Add List
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setNewList("")}
                    className="px-4"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Drag Overlay - فقط برای کارت‌ها */}
        <DragOverlay>
          {activeId ? (
            <div className="opacity-80 rotate-3">
              <div className="w-64 bg-white dark:bg-gray-800 rounded shadow-lg p-3 border-2 border-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">Dragging card...</h4>
                  </div>
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
