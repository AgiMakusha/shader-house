'use client';

import { useState } from 'react';
import { UserProfileModal } from '@/components/profile/UserProfileModal';

interface DeveloperNameLinkProps {
  developerId: string;
  developerName: string;
}

export function DeveloperNameLink({ developerId, developerName }: DeveloperNameLinkProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <span className="inline-flex items-center">
      <button
        onClick={() => setSelectedUserId(developerId)}
        className="font-semibold hover:underline cursor-pointer transition-all text-lg"
        style={{ color: "rgba(150, 250, 150, 0.9)" }}
      >
        {developerName}
      </button>

      <UserProfileModal
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </span>
  );
}

