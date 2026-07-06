import api from "./client";
import type { ApiResponse } from "@/types";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "Action" | "Information";
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getAll: () => api.get<ApiResponse<Notification[]>>("/notification"),

  getUnreadCount: () =>
    api.get<ApiResponse<number>>("/notification/unread-count"),

  markAsRead: (id: string) =>
    api.put<ApiResponse<boolean>>(`/notification/${id}/read`),

  markAllAsRead: () => api.put<ApiResponse<boolean>>("/notification/read-all"),
};
