import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getAnnouncementConnection, startConnection } from "@/lib/signalr";
import type { Announcement } from "@/api/announcements";
import type { OnlineUsersResponse } from "@/api/onlineUsers";
import toast from "react-hot-toast";
import { useAuth } from "./useAuth";

const priorityEmoji: Record<string, string> = {
  Low: "ℹ️",
  Normal: "📢",
  High: "⚠️",
  Critical: "🚨",
};

let listenerRegistered = false;

export function useAnnouncements() {
  const qc = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    const conn = getAnnouncementConnection();

    const handleNewAnnouncement = (announcement: Announcement) => {
      qc.setQueryData<Announcement[]>(["announcements"], (old) => {
        if (!old) {
          qc.invalidateQueries({ queryKey: ["announcements"] });
          return old;
        }
        if (old.some((a) => a.id === announcement.id)) return old;
        return [{ ...announcement, isRead: false }, ...old];
      });

      qc.invalidateQueries({ queryKey: ["notification-count"] });

      const emoji = priorityEmoji[announcement.priority] ?? "📢";
      toast(`${emoji} ${announcement.title}\n${announcement.message}`, {
        duration: 6000,
        style: { maxWidth: "360px", whiteSpace: "pre-line" },
      });
    };

    // ADD — handle online users update from SignalR
    const handleOnlineUsersUpdate = (data: OnlineUsersResponse) => {
      qc.setQueryData<OnlineUsersResponse>(["online-users"], () => ({
        onlineUserCount: data.onlineUserCount,
        users: data.users ?? [],
      }));
    };

    const init = async () => {
      try {
        if (!user?.id) return;

        await startConnection();
        await conn.invoke("JoinUserGroup", user.id);
        setTimeout(() => {
          qc.invalidateQueries({ queryKey: ["online-users"] });
        }, 500);
        if (!listenerRegistered) {
          conn.on("ReceiveAnnouncement", handleNewAnnouncement);
          conn.on("OnlineUsersUpdated", handleOnlineUsersUpdate); // ADD
          listenerRegistered = true;
        }
      } catch (err) {
        console.error("SignalR init error:", err);
      }
    };

    init();

    conn.onreconnected(async () => {
      if (!listenerRegistered) {
        conn.on("ReceiveAnnouncement", handleNewAnnouncement);
        conn.on("OnlineUsersUpdated", handleOnlineUsersUpdate); // ADD
        listenerRegistered = true;
      }
      // Rejoin group after reconnect
      if (user?.id) {
        try {
          await conn.invoke("JoinUserGroup", user.id);
        } catch {}
      }
    });

    conn.onclose(() => {
      listenerRegistered = false;
    });

    return () => {};
  }, [qc, user?.id]);
}
