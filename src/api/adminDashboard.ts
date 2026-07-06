import api from "./client";
import type { ApiResponse } from "@/types";

export interface AdminDashboardStats {
  totalTournaments: number;
  activeTournaments: number;
  completedTournaments: number;
  totalPlayers: number;
  pendingMatches: number;
  completedMatches: number;
}

export interface PendingAction {
  matchId: string;
  tournamentId: string;
  tournamentName: string;
  actionType: "WinnerPending" | "SchedulePending";
  message: string;
  matchDate: string | null;
}

export interface TournamentOverview {
  tournamentId: string;
  tournamentName: string;
  gameName: string;
  participants: number;
  status: string;
  totalMatches: number;
  completedMatches: number;
  progressPercentage: number;
  startDate: string;
  endDate: string;
}

export interface AdminUpcomingMatch {
  matchId: string;
  tournamentId: string;
  tournamentName: string;
  player1Name: string;
  player2Name: string;
  roundNumber: number;
  roundName: string;
  matchDate: string;
  startTime: string;
}

export interface TopPlayer {
  userId: string;
  fullName: string;
  wins: number;
  championships: number;
  winRate: number;
}

export interface RecentActivity {
  activityType: string;
  message: string;
  createdAt: string;
}

export const adminDashboardApi = {
  getStats: () =>
    api.get<ApiResponse<AdminDashboardStats>>("/AdminDashboard/dashboard"),

  getPendingActions: () =>
    api.get<ApiResponse<PendingAction[]>>("/AdminDashboard/pending-actions"),

  getTournamentOverview: () =>
    api.get<ApiResponse<TournamentOverview[]>>(
      "/AdminDashboard/tournament-overview",
    ),

  getUpcomingMatches: () =>
    api.get<ApiResponse<AdminUpcomingMatch[]>>(
      "/AdminDashboard/upcoming-matches",
    ),

  getTopPlayers: () =>
    api.get<ApiResponse<TopPlayer[]>>("/AdminDashboard/top-players"),

  getRecentActivities: () =>
    api.get<ApiResponse<RecentActivity[]>>("/AdminDashboard/recent-activities"),
  exportTournament: (tournamentId: string) =>
    api.get(`/AdminDashboard/${tournamentId}/export`, {
      responseType: "blob",
    }),
};
