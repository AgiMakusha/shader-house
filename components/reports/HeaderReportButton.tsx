"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { useAudio } from "@/components/audio/AudioProvider";
import ReportContentModal from "./ReportContentModal";

export function HeaderReportButton() {
  const { play } = useAudio();
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    play("hover");
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="relative p-2 rounded-lg transition-all hover:bg-red-500/10"
        style={{
          background: "transparent",
          border: "1px solid rgba(200, 240, 200, 0.2)",
        }}
        onMouseEnter={() => play("hover")}
        title="Report a Problem"
      >
        <Flag
          className="w-5 h-5"
          style={{ color: "rgba(248, 113, 113, 0.8)" }}
        />
      </button>

      <ReportContentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

