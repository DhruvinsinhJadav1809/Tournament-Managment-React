import api from './client'
import type {
  ApiResponse,
  PaginatedResponse,
  Tournament,
  TournamentFilters,
  CreateTournamentPayload,
  UpdateTournamentPayload,
} from '@/types'

export const tournamentsApi = {
  getAll: (filters: TournamentFilters) =>
    api.get<ApiResponse<PaginatedResponse<Tournament>>>('/tournaments', { params: filters }),

  getById: (id: string) =>
    api.get<ApiResponse<Tournament>>(`/tournaments/${id}`),

  create: (payload: CreateTournamentPayload) =>
    api.post<ApiResponse<Tournament>>('/tournaments', payload),

  update: (id: string, payload: UpdateTournamentPayload) =>
    api.put<ApiResponse<Tournament>>(`/tournaments/${id}`, payload),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/tournaments/${id}`),
}
