'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ProfileCardPreview } from './ProfileCardPreview';

interface UserProfileModalProps {
  userId: string | null;
  onClose: () => void;
}

interface UserProfile {
  id: string;
  name: string;
  displayName?: string | null;
  publicEmail?: string | null;
  bio?: string | null;
  role: string;
  level: number;
  badges: string[];
  image?: string | null;
}

export function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch(`/api/users/${userId}/profile`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load profile');
        }
        return res.json();
      })
      .then((data) => {
        setProfile(data);
      })
      .catch((err) => {
        console.error('Failed to load user profile:', err);
        setError('Failed to load user profile');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId]);

  if (!userId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.7)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="rounded-lg p-4 sm:p-6"
            style={{
              background: 'rgba(20, 30, 20, 0.98)',
              border: '1px solid rgba(180, 240, 180, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-lg hover:bg-white/10 transition-colors z-10"
              style={{ color: 'rgba(180, 240, 180, 0.8)' }}
              aria-label="Close"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>

            {/* Content */}
            <div className="w-full">
              {isLoading ? (
                <div className="text-center py-12" style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
                  Loading profile...
                </div>
              ) : error ? (
                <div className="text-center py-12" style={{ color: 'rgba(255, 150, 150, 0.9)' }}>
                  {error}
                </div>
              ) : profile ? (
                <ProfileCardPreview
                  displayName={profile.displayName || profile.name}
                  publicEmail={profile.publicEmail}
                  bio={profile.bio}
                  role={profile.role}
                  level={profile.level || 1}
                  badges={profile.badges || []}
                  image={profile.image}
                  title="User Profile"
                  subtitle=""
                  compact={true}
                />
              ) : null}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}



