import api from "./client";
import type { ApiResponse, AuthUser, LoginPayload } from "@/types";
export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  roleId: string | null;
}
export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<AuthUser>>("/auth/login", payload),
  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<null>>("/Auth/register", payload),
};
