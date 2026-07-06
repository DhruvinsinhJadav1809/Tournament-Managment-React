import api from "./client";
import type { ApiResponse } from "@/types";

export interface TournamentParticipant {
  userId: string;
  fullName: string;
  email: string;
  joinedAt: string;
}

export interface TournamentParticipantsResponse {
  tournamentId: string;
  tournamentName: string;
  maxParticipants: number;
  currentParticipants: number;
  participants: TournamentParticipant[];
}

export const tournamentParticipantsApi = {
  getParticipants: (tournamentId: string) =>
    api.get<ApiResponse<TournamentParticipantsResponse>>(
      `/Tournaments/${tournamentId}/participants`,
    ),
};
