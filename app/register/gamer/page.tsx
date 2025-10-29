"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GamerPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new profile page
    router.replace("/profile/gamer");
  }, [router]);

  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg" style={{ color: 'rgba(200, 240, 200, 0.8)' }}>
          Redirecting...
        </p>
      </div>
    </div>
  );
}
