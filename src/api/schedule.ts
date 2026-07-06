import api from "./client";
import type { ApiResponse } from "@/types";

export interface ScheduleMatch {
  matchId: string;
  tournamentId: string;
  tournamentName: string;
  roundName: string;
  opponentName?: string; // user view
  player1Name?: string; // admin view
  player2Name?: string; // admin view
  matchDate: string;
  startTime: string;
  endTime: string | null;
  status?: string;
}

export const scheduleApi = {
  getUserSchedule: () =>
    api.get<ApiResponse<ScheduleMatch[]>>(
      "/TournamentMatches/upcoming-matches",
    ),

  getAdminSchedule: () =>
    api.get<ApiResponse<ScheduleMatch[]>>("/AdminDashboard/upcoming-matches"),
};
