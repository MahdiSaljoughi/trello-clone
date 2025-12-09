// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Board Types
export interface Board {
  id: string;
  title: string;
  description?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  lists?: any;
}

export interface CreateBoardInput {
  title: string;
  description?: string;
  userId: string;
}

export interface UpdateBoardInput {
  title?: string;
  description?: string;
}

// Next.js Route Context Type
export interface RouteContext<T> {
  params: Promise<Record<string, string>>;
}
