import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// src/lib/utils.ts
import { Card, Priority } from "@/types";

export function sortCardsByPriority(cards: Card[]): Card[] {
  const priorityOrder: Record<Priority, number> = {
    URGENT: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };

  return [...cards].sort((a, b) => {
    // اول بر اساس اولویت
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    // اگر اولویت یکسان بود، بر اساس order
    return a.order - b.order;
  });
}
