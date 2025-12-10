// src/lib/api.ts
import axios from "axios";
import { Board, Card, ChecklistItem, Priority } from "@/types";
import { List } from "@/generated/prisma/browser";
import { CardLabel, Label } from "@/generated/prisma/client";

const api = axios.create({
  baseURL: "/api",
});

// Board APIs
export const fetchBoards = () =>
  api.get<Board[]>("/boards").then((res) => res.data);
export const fetchBoard = (id: string) =>
  api.get<Board>(`/boards/${id}`).then((res) => res.data);
export const createBoard = (data: { title: string; description?: string }) =>
  api.post<Board>("/boards", data).then((res) => res.data);

export const moveCard = (id: string, targetListId: string, newOrder: number) =>
  api
    .put<Card>(`/cards/${id}/move`, { targetListId, newOrder })
    .then((res) => res.data);

// Checklist APIs
export const createChecklistItem = (
  cardId: string,
  data: Partial<ChecklistItem>
) =>
  api
    .post<ChecklistItem>(`/cards/${cardId}/checklist-items`, data)
    .then((res) => res.data);
export const updateChecklistItem = (id: string, data: Partial<ChecklistItem>) =>
  api
    .put<ChecklistItem>(`/checklist-items/${id}`, data)
    .then((res) => res.data);
export const deleteChecklistItem = (id: string) =>
  api.delete(`/checklist-items/${id}`);

// src/lib/api.ts
// اضافه کردن توابع جدید
export const updateBoard = (
  id: string,
  data: { title: string; description?: string }
) => api.put<Board>(`/boards/${id}`, data).then((res) => res.data);

export const deleteBoard = (id: string) =>
  api.delete(`/boards/${id}`).then((res) => res.data);

// src/lib/api.ts
// اضافه کردن توابع جدید
// src/lib/api.ts
export const updateList = (
  id: string,
  data: { title: string; description?: string }
) => api.put<List>(`/lists/${id}`, data).then((res) => res.data);

// src/lib/api.ts
export const createCard = (
  listId: string,
  data: {
    title: string;
    description?: string;
    priority?: Priority;
    dueDate?: Date;
  }
) => api.post<Card>(`/lists/${listId}/cards`, data).then((res) => res.data);

// src/lib/api.ts
// اضافه کردن توابع جدید
export const fetchCard = (id: string) =>
  api.get<Card>(`/cards/${id}`).then((res) => res.data);

export const updateCard = (id: string, data: Partial<Card>) =>
  api.put<Card>(`/cards/${id}`, data).then((res) => res.data);

export const deleteCard = (id: string) =>
  api.delete(`/cards/${id}`).then((res) => res.data);

// src/lib/api.ts
// Labels API
export const fetchBoardLabels = (boardId: string) =>
  api.get<Label[]>(`/boards/${boardId}/labels`).then((res) => res.data);

export const createLabel = (
  boardId: string,
  data: { name: string; color: string }
) => api.post<Label>(`/boards/${boardId}/labels`, data).then((res) => res.data);

export const deleteLabel = (id: string) => api.delete(`/labels/${id}`);

// Card Labels API
export const fetchCardLabels = (cardId: string) =>
  api.get<CardLabel[]>(`/cards/${cardId}/labels`).then((res) => res.data);

export const addLabelToCard = (cardId: string, labelId: string) =>
  api
    .post<CardLabel>(`/cards/${cardId}/labels`, { labelId })
    .then((res) => res.data);

export const removeLabelFromCard = (cardId: string, labelId: string) =>
  api.delete(`/cards/${cardId}/labels/${labelId}`);
