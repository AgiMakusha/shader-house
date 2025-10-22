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
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={1}
      className={className}
      aria-hidden={!title}
    >
      {title && <title>{title}</title>}
      
      {/* Rounded rectangle + small tail */}
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      
      {/* Three tiny dots as short strokes */}
      <line x1="8.5" y1="9" x2="9.5" y2="9" />
      <line x1="11.5" y1="9" x2="12.5" y2="9" />
      <line x1="14.5" y1="9" x2="15.5" y2="9" />
    </svg>
  );
};

export default ChatBubble;