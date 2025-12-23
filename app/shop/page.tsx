'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingBag, Sparkles, Palette, Crown } from 'lucide-react';
import Particles from '@/components/fx/Particles';

export default function ShopPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'rgba(20, 30, 20, 0.95)' }}>
      <Particles />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          {user && (
            <div className="mb-4">
              <Link
                href={user.role === 'DEVELOPER' ? '/profile/developer' : '/profile/gamer'}
                className="text-sm hover:underline inline-block"
                style={{ color: 'rgba(180, 240, 180, 0.7)' }}
              >
                ← {user.role === 'DEVELOPER' ? 'Back to Developer Hub' : 'Back to Gamer Hub'}
              </Link>
            </div>
          )}
          
          <h1
            className="text-4xl font-bold mb-2 pixelized"
            style={{
              color: 'rgba(180, 240, 180, 0.95)',
              textShadow: '0 0 12px rgba(120, 200, 120, 0.6), 2px 2px 0px rgba(0, 0, 0, 0.8)',
            }}
          >
            Shader Shop
          </h1>
          <p style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
            Spend your points on exclusive cosmetics and rewards
          </p>
          
          {user?.points !== undefined && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{
              background: 'rgba(240, 220, 140, 0.2)',
              border: '1px solid rgba(240, 220, 140, 0.4)',
            }}>
              <Sparkles size={16} style={{ color: 'rgba(240, 220, 140, 0.9)' }} />
              <span
                className="font-bold pixelized"
                style={{ color: 'rgba(240, 220, 140, 0.95)', fontSize: '14px' }}
              >
                {user.points} Points Available
              </span>
            </div>
          )}
        </div>

        {/* Coming Soon Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-lg text-center"
          style={{
            background: 'rgba(40, 50, 40, 0.8)',
            border: '1px solid rgba(100, 150, 100, 0.3)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          }}
        >
          <ShoppingBag
            size={64}
            style={{
              color: 'rgba(240, 220, 140, 0.5)',
              margin: '0 auto 24px',
            }}
          />
          <h2
            className="text-2xl font-bold mb-4 pixelized"
            style={{
              color: 'rgba(240, 220, 140, 0.95)',
              textShadow: '0 0 8px rgba(240, 220, 140, 0.6)',
            }}
          >
            Shop Opening Soon!
          </h2>
          <p
            className="mb-6 text-lg"
            style={{ color: 'rgba(180, 220, 180, 0.8)' }}
          >
            We're preparing an exclusive collection of cosmetics and rewards for you.
            Keep earning points and check back soon!
          </p>
        </motion.div>

        {/* Features Preview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-lg"
            style={{
              background: 'rgba(40, 50, 40, 0.6)',
              border: '1px solid rgba(100, 150, 100, 0.3)',
            }}
          >
            <Palette
              size={32}
              style={{ color: 'rgba(180, 240, 180, 0.9)', marginBottom: '12px' }}
            />
            <h3
              className="text-lg font-bold mb-2 pixelized"
              style={{ color: 'rgba(180, 240, 180, 0.95)' }}
            >
              Profile Themes
            </h3>
            <p style={{ color: 'rgba(150, 180, 150, 0.7)', fontSize: '14px' }}>
              Customize your profile with unique color schemes and effects
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-lg"
            style={{
              background: 'rgba(40, 50, 40, 0.6)',
              border: '1px solid rgba(100, 150, 100, 0.3)',
            }}
          >
            <Crown
              size={32}
              style={{ color: 'rgba(240, 220, 140, 0.9)', marginBottom: '12px' }}
            />
            <h3
              className="text-lg font-bold mb-2 pixelized"
              style={{ color: 'rgba(180, 240, 180, 0.95)' }}
            >
              Avatar Frames
            </h3>
            <p style={{ color: 'rgba(150, 180, 150, 0.7)', fontSize: '14px' }}>
              Stand out with exclusive animated borders for your avatar
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-lg"
            style={{
              background: 'rgba(40, 50, 40, 0.6)',
              border: '1px solid rgba(100, 150, 100, 0.3)',
            }}
          >
            <Sparkles
              size={32}
              style={{ color: 'rgba(150, 200, 255, 0.9)', marginBottom: '12px' }}
            />
            <h3
              className="text-lg font-bold mb-2 pixelized"
              style={{ color: 'rgba(180, 240, 180, 0.95)' }}
            >
              Custom Reactions
            </h3>
            <p style={{ color: 'rgba(150, 180, 150, 0.7)', fontSize: '14px' }}>
              Unlock special emoji reactions for posts and comments
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}



