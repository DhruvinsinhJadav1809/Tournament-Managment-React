import api from "./client";
import type { ApiResponse } from "@/types";

export interface GenerateMatchesPayload {
  startDate: string;
  firstMatchTime: string;
  matchDurationMinutes: number;
  matchesPerDay: number;
  breakMinutes: number;
}

export interface Match {
  matchId: string;
  matchNumber: number;
  player1Id: string | null;
  player1Name: string | null;
  player2Id: string | null;
  player2Name: string | null;
  winnerId: string | null;
  status: string;
  matchDate: string | null;
  startTime: string | null;
  endTime: string | null;
  isBye: boolean;
  player1Score: number | null; // ADD
  player2Score: number | null; // ADD
}

export interface Round {
  roundId: string;
  roundNumber: number;
  roundName: string;
  matches: Match[];
}

export interface TournamentBracket {
  tournamentId: string;
  tournamentName: string;
  rounds: Round[];
}
export interface MatchResultPayload {
  player1Score: number;
  player2Score: number;
  winnerId: string;
}
export interface ScheduleMatchPayload {
  matchDate: string;
  startTime: string;
  endTime: string;
}
export const matchesApi = {
  generateMatches: (tournamentId: string, payload: GenerateMatchesPayload) =>
    api.post<ApiResponse<TournamentBracket>>(
      `/TournamentMatches/${tournamentId}/generate-matches`,
      payload,
    ),

  getBracket: (tournamentId: string) =>
    api.get<ApiResponse<TournamentBracket>>(
      `/TournamentMatches/${tournamentId}/matches`,
    ),
  updateMatchResult: (matchId: string, payload: MatchResultPayload) =>
    api.put<ApiResponse<null>>(`/TournamentMatches/${matchId}/result`, payload),
  scheduleMatch: (matchId: string, payload: ScheduleMatchPayload) =>
    api.put<ApiResponse<null>>(
      `/TournamentMatches/${matchId}/schedule`,
      payload,
    ),
};
