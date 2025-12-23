"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Bell, 
  CheckCheck, 
  ArrowLeft,
  CreditCard,
  Sparkles,
  UserPlus,
  MessageSquarePlus,
  Star,
  Rocket,
  MessagesSquare
} from "lucide-react";
import Particles from "@/components/fx/Particles";
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

export default function DeveloperNotificationsPage() {
  const router = useRouter();
  const { play } = useAudio();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchNotifications = async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setOffset(0);
      }

      const currentOffset = reset ? 0 : offset;
      const response = await fetch(`/api/notifications?limit=50&offset=${currentOffset}`);
      if (response.ok) {
        const data = await response.json();
        if (reset) {
          setNotifications(data.notifications || []);
        } else {
          setNotifications((prev) => [...prev, ...(data.notifications || [])]);
        }
        setUnreadCount(data.unreadCount || 0);
        setHasMore(data.hasMore || false);
        setOffset(currentOffset + (data.notifications?.length || 0));
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
  }, []);

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
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconStyle = {
      color: "rgba(150, 220, 150, 0.9)",
      filter: "drop-shadow(0 0 6px rgba(100, 200, 100, 0.5))",
    };
    
    switch (type) {
      // Developer notifications
      case "NEW_BETA_TESTER":
        return <UserPlus className="w-8 h-8" style={iconStyle} />;
      case "NEW_FEEDBACK":
        return <MessageSquarePlus className="w-8 h-8" style={iconStyle} />;
      case "NEW_REVIEW":
        return <Star className="w-8 h-8" style={iconStyle} />;
      case "GAME_PUBLISHED":
        return <Rocket className="w-8 h-8" style={iconStyle} />;
      case "NEW_COMMUNITY_THREAD":
        return <MessagesSquare className="w-8 h-8" style={iconStyle} />;
      case "SUBSCRIPTION_CHANGED":
      case "SUBSCRIPTION_RENEWED":
      case "SUBSCRIPTION_CANCELED":
        return <CreditCard className="w-8 h-8" style={iconStyle} />;
      default:
        return <Sparkles className="w-8 h-8" style={iconStyle} />;
    }
  };

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />

      <motion.main
        className="relative z-10 flex min-h-dvh flex-col items-center justify-start p-6 pt-12"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-4xl">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/profile/developer"
              className="inline-flex items-center gap-2 mb-4 group"
              onMouseEnter={() => play("hover")}
            >
              <ArrowLeft
                className="w-5 h-5 transition-transform group-hover:-translate-x-1"
                style={{ color: "rgba(200, 240, 200, 0.7)" }}
              />
              <span
                className="text-sm font-semibold tracking-wide uppercase pixelized transition-colors"
                style={{
                  color: "rgba(200, 240, 200, 0.7)",
                  textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)",
                }}
              >
                Back to Developer Studio
              </span>
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1
                  className="text-4xl font-bold tracking-wider uppercase pixelized mb-2"
                  style={{
                    textShadow: `
                      0 0 12px rgba(120, 200, 120, 0.8),
                      0 0 24px rgba(100, 180, 100, 0.6),
                      2px 2px 0px rgba(0, 0, 0, 0.9)
                    `,
                    color: "rgba(180, 220, 180, 0.95)",
                  }}
                >
                  Notifications
                </h1>
                <p
                  className="text-sm font-semibold tracking-wide uppercase pixelized"
                  style={{ textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(200, 240, 200, 0.7)" }}
                >
                  {unreadCount} unread • {notifications.length} total
                </p>
              </div>

              {unreadCount > 0 && (
                <motion.button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all flex items-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)",
                    border: "1px solid rgba(200, 240, 200, 0.3)",
                    color: "rgba(200, 240, 200, 0.95)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => play("hover")}
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark All Read
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Notifications List */}
          {isLoading ? (
            <div className="text-center py-16">
              <div
                className="text-sm"
                style={{ color: "rgba(200, 240, 200, 0.7)" }}
              >
                Loading notifications...
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Bell
                className="w-16 h-16 mx-auto mb-4 opacity-30"
                style={{ color: "rgba(200, 240, 200, 0.5)" }}
              />
              <h3
                className="text-2xl font-bold mb-2 pixelized"
                style={{
                  color: "rgba(200, 240, 200, 0.8)",
                  textShadow: "0 0 8px rgba(120, 200, 120, 0.4)",
                }}
              >
                No notifications yet
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: "rgba(200, 240, 200, 0.6)" }}
              >
                You'll see notifications here when testers join your betas, submit feedback, or leave reviews!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    !notification.isRead
                      ? "bg-opacity-10"
                      : "opacity-70"
                  }`}
                  style={{
                    background: !notification.isRead
                      ? "rgba(100, 200, 100, 0.1)"
                      : "rgba(20, 40, 20, 0.6)",
                    border: "1px solid rgba(200, 240, 200, 0.2)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                  onClick={() => handleNotificationClick(notification)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                  whileHover={{
                    background: "rgba(100, 200, 100, 0.15)",
                    scale: 1.02,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4
                          className={`text-base font-bold pixelized ${
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
                        className="text-sm mb-3"
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
                            className="px-3 py-1 rounded text-xs font-semibold uppercase transition-all"
                            style={{
                              background: "rgba(100, 200, 100, 0.2)",
                              color: "rgba(200, 240, 200, 0.8)",
                            }}
                            onMouseEnter={() => play("hover")}
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {hasMore && (
                <motion.button
                  onClick={() => fetchNotifications(false)}
                  className="w-full py-3 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 200, 100, 0.2) 0%, rgba(80, 180, 80, 0.1) 100%)",
                    border: "1px solid rgba(200, 240, 200, 0.2)",
                    color: "rgba(200, 240, 200, 0.8)",
                  }}
                  onMouseEnter={() => play("hover")}
                >
                  Load More
                </motion.button>
              )}
            </div>
          )}
        </div>
      </motion.main>
    </div>
  );
}

