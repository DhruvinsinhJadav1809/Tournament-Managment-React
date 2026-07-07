import * as signalR from "@microsoft/signalr";
import { authStore } from "@/store/authStore";

// ─── Announcement Hub ─────────────────────────────────────────────────────────
let announcementConnection: signalR.HubConnection | null = null;
let announcementConnectionPromise: Promise<void> | null = null;

export function getAnnouncementConnection(): signalR.HubConnection {
  if (announcementConnection) return announcementConnection;

  const baseUrl =
    //@ts-ignore
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const hubUrl = baseUrl.replace(/\/api$/, "") + "/hubs/announcements";

  announcementConnection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => authStore.get()?.token ?? "",
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  return announcementConnection;
}

export async function startConnection(): Promise<void> {
  const conn = getAnnouncementConnection();
  if (conn.state === signalR.HubConnectionState.Connected) return;
  if (announcementConnectionPromise) return announcementConnectionPromise;

  if (conn.state === signalR.HubConnectionState.Disconnected) {
    announcementConnectionPromise = conn
      .start()
      .then(() => {
        announcementConnectionPromise = null;
      })
      .catch((err) => {
        announcementConnectionPromise = null;
        throw err;
      });
    return announcementConnectionPromise;
  }
}

export async function stopAnnouncementConnection(): Promise<void> {
  if (announcementConnection?.state === signalR.HubConnectionState.Connected) {
    await announcementConnection.stop();
  }
  announcementConnection = null;
  announcementConnectionPromise = null;
}

// ─── Chat Hub ─────────────────────────────────────────────────────────────────
let chatConnection: signalR.HubConnection | null = null;
let chatConnectionPromise: Promise<void> | null = null;

export function getChatConnection(): signalR.HubConnection {
  if (chatConnection) return chatConnection;

  const baseUrl =
    //@ts-ignore
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const hubUrl = baseUrl.replace(/\/api$/, "") + "/hubs/chat";

  chatConnection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => authStore.get()?.token ?? "",
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  return chatConnection;
}

export async function startChatConnection(): Promise<void> {
  const conn = getChatConnection();
  if (conn.state === signalR.HubConnectionState.Connected) return;
  if (chatConnectionPromise) return chatConnectionPromise;

  if (conn.state === signalR.HubConnectionState.Disconnected) {
    chatConnectionPromise = conn
      .start()
      .then(() => {
        chatConnectionPromise = null;
      })
      .catch((err) => {
        chatConnectionPromise = null;
        throw err;
      });
    return chatConnectionPromise;
  }
}

export async function stopChatConnection(): Promise<void> {
  if (chatConnection?.state === signalR.HubConnectionState.Connected) {
    await chatConnection.stop();
  }
  chatConnection = null;
  chatConnectionPromise = null;
}

export async function joinConversation(conversationId: string): Promise<void> {
  const conn = getChatConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    await conn.invoke("JoinConversation", conversationId);
  }
}

export async function leaveConversation(conversationId: string): Promise<void> {
  const conn = getChatConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    await conn.invoke("LeaveConversation", conversationId);
  }
}
