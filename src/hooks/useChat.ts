import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getChatConnection, startChatConnection } from "@/lib/signalr";
import type { ConversationMessage } from "@/api/conversation";
import { useAuth } from "./useAuth";
import toast from "react-hot-toast";

let chatListenerRegistered = false;

export function useChat() {
  const qc = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const conn = getChatConnection();

    const handleReceiveMessage = (message: ConversationMessage) => {
      // Update messages cache for this conversation
      qc.setQueryData<ConversationMessage[]>(
        ["messages", message.conversationId],
        (old = []) => {
          if (old.some((m) => m.id === message.id)) return old;
          return [...old, message];
        },
      );

      // Toast only for messages from others
      if (message.senderId !== user.id) {
        toast(`💬 ${message.senderName}\n${message.message}`, {
          duration: 5000,
          style: { maxWidth: "360px", whiteSpace: "pre-line" },
        });
      }
    };

    const registerListeners = () => {
      if (!chatListenerRegistered) {
        conn.on("ReceiveMessage", handleReceiveMessage);
        chatListenerRegistered = true;
      }
    };

    const init = async () => {
      try {
        registerListeners();
        await startChatConnection();
      } catch (err) {
        console.error("Chat SignalR init error:", err);
      }
    };

    conn.onreconnected(() => {
      chatListenerRegistered = false;
      registerListeners();
    });

    conn.onclose(() => {
      chatListenerRegistered = false;
    });

    init();

    return () => {
      // Don't stop connection on unmount — keep alive for toast notifications
    };
  }, [qc, user?.id]);
}
