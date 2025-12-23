"use client";

import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { HeaderReportButton } from "@/components/reports/HeaderReportButton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PageHeaderProps {
  showNotifications?: boolean;
}

export function PageHeader({ showNotifications = true }: PageHeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 p-4"
      style={{
        background: "rgba(10, 20, 10, 0.8)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(200, 240, 200, 0.1)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={() => router.push(user.role === "DEVELOPER" ? "/profile/developer" : "/profile/gamer")}
          className="text-lg font-bold pixelized transition-all"
          style={{
            color: "rgba(180, 220, 180, 0.95)",
            textShadow: "0 0 6px rgba(120, 200, 120, 0.5)",
          }}
        >
          Shader House
        </button>

        {showNotifications && (
          <div className="flex items-center gap-2">
            <HeaderReportButton />
            <NotificationCenter />
          </div>
        )}
      </div>
    </div>
  );
}

