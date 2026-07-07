import api from "./client";
import type { ApiResponse, PaginatedResponse, User } from "@/types";

export const usersApi = {
  getAll: (params: { page: number; pageSize: number; search?: string }) =>
    api.get<ApiResponse<PaginatedResponse<User>>>("/users", { params }),
  getProfileImage: () =>
    api.get<Blob>("/Users/profile-image", {
      responseType: "blob",
    }),
  getAllForChat: () =>
    api.get<ApiResponse<PaginatedResponse<User>>>("/users", {
      params: { page: 1, pageSize: 100 },
    }),
};
