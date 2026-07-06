import api from "./client";
import type { ApiResponse } from "@/types";

export const ANNOUNCEMENT_TYPES = [
  "Information",
  "Tournament",
  "Match",
  "Warning",
  "Urgent",
] as const;
export const ANNOUNCEMENT_PRIORITIES = [
  "Low",
  "Normal",
  "High",
  "Critical",
] as const;
export const TARGET_TYPES = [
  "AllUsers",
  "Tournament",
  "Match",
  "User",
] as const;

export type AnnouncementType = (typeof ANNOUNCEMENT_TYPES)[number];
export type AnnouncementPriority = (typeof ANNOUNCEMENT_PRIORITIES)[number];
export type TargetType = (typeof TARGET_TYPES)[number];

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  isRead: boolean;
  createdAt: string;
  expireAt: string | null;
}

export interface CreateAnnouncementPayload {
  title: string;
  message: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  targetType: TargetType;
  tournamentId?: string | null;
  matchId?: string | null;
  userIds?: string[] | null;
  expireAt?: string | null;
}

export const announcementsApi = {
  getAll: () => api.get<ApiResponse<Announcement[]>>("/announcements"),

  create: (payload: CreateAnnouncementPayload) =>
    api.post<ApiResponse<Announcement>>("/admin/announcements", payload),

  markAsRead: (id: string) =>
    api.put<ApiResponse<boolean>>(`/announcements/${id}/read`),
};
