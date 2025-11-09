"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import Particles from "@/components/fx/Particles";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { useAudio } from "@/components/audio/AudioProvider";

const COMMUNITY_CHANNELS = [
  { id: "general", name: "General Discussion", description: "Talk about anything gaming related", members: 0 },
  { id: "developers", name: "Developer Hub", description: "Connect with game developers", members: 0 },
  { id: "feedback", name: "Game Feedback", description: "Share your thoughts on games", members: 0 },
  { id: "showcase", name: "Project Showcase", description: "Show off your latest work", members: 0 },
];

export default function CommunityPage() {
  const router = useRouter();
  const { play } = useAudio();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState("general");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    play("click");
    
    // TODO: Implement real-time messaging
    const newMessage = {
      id: Date.now(),
      user: user?.name || "Anonymous",
      role: user?.role || "GAMER",
      message: message.trim(),
      timestamp: new Date().toISOString(),
      channel: selectedChannel,
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    play("click");
    // TODO: Load messages for selected channel
    setMessages([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-xl font-semibold pixelized" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
            Loading...
          </div>
        </motion.div>
      </div>
    );
  }

  const backUrl = user?.role === "DEVELOPER" ? "/profile/developer" : "/profile/gamer";

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />

      <motion.main
        className="relative z-10 flex min-h-dvh flex-col items-center justify-start p-6 pt-12"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-full max-w-6xl mb-8 flex items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] pixelized" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
              Connect & Collaborate
            </p>
            <h1
              className="text-4xl font-bold tracking-wider uppercase pixelized"
              style={{
                textShadow: `
                  0 0 12px rgba(120, 200, 120, 0.8),
                  0 0 24px rgba(100, 180, 100, 0.6),
                  2px 2px 0px rgba(0, 0, 0, 0.9)
                `,
                color: "rgba(180, 220, 180, 0.95)",
              }}
            >
              Community
            </h1>
            <p
              className="mt-2 text-sm pixelized"
              style={{ color: "rgba(200, 240, 200, 0.65)", textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)" }}
            >
              Join the conversation with gamers and developers
            </p>
          </div>

          <Link
            href={backUrl}
            className="text-xs font-semibold uppercase tracking-[0.2em] hover:underline transition-all"
            style={{ color: "rgba(200, 240, 200, 0.75)" }}
          >
            ← Back to Profile
          </Link>
        </motion.div>

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Channels Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GameCard>
              <GameCardContent className="p-6">
                <h2
                  className="text-xl font-bold mb-4 pixelized"
                  style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
                >
                  Channels
                </h2>
                <div className="space-y-2">
                  {COMMUNITY_CHANNELS.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => handleChannelSelect(channel.id)}
                      className="w-full text-left p-3 rounded-lg transition-all"
                      style={{
                        background: selectedChannel === channel.id
                          ? "linear-gradient(135deg, rgba(100, 200, 100, 0.2) 0%, rgba(80, 180, 80, 0.1) 100%)"
                          : "transparent",
                        border: `1px solid ${selectedChannel === channel.id ? "rgba(200, 240, 200, 0.3)" : "transparent"}`,
                      }}
                    >
                      <p
                        className="font-semibold text-sm mb-1"
                        style={{ color: "rgba(200, 240, 200, 0.9)" }}
                      >
                        # {channel.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "rgba(200, 240, 200, 0.6)" }}
                      >
                        {channel.description}
                      </p>
                    </button>
                  ))}
                </div>
              </GameCardContent>
            </GameCard>
          </motion.div>

          {/* Chat Area */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GameCard>
              <GameCardContent className="p-6 flex flex-col h-[600px]">
                {/* Channel Header */}
                <div className="mb-4 pb-4 border-b" style={{ borderColor: "rgba(200, 240, 200, 0.2)" }}>
                  <h2
                    className="text-2xl font-bold pixelized"
                    style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
                  >
                    # {COMMUNITY_CHANNELS.find(c => c.id === selectedChannel)?.name}
                  </h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: "rgba(200, 240, 200, 0.6)" }}
                  >
                    {COMMUNITY_CHANNELS.find(c => c.id === selectedChannel)?.description}
                  </p>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p
                        className="text-base pixelized"
                        style={{ color: "rgba(200, 240, 200, 0.5)" }}
                      >
                        No messages yet. Be the first to start the conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-4 rounded-lg"
                        style={{
                          background: "linear-gradient(135deg, rgba(100, 200, 100, 0.05) 0%, rgba(80, 180, 80, 0.02) 100%)",
                          border: "1px solid rgba(200, 240, 200, 0.1)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="font-semibold text-sm"
                            style={{ color: "rgba(200, 240, 200, 0.9)" }}
                          >
                            {msg.user}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              background: msg.role === "DEVELOPER"
                                ? "rgba(100, 150, 250, 0.2)"
                                : "rgba(100, 200, 100, 0.2)",
                              color: msg.role === "DEVELOPER"
                                ? "rgba(150, 200, 250, 0.9)"
                                : "rgba(150, 250, 150, 0.9)",
                            }}
                          >
                            {msg.role === "DEVELOPER" ? "Developer" : "Gamer"}
                          </span>
                          <span
                            className="text-xs ml-auto"
                            style={{ color: "rgba(200, 240, 200, 0.5)" }}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p
                          className="text-sm"
                          style={{ color: "rgba(200, 240, 200, 0.85)" }}
                        >
                          {msg.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Message #${COMMUNITY_CHANNELS.find(c => c.id === selectedChannel)?.name}`}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                    style={{ color: "rgba(200, 240, 200, 0.85)" }}
                  />
                  <motion.button
                    type="submit"
                    className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all"
                    style={{
                      background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
                      border: "1px solid rgba(200, 240, 200, 0.3)",
                      color: "rgba(200, 240, 200, 0.95)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Send
                  </motion.button>
                </form>
              </GameCardContent>
            </GameCard>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}

