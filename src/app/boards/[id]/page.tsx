"use client";

import { useState, useEffect } from "react";
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
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableList } from "@/components/SortableList";

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
  listId: string;
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

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !board) return;

    setActiveId(null);

    // If dragging a list
    if (active.data.current?.type === "list") {
      const oldIndex = board.lists.findIndex((list) => list.id === active.id);
      const newIndex = board.lists.findIndex((list) => list.id === over.id);

      if (oldIndex !== newIndex) {
        const newLists = arrayMove(board.lists, oldIndex, newIndex);

        // Update local state
        setBoard({
          ...board,
          lists: newLists.map((list, index) => ({
            ...list,
            order: index,
          })),
        });

        // Update in database
        try {
          await axios.put(`/api/lists/${active.id}`, {
            order: newIndex,
          });
        } catch (error) {
          toast.error("Failed to update list order");
          fetchBoard(); // Revert changes
        }
      }
    }

    // If dragging a card
    if (active.data.current?.type === "card") {
      const activeCard = active.data.current.card as Card;
      const overId = over.id as string;

      // Find source and destination lists
      const sourceListIndex = board.lists.findIndex(
        (list) => list.id === activeCard.listId
      );

      // Check if card is dropped on a list or another card
      const isOverList = board.lists.some((list) => list.id === overId);
      const isOverCard = board.lists.some((list) =>
        list.cards.some((card) => card.id === overId)
      );

      if (isOverList) {
        // Card dropped on a list
        const destinationListIndex = board.lists.findIndex(
          (list) => list.id === overId
        );

        if (sourceListIndex !== destinationListIndex) {
          // Move card to different list
          const sourceList = board.lists[sourceListIndex];
          const destinationList = board.lists[destinationListIndex];

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

          const newLists = [...board.lists];
          newLists[sourceListIndex] = {
            ...sourceList,
            cards: newSourceCards,
          };
          newLists[destinationListIndex] = {
            ...destinationList,
            cards: newDestinationCards,
          };

          setBoard({
            ...board,
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
        }
      } else if (isOverCard) {
        // Card dropped on another card
        const overCardId = overId;
        let destinationListIndex = -1;
        let overCardIndex = -1;

        // Find which list contains the over card
        board.lists.forEach((list, index) => {
          const cardIndex = list.cards.findIndex(
            (card) => card.id === overCardId
          );
          if (cardIndex !== -1) {
            destinationListIndex = index;
            overCardIndex = cardIndex;
          }
        });

        if (destinationListIndex !== -1) {
          const destinationList = board.lists[destinationListIndex];

          if (sourceListIndex === destinationListIndex) {
            // Reorder within same list
            const cards = [...destinationList.cards];
            const oldIndex = cards.findIndex(
              (card) => card.id === activeCard.id
            );

            if (oldIndex !== overCardIndex) {
              const newCards = arrayMove(cards, oldIndex, overCardIndex);

              const newLists = [...board.lists];
              newLists[destinationListIndex] = {
                ...destinationList,
                cards: newCards.map((card, index) => ({
                  ...card,
                  order: index,
                })),
              };

              setBoard({
                ...board,
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
            // Move to different list at specific position
            const sourceList = board.lists[sourceListIndex];
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

            const newLists = [...board.lists];
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
              ...board,
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
        }
      }
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
      <div>
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

      {/* Lists with DND */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="mx-auto">
          <div className="flex gap-4 overflow-x-auto pb-4">
            <SortableContext
              items={board.lists.map((list) => list.id)}
              strategy={horizontalListSortingStrategy}
            >
              {/* Existing Lists */}
              {board.lists.map((list) => (
                <SortableList
                  key={list.id}
                  list={list}
                  onDelete={deleteList}
                  onCreateCard={() => createCard(list.id)}
                  onDeleteCard={(cardId) => deleteCard(cardId, list.id)}
                />
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
            </SortableContext>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="opacity-80 rotate-3">
              {activeId.startsWith("list-") ? (
                <div className="w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Dragging list...</h3>
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ) : (
                <div className="w-64 bg-white dark:bg-gray-800 rounded shadow-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Dragging card...</h4>
                    </div>
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
