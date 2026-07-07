import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { conversationApi, type ConversationMessage } from "@/api/conversation";
import { usersApi } from "@/api/users";
import { formatDate } from "@/utils";
import PageLayout from "@/components/common/PageLayout";
import {
  Send,
  MessageCircle,
  Search,
  Users,
  Loader2,
  ChevronRight,
  Shield,
} from "lucide-react";
import { cn } from "@/utils";
import { joinConversation, leaveConversation } from "@/lib/signalr";

// ─── Time display ─────────────────────────────────────────────────────────────
function timeLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  return formatDate(dateStr);
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({
  message,
  isOwn,
}: {
  message: ConversationMessage;
  isOwn: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 max-w-[70%]",
        isOwn ? "self-end items-end" : "self-start items-start",
      )}
    >
      {!isOwn && (
        <span className="text-xs text-gray-400 dark:text-gray-500 px-1">
          {message.senderName}
        </span>
      )}
      <div
        className={cn(
          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words",
          isOwn
            ? "bg-brand-600 text-white rounded-tr-sm"
            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-sm shadow-sm",
        )}
      >
        {message.message}
        {message.isEdited && (
          <span
            className={cn(
              "text-[10px] ml-1.5",
              isOwn ? "text-brand-200" : "text-gray-400",
            )}
          >
            (edited)
          </span>
        )}
      </div>
      <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1">
        {timeLabel(message.sentAt)}
      </span>
    </div>
  );
}

// ─── Message input ────────────────────────────────────────────────────────────
function MessageInput({
  onSend,
  isLoading,
  disabled = false,
}: {
  onSend: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setText("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex items-center gap-2 p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <input
        ref={inputRef}
        type="text"
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder={disabled ? "Loading conversation..." : "Type a message..."}
        className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder:text-gray-400 dark:placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || isLoading || disabled}
        className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
      >
        {isLoading ? (
          <Loader2 size={16} className="text-white animate-spin" />
        ) : (
          <Send size={16} className="text-white" />
        )}
      </button>
    </div>
  );
}

// ─── Chat window — shared for both admin and user ─────────────────────────────
function ChatWindow({
  conversationId,
  currentUserId,
  recipientName,
}: {
  conversationId: string;
  currentUserId: string;
  recipientName: string;
}) {
  const qc = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () =>
      conversationApi
        .getMessages(conversationId)
        .then((r) => r.data.data ?? []),
    enabled: !!conversationId,
    staleTime: Infinity, // SignalR handles updates — no polling
  });

  // Mark as read on open
  useEffect(() => {
    if (conversationId) {
      conversationApi.markAsRead(conversationId).catch(() => {});
    }
  }, [conversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: (text: string) =>
      conversationApi.sendMessage(conversationId, text),
    onSuccess: ({ data }) => {
      if (data.data) {
        qc.setQueryData<ConversationMessage[]>(
          ["messages", conversationId],
          (old = []) => {
            if (old.some((m) => m.id === data.data.id)) return old;
            return [...old, data.data];
          },
        );
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 bg-gray-50 dark:bg-gray-950">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center mb-3 shadow-sm">
              <MessageCircle
                size={24}
                className="text-gray-300 dark:text-gray-600"
              />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              No messages yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Say hi to {recipientName}!
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isOwn={m.senderId === currentUserId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput
        onSend={(text) => sendMutation.mutate(text)}
        isLoading={sendMutation.isPending}
      />
    </div>
  );
}

// ─── Admin: user list item ────────────────────────────────────────────────────
function UserListItem({
  user,
  isSelected,
  onClick,
}: {
  user: { id: string; fullName: string; email: string; role: string };
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 transition-all text-left border-b border-gray-50 dark:border-gray-800 last:border-0",
        isSelected
          ? "bg-brand-50 dark:bg-brand-950 border-r-2 border-r-brand-600"
          : "hover:bg-gray-50 dark:hover:bg-gray-800",
      )}
    >
      <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 text-sm font-bold shrink-0">
        {user.fullName[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            isSelected
              ? "text-brand-700 dark:text-brand-300"
              : "text-gray-800 dark:text-gray-200",
          )}
        >
          {user.fullName}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
          {user.email}
        </p>
      </div>
      {isSelected && (
        <ChevronRight size={14} className="text-brand-400 shrink-0" />
      )}
    </button>
  );
}

// ─── Admin view ───────────────────────────────────────────────────────────────
function AdminMessagesView({ currentUserId }: { currentUserId: string }) {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    fullName: string;
  } | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const prevConversationId = useRef<string | null>(null);

  const { data: allUsers } = useQuery({
    queryKey: ["users-chat-list"],
    queryFn: () =>
      usersApi
        .getAll({ page: 1, pageSize: 100 })
        .then((r) => r.data.data?.data ?? []),
  });

  const getOrCreateMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      conversationApi.getOrCreate(targetUserId),
    onSuccess: async ({ data }) => {
      const convId = data.data.conversationId;

      // Leave previous conversation group before joining new one
      if (prevConversationId.current && prevConversationId.current !== convId) {
        try {
          await leaveConversation(prevConversationId.current);
        } catch {}
      }

      setConversationId(convId);
      prevConversationId.current = convId;

      // JOIN immediately so admin receives messages in real time
      try {
        await joinConversation(convId);
      } catch (err) {
        console.error("Failed to join conversation group:", err);
      }
    },
  });

  const handleSelectUser = (u: { id: string; fullName: string }) => {
    if (selectedUser?.id === u.id) return;
    setSelectedUser(u);
    setConversationId(null);
    getOrCreateMutation.mutate(u.id);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prevConversationId.current) {
        leaveConversation(prevConversationId.current).catch(console.error);
      }
    };
  }, []);

  const filteredUsers = (allUsers ?? []).filter((u) => {
    if (u.id === currentUserId) return false;
    if (!search) return true;
    return (
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden flex"
      style={{ height: "calc(100vh - 200px)" }}
    >
      {/* Left — user list */}
      <div className="w-72 border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0">
        <div className="p-3 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-400 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Users
                size={24}
                className="text-gray-300 dark:text-gray-600 mb-2"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {search ? "No users found" : "No users available"}
              </p>
            </div>
          ) : (
            filteredUsers.map((u) => (
              <UserListItem
                key={u.id}
                user={u}
                isSelected={selectedUser?.id === u.id}
                onClick={() =>
                  handleSelectUser({ id: u.id, fullName: u.fullName })
                }
              />
            ))
          )}
        </div>
      </div>

      {/* Right — chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
              <MessageCircle
                size={28}
                className="text-gray-300 dark:text-gray-600"
              />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Select a user to message
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Choose from the list on the left
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900">
              <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 text-sm font-bold shrink-0">
                {selectedUser.fullName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {selectedUser.fullName}
                </p>
              </div>
            </div>

            {getOrCreateMutation.isPending || !conversationId ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-brand-500" />
              </div>
            ) : (
              <ChatWindow
                conversationId={conversationId}
                currentUserId={currentUserId}
                recipientName={selectedUser.fullName}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── User view — chat with admin ──────────────────────────────────────────────
function UserMessagesView({ currentUserId }: { currentUserId: string }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [adminName, setAdminName] = useState("Admin");

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["users-chat-list"],
    queryFn: () =>
      usersApi
        .getAll({ page: 1, pageSize: 100 })
        .then((r) => r.data.data?.data ?? []),
  });

  const getOrCreateMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      conversationApi.getOrCreate(targetUserId),
    onSuccess: async ({ data }) => {
      const convId = data.data.conversationId;
      setConversationId(convId);
      // JOIN SignalR group immediately after getting conversationId
      // so user receives messages even before opening chat
      try {
        await joinConversation(convId);
      } catch (err) {
        console.error("Failed to join conversation group:", err);
      }
    },
  });

  useEffect(() => {
    if (!allUsers || allUsers.length === 0) return;
    if (conversationId) return;

    const admin = allUsers.find((u) => u.role === "Admin");
    if (!admin) return;

    setAdminName(admin.fullName);
    getOrCreateMutation.mutate(admin.id);
  }, [allUsers]);

  // Cleanup — leave group when component unmounts
  useEffect(() => {
    return () => {
      if (conversationId) {
        leaveConversation(conversationId).catch(console.error);
      }
    };
  }, [conversationId]);

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden flex flex-col"
      style={{ height: "calc(100vh - 200px)" }}
    >
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
          <Shield size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {adminName}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Tournament Admin
          </p>
        </div>
      </div>

      {usersLoading || getOrCreateMutation.isPending || !conversationId ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-brand-500" />
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Connecting...
            </p>
          </div>
        </div>
      ) : (
        <ChatWindow
          conversationId={conversationId}
          currentUserId={currentUserId}
          recipientName={adminName}
        />
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const { user, isAdmin } = useAuth();

  return (
    <PageLayout
      heading="Messages"
      subtitle={
        isAdmin
          ? "Direct messages with players"
          : "Chat with the tournament admin"
      }
    >
      {isAdmin ? (
        <AdminMessagesView currentUserId={user?.id ?? ""} />
      ) : (
        <UserMessagesView currentUserId={user?.id ?? ""} />
      )}
    </PageLayout>
  );
}
