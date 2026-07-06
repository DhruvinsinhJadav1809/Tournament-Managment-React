import * as signalR from "@microsoft/signalr";
import { authStore } from "@/store/authStore";

let connection: signalR.HubConnection | null = null;

export function getAnnouncementConnection(): signalR.HubConnection {
  if (connection) return connection;

  const baseUrl =
    //@ts-ignore
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const hubUrl = baseUrl.replace(/\/api$/, "") + "/hubs/announcements";

  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => authStore.get()?.token ?? "",
      transport: signalR.HttpTransportType.WebSockets,
      skipNegotiation: true, // skip negotiation for WebSockets only
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  return connection;
}
export async function startConnection(): Promise<void> {
  const conn = getAnnouncementConnection();

  if (conn.state === signalR.HubConnectionState.Connected) {
    return;
  }

  if (conn.state === signalR.HubConnectionState.Disconnected) {
    await conn.start();
  }

  while (conn.state === signalR.HubConnectionState.Connecting) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export async function stopConnection(): Promise<void> {
  if (connection?.state === signalR.HubConnectionState.Connected) {
    await connection.stop();
    connection = null;
  }
}
