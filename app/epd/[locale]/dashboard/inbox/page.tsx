"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Camera, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useState, useEffect, useRef } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { MessageList } from "@/components/message-list";
import { MessageView } from "@/components/message-view";
import { AdminSidebar } from "@/app/components/dashboard/AdminSidebar";
import { useUsers } from "@/lib/context/UsersContext";
import { useUserStore } from "@/lib/store/user";
import Header from "@/components/Header";
import { WS_BASE_URL, WS_ROUTES, buildWsUrl } from "@/lib/api/config";

const tabs = ["myEPDs", "inbox", "dataDirectory", "myProfile"] as const;

interface Message {
  id: number;
  sender: number;
  sender_name: string;
  recipient: number;
  recipient_name: string;
  subject: string;
  content: string;
  status: "unread" | "read" | "archived";
  epd_file?: string;
  created_at: string;
}

export default function InboxPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { users, isLoading: isLoadingUsers } = useUsers();
  const user = useUserStore((state) => state.user);
  const [selectedMessage, setSelectedMessage] = useState<Message | undefined>();

  const filteredUsers = users.filter(
    (user) =>
      user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const t = useTranslations();
  const n = useTranslations("navigation");
  const p = useTranslations("Profile");
  const router = useRouter();

  // Global reference for WebSocket to prevent multiple connections
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only set up WebSocket if mounted and not already created
    if (!mounted || wsRef.current) return;

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      try {
        console.log("Setting up WebSocket connection");
        const wsUrl = buildWsUrl(WS_ROUTES.NOTIFICATIONS);
        
        // Check if WebSocket URL is valid
        if (!wsUrl) {
          console.error("Invalid WebSocket URL");
          return;
        }
        
        wsRef.current = new WebSocket(wsUrl);

        // Add event handlers
        if (wsRef.current) {
          wsRef.current.onopen = () => {
            console.log("WebSocket connection established");
            // Reset reconnect attempts when successfully connected
            reconnectAttempts = 0;
          };

          wsRef.current.onmessage = (event: MessageEvent) => {
            try {
              const data = JSON.parse(event.data);
              console.log("WebSocket message received:", data);

              if (data.type === "new_message") {
                // Refresh messages - will be handled by MessageList
                console.log("New message notification received");
              }
            } catch (error) {
              console.error("Error parsing WebSocket message:", error);
            }
          };

          wsRef.current.onerror = (error: Event) => {
            console.error("WebSocket error:", error);
          };

          wsRef.current.onclose = (event) => {
            console.log("WebSocket connection closed", event);
            wsRef.current = null;
            
            // Only attempt to reconnect if not closing cleanly and under max attempts
            if (!event.wasClean && reconnectAttempts < maxReconnectAttempts) {
              reconnectAttempts++;
              console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
              
              // Exponential backoff: 1s, 2s, 4s
              const timeout = Math.pow(2, reconnectAttempts - 1) * 1000;
              reconnectTimeout = setTimeout(connectWebSocket, timeout);
            }
          };
        }
      } catch (error) {
        console.error("Error setting up WebSocket:", error);
        // Try to reconnect on error if under max attempts
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const timeout = Math.pow(2, reconnectAttempts - 1) * 1000;
          reconnectTimeout = setTimeout(connectWebSocket, timeout);
        }
      }
    };

    // Initial connection
    connectWebSocket();

    // Clean up function
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      
      if (wsRef.current) {
        wsRef.current.onclose = null; // Remove onclose handler to prevent reconnection attempts
        if (wsRef.current.readyState === WebSocket.OPEN) {
          console.log("Closing WebSocket connection");
          wsRef.current.close();
        }
        wsRef.current = null;
      }
    };
  }, [mounted]); // Only re-run if mounted changes

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-4rem)]">
      {/* Message List Column */}
      <div className="w-full lg:w-[450px] bg-white dark:bg-black overflow-auto">
        <MessageList onSelectMessage={setSelectedMessage} />
      </div>

      {/* Message View Column */}
      <div className="flex-1 bg-white dark:bg-black overflow-y-auto">
        <MessageView message={selectedMessage} />
      </div>
    </div>
  );
}
