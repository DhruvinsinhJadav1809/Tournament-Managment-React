import api from "./client";
import type { ApiResponse } from "@/types";

export interface OnlineUser {
  userId: string;
  userName: string;
}

export interface OnlineUsersResponse {
  onlineUserCount: number;
  users: OnlineUser[];
}

export const onlineUsersApi = {
  getOnlineUsers: () =>
    api.get<ApiResponse<OnlineUsersResponse>>("/online-users"),
};
