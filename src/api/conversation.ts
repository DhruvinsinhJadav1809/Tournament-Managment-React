import api from "./client";
import type { ApiResponse } from "@/types";

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  message: string;
  sentAt: string;
  isEdited: boolean;
}

export interface ConversationResponse {
  conversationId: string;
  isNewConversation: boolean;
}

export const conversationApi = {
  getOrCreate: (targetUserId: string) =>
    api.post<ApiResponse<ConversationResponse>>("/conversation/get-or-create", {
      targetUserId,
    }),

  sendMessage: (conversationId: string, message: string) =>
    api.post<ApiResponse<ConversationMessage>>("/conversation/send-message", {
      conversationId,
      message,
    }),

  getMessages: (conversationId: string) =>
    api.get<ApiResponse<ConversationMessage[]>>(
      `/conversation/${conversationId}/messages`,
    ),

  markAsRead: (conversationId: string) =>
    api.put<ApiResponse<null>>("/conversation/mark-as-read", {
      conversationId,
    }),
};
