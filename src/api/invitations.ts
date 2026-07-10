import api from "./client";
import type { ApiResponse } from "@/types";

export interface SendInvitationPayload {
  email: string;
}

export interface InvitationDetail {
  fullName: string;
  email: string;
  expiresAt: string;
}

export interface InvitationListItem {
  id: string;
  fullName: string;
  email: string;
  status: number;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
}

export interface InvitationListResponse {
  items: InvitationListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface RegisterByInvitePayload {
  token: string;
  password: string;
}
export enum InvitationStatus {
  Pending = 1,
  Accepted = 2,
  Expired = 3,
  Cancelled = 4,
}
export const invitationsApi = {
  send: (payload: SendInvitationPayload) =>
    api.post<ApiResponse<boolean>>("/invitation/send", payload),

  getByToken: (token: string) =>
    api.get<ApiResponse<InvitationDetail>>(`/invitation/${token}`),

  registerByInvite: (payload: RegisterByInvitePayload) =>
    api.post<ApiResponse<boolean>>("/invitation/register", payload),

  getAll: (params: { page: number; pageSize: number }) =>
    api.get<ApiResponse<InvitationListResponse>>("/invitation", { params }),
};
