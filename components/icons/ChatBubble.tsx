import React from 'react';

interface ChatBubbleProps {
  className?: string;
  title?: string;
  tone?: "primary" | "secondary";
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  className = "", 
  title,
  tone = "primary" 
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={!title}
    >
      {title && <title>{title}</title>}
      
      {/* Main bubble */}
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      
      {/* Speech bubble tail */}
      <path d="M7 17l-2 2v-2" />
      
      {/* Secondary accent - message lines */}
      <g className={tone === "secondary" ? "opacity-70 icon-secondary-ink" : "opacity-70"}>
        <line x1="8" y1="9" x2="16" y2="9" strokeWidth={1} />
        <line x1="8" y1="13" x2="14" y2="13" strokeWidth={1} />
      </g>
      
      {/* Notification dot */}
      <circle cx="18" cy="6" r="1.5" fill="currentColor" />
    </svg>
  );
};

export default ChatBubble;
