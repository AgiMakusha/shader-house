import React from 'react';

interface ChatBubbleProps {
  className?: string;
  title?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  className = "", 
  title
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={1}
      className={className}
      aria-hidden={!title}
    >
      {title && <title>{title}</title>}
      
      {/* Main bubble */}
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      
      {/* Speech bubble tail */}
      <path d="M7 17l-2 2v-2" />
      
      {/* Message dots */}
      <circle cx="8.5" cy="9" r="0.5" fill="none" />
      <circle cx="11.5" cy="9" r="0.5" fill="none" />
      <circle cx="14.5" cy="9" r="0.5" fill="none" />
      <circle cx="8.5" cy="13" r="0.5" fill="none" />
      <circle cx="11.5" cy="13" r="0.5" fill="none" />
    </svg>
  );
};

export default ChatBubble;