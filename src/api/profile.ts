import api from "./client";
import type { ApiResponse } from "@/types";

export interface RecentMatch {
  matchId: string;
  opponentName: string;
  tournamentName: string;
  result: "Won" | "Lost" | "Draw";
  score: string;
  matchDate: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  role: string;
  hasProfileImage: boolean;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  championships: number;
  activeTournaments: number;
  completedTournaments: number;
  recentMatches: RecentMatch[];
}

export const profileApi = {
  getMyProfile: () => api.get<ApiResponse<UserProfile>>("/Users/my-profile"),
  uploadProfileImage: (userId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ApiResponse<string>>(
      `/Users/${userId}/upload-profile-image`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },
  getProfileImage: () =>
    api.get("/Users/profile-image", { responseType: "blob" }),
};
