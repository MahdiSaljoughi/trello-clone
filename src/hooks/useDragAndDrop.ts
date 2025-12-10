// src/hooks/useDragAndDrop.ts (آپدیت شده)
import { DragEndEvent } from "@dnd-kit/core";
import { Card } from "@/types";
import { moveCard } from "@/lib/api";

interface UseDragAndDropProps {
  lists: any[];
  onMoveSuccess: () => void;
}

export function useDragAndDrop({ lists, onMoveSuccess }: UseDragAndDropProps) {
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // پیدا کردن کارت و لیست مبدا
    let sourceListId = "";
    let sourceCard: Card | undefined;
    let sourceIndex = -1;

    for (const list of lists) {
      const cardIndex = list.cards.findIndex((c: Card) => c.id === activeId);
      if (cardIndex !== -1) {
        sourceListId = list.id;
        sourceCard = list.cards[cardIndex];
        sourceIndex = cardIndex;
        break;
      }
    }

    if (!sourceCard) return;

    // بررسی اینکه over یک لیست هست یا کارت
    const isOverList = overId.startsWith("list-");

    if (isOverList) {
      // درگ روی لیست - انتقال به لیست جدید
      const targetListId = overId.replace("list-", "");

      const targetList = lists.find((list) => list.id === targetListId);
      const newOrder = targetList ? targetList.cards.length : 0;

      try {
        await moveCard(activeId, targetListId, newOrder);
        onMoveSuccess();
      } catch (error) {
        console.error("Failed to move card to list:", error);
      }
    } else {
      // درگ روی کارت دیگر
      let targetListId = sourceListId;
      let targetIndex = -1;

      // پیدا کردن لیست و اندیس مقصد
      for (const list of lists) {
        const cardIndex = list.cards.findIndex((c: Card) => c.id === overId);
        if (cardIndex !== -1) {
          targetListId = list.id;
          targetIndex = cardIndex;
          break;
        }
      }

      if (targetIndex === -1) return;

      const targetList = lists.find((list) => list.id === targetListId);
      let newOrder = targetIndex;

      // منطق محاسبه order
      if (sourceListId === targetListId) {
        // در همان لیست
        if (sourceIndex < targetIndex) {
          // به پایین حرکت کرده
          newOrder = targetIndex;
        } else {
          // به بالا حرکت کرده
          newOrder = targetIndex;
        }
      } else {
        // به لیست دیگر منتقل شده
        newOrder = targetIndex + 1;
      }

      try {
        await moveCard(activeId, targetListId, newOrder);
        onMoveSuccess();
      } catch (error) {
        console.error("Failed to move card:", error);
      }
    }
  };

  return { handleDragEnd };
}
