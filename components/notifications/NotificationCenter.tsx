"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  FlaskConical, 
  MessageCircle, 
  Gamepad2, 
  Trophy, 
  CreditCard,
  Sparkles,
  UserPlus,
  MessageSquarePlus,
  Star,
  Rocket,
  MessagesSquare
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAudio } from "@/components/audio/AudioProvider";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationCenter() {
  const router = useRouter();
  const { play } = useAudio();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notifications?limit=20");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } else if (response.status !== 401) {
        // Only log non-auth errors (401 is expected when not logged in)
        console.error("Error fetching notifications:", response.status, await response.text());
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch unread count (lightweight)
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications/unread-count");
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      } else if (response.status !== 401) {
        // Only log non-auth errors
        console.error("Error fetching unread count:", response.status);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();

    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState) {
      play("hover");
      fetchNotifications();
      fetchUnreadCount(); // Also refresh count when opening
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", {
        method: "POST",
      });

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
      play("hover");
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconStyle = {
      color: "rgba(150, 220, 150, 0.9)",
      filter: "drop-shadow(0 0 4px rgba(100, 200, 100, 0.5))",
    };
    
    switch (type) {
      // Gamer notifications
      case "BETA_ACCESS_GRANTED":
        return <FlaskConical className="w-6 h-6" style={iconStyle} />;
      case "FEEDBACK_RESPONSE":
        return <MessageCircle className="w-6 h-6" style={iconStyle} />;
      case "GAME_UPDATE":
        return <Gamepad2 className="w-6 h-6" style={iconStyle} />;
      case "ACHIEVEMENT_UNLOCKED":
        return <Trophy className="w-6 h-6" style={iconStyle} />;
      case "SUBSCRIPTION_CHANGED":
      case "SUBSCRIPTION_RENEWED":
      case "SUBSCRIPTION_CANCELED":
        return <CreditCard className="w-6 h-6" style={iconStyle} />;
      // Developer notifications
      case "NEW_BETA_TESTER":
        return <UserPlus className="w-6 h-6" style={iconStyle} />;
      case "NEW_FEEDBACK":
        return <MessageSquarePlus className="w-6 h-6" style={iconStyle} />;
      case "NEW_REVIEW":
        return <Star className="w-6 h-6" style={iconStyle} />;
      case "GAME_PUBLISHED":
        return <Rocket className="w-6 h-6" style={iconStyle} />;
      case "NEW_COMMUNITY_THREAD":
        return <MessagesSquare className="w-6 h-6" style={iconStyle} />;
      default:
        return <Sparkles className="w-6 h-6" style={iconStyle} />;
    }
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg transition-all"
        style={{
          background: isOpen
            ? "rgba(100, 200, 100, 0.2)"
            : "transparent",
          border: "1px solid rgba(200, 240, 200, 0.2)",
        }}
        onMouseEnter={() => play("hover")}
      >
        <Bell
          className="w-5 h-5"
          style={{ color: "rgba(200, 240, 200, 0.9)" }}
        />
        {unreadCount > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: "linear-gradient(135deg, rgba(240, 100, 100, 0.95) 0%, rgba(220, 80, 80, 0.95) 100%)",
              color: "white",
              boxShadow: "0 2px 8px rgba(240, 100, 100, 0.5)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 top-full mt-2 w-96 max-h-[600px] overflow-hidden rounded-xl z-50"
            style={{
              background: "rgba(20, 40, 20, 0.95)",
              border: "1px solid rgba(200, 240, 200, 0.3)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(10px)",
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: "rgba(200, 240, 200, 0.2)" }}
            >
              <h3
                className="text-lg font-bold pixelized"
                style={{
                  color: "rgba(180, 220, 180, 0.95)",
                  textShadow: "0 0 6px rgba(120, 200, 120, 0.5)",
                }}
              >
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-1.5 rounded transition-all"
                    style={{
                      background: "rgba(100, 200, 100, 0.2)",
                      color: "rgba(200, 240, 200, 0.8)",
                    }}
                    onMouseEnter={() => play("hover")}
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded transition-all"
                  style={{
                    background: "rgba(200, 100, 100, 0.2)",
                    color: "rgba(240, 200, 200, 0.8)",
                  }}
                  onMouseEnter={() => play("hover")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[500px]">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div
                    className="text-sm"
                    style={{ color: "rgba(200, 240, 200, 0.7)" }}
                  >
                    Loading...
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell
                    className="w-12 h-12 mx-auto mb-3 opacity-30"
                    style={{ color: "rgba(200, 240, 200, 0.5)" }}
                  />
                  <div
                    className="text-sm"
                    style={{ color: "rgba(200, 240, 200, 0.7)" }}
                  >
                    No notifications yet
                  </div>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      className={`p-4 border-b cursor-pointer transition-all ${
                        !notification.isRead
                          ? "bg-opacity-10"
                          : "opacity-70"
                      }`}
                      style={{
                        background: !notification.isRead
                          ? "rgba(100, 200, 100, 0.1)"
                          : "transparent",
                        borderColor: "rgba(200, 240, 200, 0.1)",
                      }}
                      onClick={() => handleNotificationClick(notification)}
                      whileHover={{
                        background: "rgba(100, 200, 100, 0.15)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4
                              className={`text-sm font-bold pixelized ${
                                !notification.isRead ? "" : "opacity-70"
                              }`}
                              style={{
                                color: "rgba(200, 240, 200, 0.95)",
                              }}
                            >
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                                style={{
                                  background: "rgba(100, 200, 100, 0.9)",
                                  boxShadow: "0 0 6px rgba(100, 200, 100, 0.6)",
                                }}
                              />
                            )}
                          </div>
                          <p
                            className="text-xs mb-2 line-clamp-2"
                            style={{
                              color: "rgba(200, 240, 200, 0.7)",
                            }}
                          >
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span
                              className="text-xs"
                              style={{
                                color: "rgba(200, 240, 200, 0.5)",
                              }}
                            >
                              {formatDistanceToNow(
                                new Date(notification.createdAt),
                                { addSuffix: true }
                              )}
                            </span>
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="p-1 rounded transition-all"
                                style={{
                                  background: "rgba(100, 200, 100, 0.2)",
                                  color: "rgba(200, 240, 200, 0.8)",
                                }}
                                onMouseEnter={() => play("hover")}
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div
                className="p-3 border-t text-center"
                style={{ borderColor: "rgba(200, 240, 200, 0.2)" }}
              >
                <Link
                  href="/profile/gamer/notifications"
                  className="text-xs font-semibold uppercase tracking-wider transition-colors"
                  style={{ color: "rgba(200, 240, 200, 0.7)" }}
                  onClick={() => setIsOpen(false)}
                >
                  View All Notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

