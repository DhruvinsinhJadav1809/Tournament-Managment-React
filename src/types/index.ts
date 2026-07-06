// ─── API Response Wrapper ───────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

// ─── Pagination ──────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  data: T[];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole = "Admin" | "User";

export interface AuthUser {
  token: string;
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Games ───────────────────────────────────────────────────────────────────
export interface Game {
  id: string;
  name: string;
  participantsPerMatch: number;
  isActive: boolean;
  createdAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdByUserId: string;
  updatedByUserId: string;
  updatedAt: string;
}

export interface GameFilters {
  page: number;
  pageSize: number;
  search?: string;
  participantsPerMatch?: number;
  isActive?: boolean | "";
}

export interface CreateGamePayload {
  name: string;
  participantsPerMatch: number;
  isActive: boolean;
}

export interface UpdateGamePayload extends CreateGamePayload {}

// ─── Tournaments ─────────────────────────────────────────────────────────────
export interface Tournament {
  id: string;
  name: string;
  gameId: string;
  gameName: string;
  tournamentType: string;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  statusId: string;
  statusName: string;
  isActive: boolean;
  registrationEndDate: string;
  registrationStartDate: string;
  participantsPerEntry: number;
  currentParticipants: number; // ADD
  isGeneratedMatches: boolean;
}

export interface TournamentFilters {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean | "";
  startDate?: string;
  endDate?: string;
  gameId?: string;
  status?: string;
}

export interface CreateTournamentPayload {
  name: string;
  gameId: string;
  tournamentType: string;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  registrationEndDate: string;
  registrationStartDate: string;
  isActive: boolean;
  participantsPerEntry: number;
}

export interface UpdateTournamentPayload extends CreateTournamentPayload {}

// ─── Users ───────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  isActive: boolean;
}

// ─── Status ───────────────────────────────────────────────────────────────────
export interface TournamentStatus {
  id: string;
  name: string;
}
