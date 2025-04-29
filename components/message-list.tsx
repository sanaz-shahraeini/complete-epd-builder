"use client";

import { useEffect, useState } from "react";
import { Avatar } from "./ui/avatar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { useUserStore } from "@/lib/store/user";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Message {
  id: number;
  sender: number;
  sender_name: string;
  recipient: number;
  recipient_name: string;
  subject: string;
  content: string;
  status: "unread" | "read" | "archived";
  created_at: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Message[];
}

// Define props interface for MessageList component
interface MessageListProps {
  onSelectMessage?: (message: Message) => void;
}

export function MessageList({ onSelectMessage }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient: "",
    subject: "",
    content: "",
  });
  const user = useUserStore((state) => state.user);
  const { setShowSignInModal } = useUserStore((state: any) => ({ 
    setShowSignInModal: state.setShowSignInModal 
  }));
  const { data: session, status } = useSession();
  const router = useRouter();

  // Add state to prevent duplicate API calls
  const [isInitialFetchDone, setIsInitialFetchDone] = useState(false);

  useEffect(() => {
    // Only fetch messages when authenticated and initial fetch not done yet
    if (status === "unauthenticated") {
      // Show sign-in modal instead of redirecting
      setShowSignInModal(true);
    } else if (status === "authenticated" && !isInitialFetchDone) {
      fetchMessages();
      setIsInitialFetchDone(true);
    }
  }, [status, router, isInitialFetchDone, setShowSignInModal]);

  const fetchMessages = async (url?: string) => {
    // Prevent concurrent fetches
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      console.log("Fetching messages from:", url || "/api/messages");

      const response = await fetch(url || "/api/messages", {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Show sign-in modal instead of redirecting
          setShowSignInModal(true);
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        console.error("Response not ok:", response.status, errorData);
        throw new Error(
          `Failed to fetch messages: ${response.status} ${response.statusText}`
        );
      }

      const data: PaginatedResponse = await response.json();
      console.log("Received data:", data);

      if (!data || typeof data !== "object" || !Array.isArray(data.results)) {
        console.error("Invalid response format:", data);
        throw new Error("Invalid response format");
      }

      setMessages((prevMessages) =>
        url ? [...prevMessages, ...data.results] : data.results
      );
      setNextPage(data.next);
      setHasMore(!!data.next);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load messages"
      );
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          recipient: parseInt(newMessage.recipient),
          subject: newMessage.subject,
          content: newMessage.content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();
      setMessages((prev) => [data, ...prev]);
      setIsComposeOpen(false);
      setNewMessage({ recipient: "", subject: "", content: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      setError(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  };

  const loadMore = () => {
    if (nextPage && !loading) {
      fetchMessages(nextPage);
    }
  };

  const filteredMessages = messages.filter(
    (message) =>
      message?.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message?.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMessageClick = async (messageId: number) => {
    // Prevent duplicate clicks on the same message
    if (selectedMessage === messageId) return;

    setSelectedMessage(messageId);

    // Find the selected message object
    const messageObj = messages.find((msg) => msg.id === messageId);

    // If we have a callback from the parent, pass the full message object
    if (onSelectMessage && messageObj) {
      onSelectMessage(messageObj);
    }

    // Only mark as read if it's unread
    const isUnread = messages.some(
      (msg) => msg.id === messageId && msg.status === "unread"
    );
    if (!isUnread) return;

    try {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Show sign-in modal instead of redirecting
          setShowSignInModal(true);
          return;
        }
        throw new Error("Failed to mark message as read");
      }

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, status: "read" } : msg
        )
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-4">Loading messages...</div>;
  }

  if (status === "unauthenticated") {
    return null; // Router will handle redirect
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-2">Error: {error}</div>
        <button
          onClick={() => fetchMessages()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <Input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button variant="default">Compose</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Recipient ID:
                </label>
                <Input
                  type="text"
                  value={newMessage.recipient}
                  onChange={(e) =>
                    setNewMessage((prev) => ({
                      ...prev,
                      recipient: e.target.value,
                    }))
                  }
                  placeholder="Enter recipient ID"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Subject:
                </label>
                <Input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) =>
                    setNewMessage((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  placeholder="Enter subject"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Message:
                </label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) =>
                    setNewMessage((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Enter your message"
                  className="w-full min-h-[100px] p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsComposeOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Send</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex-1 overflow-auto">
        {filteredMessages.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? "No messages found" : "No messages yet"}
          </div>
        ) : (
          <div className="divide-y">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedMessage === message.id ? "bg-gray-50" : ""
                } ${message.status === "unread" ? "font-semibold" : ""}`}
                onClick={() => handleMessageClick(message.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">
                        {message.sender_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="text-sm truncate">{message.subject}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {hasMore && (
          <div className="p-4 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
