// src/types/index.ts
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Board {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  lists: List[];
}

export interface List {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  boardId: string;
  cards: Card[];
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  order: number;
  priority: Priority;
  dueDate?: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  listId: string;
  cardItems: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  priority: Priority;
  isCompleted: boolean;
  order: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  cardId: string;
}
