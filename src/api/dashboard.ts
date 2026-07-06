import api from "./client";
import type { ApiResponse } from "@/types";

export interface OngoingTournament {
  id: string;
  name: string;
  gameName: string;
  tournamentType: string;
  status: string;
  maxParticipants: number;
  currentParticipants: number;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  startDate: string;
}

export interface TournamentDetail {
  id: string;
  name: string;
  gameId: string;
  gameName: string;
  tournamentType: string;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  statusName: string;
  isActive: boolean;
}

export interface MyTournamentItem {
  tournamentId: string;
  tournamentName: string;
  gameName: string;
  status: string;
  startDate: string;
  endDate: string;
  isGeneratedMatches: boolean;
  isChampion: boolean;
}

export interface MyTournamentsResponse {
  activeTournaments: MyTournamentItem[];
  completedTournaments: MyTournamentItem[];
}
export interface UpcomingMatch {
  matchId: string;
  tournamentId: string;
  tournamentName: string;
  roundName: string;
  opponentName: string;
  status: string;
  matchDate: string | null;
  startTime: string | null;
  endTime: string | null;
}
export const dashboardApi = {
  getOngoingTournaments: () =>
    api.get<ApiResponse<OngoingTournament[]>>("/tournaments/dashboard"),

  getTournamentById: (id: string) =>
    api.get<ApiResponse<TournamentDetail>>(`/tournaments/${id}`),

  joinTournament: (tournamentId: string) =>
    api.post<ApiResponse<null>>(`/Tournaments/${tournamentId}/join`),

  getMyTournaments: () =>
    api.get<ApiResponse<MyTournamentsResponse>>("/tournaments/my-tournaments"),

  getUpcomingMatches: () =>
    api.get<ApiResponse<UpcomingMatch[]>>(
      "/TournamentMatches/upcoming-matches",
    ),
};
