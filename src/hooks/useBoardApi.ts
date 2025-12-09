import { useState, useCallback } from "react";
import axios from "axios";
import { ApiResponse } from "@/types/api-types";

interface UseBoardApiReturn {
  loading: boolean;
  error: string | null;
  fetchBoards: (params?: {
    page?: number;
    limit?: number;
    userId?: string;
  }) => Promise<any>;
  fetchBoard: (id: string) => Promise<any>;
  createBoard: (data: {
    title: string;
    description?: string;
    userId: string;
  }) => Promise<any>;
  updateBoard: (
    id: string,
    data: { title?: string; description?: string }
  ) => Promise<any>;
  deleteBoard: (id: string) => Promise<any>;
  fetchUserBoards: (
    userId: string,
    params?: { page?: number; limit?: number }
  ) => Promise<any>;
}

export function useBoardApi(): UseBoardApiReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiCall = useCallback(
    async <T>(apiCall: () => Promise<T>): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall();
        return response;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || err.message || "An error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchBoards = useCallback(
    async (params?: { page?: number; limit?: number; userId?: string }) => {
      return handleApiCall(async () => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.userId) queryParams.append("userId", params.userId);

        const response = await axios.get<ApiResponse>(
          `/api/boards?${queryParams}`
        );
        return response.data;
      });
    },
    [handleApiCall]
  );

  const fetchBoard = useCallback(
    async (id: string) => {
      return handleApiCall(async () => {
        const response = await axios.get<ApiResponse>(`/api/boards/${id}`);
        return response.data;
      });
    },
    [handleApiCall]
  );

  const createBoard = useCallback(
    async (data: { title: string; description?: string; userId: string }) => {
      return handleApiCall(async () => {
        const response = await axios.post<ApiResponse>("/api/boards", data);
        return response.data;
      });
    },
    [handleApiCall]
  );

  const updateBoard = useCallback(
    async (id: string, data: { title?: string; description?: string }) => {
      return handleApiCall(async () => {
        const response = await axios.patch<ApiResponse>(
          `/api/boards/${id}`,
          data
        );
        return response.data;
      });
    },
    [handleApiCall]
  );

  const deleteBoard = useCallback(
    async (id: string) => {
      return handleApiCall(async () => {
        const response = await axios.delete<ApiResponse>(`/api/boards/${id}`);
        return response.data;
      });
    },
    [handleApiCall]
  );

  const fetchUserBoards = useCallback(
    async (userId: string, params?: { page?: number; limit?: number }) => {
      return handleApiCall(async () => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());

        const response = await axios.get<ApiResponse>(
          `/api/boards/user/${userId}?${queryParams}`
        );
        return response.data;
      });
    },
    [handleApiCall]
  );

  return {
    loading,
    error,
    fetchBoards,
    fetchBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    fetchUserBoards,
  };
}
