'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Developer {
  id: string;
  name: string;
  image?: string;
  gamesCount: number;
  isSupported?: boolean;
}

interface DeveloperSupportCardProps {
  developer: Developer;
  onSupport: (developerId: string) => Promise<void>;
  onUnsupport: (developerId: string) => Promise<void>;
  disabled?: boolean;
}

export function DeveloperSupportCard({
  developer,
  onSupport,
  onUnsupport,
  disabled,
}: DeveloperSupportCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleSupport = async () => {
    setIsLoading(true);
    try {
      if (developer.isSupported) {
        await onUnsupport(developer.id);
      } else {
        await onSupport(developer.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
          {developer.image ? (
            <img
              src={developer.image}
              alt={developer.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            developer.name.charAt(0).toUpperCase()
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white mb-1 truncate">
            {developer.name}
          </h3>
          <p className="text-white/60 text-sm mb-3">
            {developer.gamesCount} {developer.gamesCount === 1 ? 'game' : 'games'}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSupport}
              disabled={disabled || isLoading}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all
                ${
                  developer.isSupported
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <Heart
                size={16}
                className={developer.isSupported ? 'fill-current' : ''}
              />
              {isLoading
                ? 'Loading...'
                : developer.isSupported
                ? 'Supporting'
                : 'Support'}
            </button>

            <Link
              href={`/profile/developer?id=${developer.id}`}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      </div>

      {developer.isSupported && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-white/10"
        >
          <p className="text-sm text-white/70">
            ✨ You have access to all beta builds, exclusive content, and voting power for this developer
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}






