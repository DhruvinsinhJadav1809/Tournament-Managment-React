import api from "./client";
import type { ApiResponse, TournamentStatus } from "@/types";

export const tournamentStatusesApi = {
  getAll: () => api.get<ApiResponse<TournamentStatus[]>>("/tournamentStatuses"),
};
