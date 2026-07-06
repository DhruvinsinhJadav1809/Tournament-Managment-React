import api from './client'
import type {
  ApiResponse,
  PaginatedResponse,
  Game,
  GameFilters,
  CreateGamePayload,
  UpdateGamePayload,
} from '@/types'

export const gamesApi = {
  getAll: (filters: GameFilters) =>
    api.get<ApiResponse<PaginatedResponse<Game>>>('/games', { params: filters }),

  getAllNoPagination: () =>
    api.get<ApiResponse<Game[]>>('/games/all'),

  getById: (id: string) =>
    api.get<ApiResponse<Game>>(`/games/${id}`),

  create: (payload: CreateGamePayload) =>
    api.post<ApiResponse<Game>>('/games', payload),

  update: (id: string, payload: UpdateGamePayload) =>
    api.put<ApiResponse<Game>>(`/games/${id}`, payload),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/games/${id}`),
}
