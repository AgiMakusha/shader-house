"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { GameIcon } from "@/components/game/GameIcon";
import { BuildTools, RocketLaunch, AnalyticsEye, GearSettings } from "@/components/icons";
import Particles from "@/components/fx/Particles";
import { useAudio } from "@/components/audio/AudioProvider";
import { useRouter } from "next/navigation";

export default function DeveloperProfilePage() {
  const router = useRouter();
  const { play } = useAudio();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user profile
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        if (data.user.role !== "DEVELOPER") {
          router.push("/profile/gamer");
          return;
        }
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      play("door");
      setTimeout(() => router.push("/login"), 300);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-xl font-semibold pixelized" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
            Loading...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />
      
      <motion.main 
        className="relative z-10 flex min-h-dvh flex-col items-center justify-start p-6 pt-12"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          className="w-full max-w-5xl mb-8 flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div>
            <h1 
              className="text-4xl font-bold tracking-wider uppercase pixelized mb-2"
              style={{
                textShadow: `
                  0 0 12px rgba(120, 200, 120, 0.8),
                  0 0 24px rgba(100, 180, 100, 0.6),
                  2px 2px 0px rgba(0, 0, 0, 0.9)
                `,
                color: 'rgba(180, 220, 180, 0.95)',
              }}
            >
              Developer Studio
            </h1>
            <p 
              className="text-sm font-semibold tracking-wide uppercase pixelized"
              style={{
                textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                color: 'rgba(200, 240, 200, 0.7)',
              }}
            >
              Welcome back, {user?.name}
            </p>
          </div>
          
          <motion.button
            onClick={handleLogout}
            className="px-6 py-2 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(200, 100, 100, 0.3) 0%, rgba(180, 80, 80, 0.2) 100%)',
              border: '1px solid rgba(240, 200, 200, 0.3)',
              color: 'rgba(240, 200, 200, 0.95)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        </motion.div>

        {/* Profile Overview Card */}
        <motion.div
          className="w-full max-w-5xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <GameCard>
            <GameCardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <GameIcon size="lg">
                    <BuildTools className="w-full h-full" />
                  </GameIcon>
                </div>
                
                <div className="flex-1">
                  <h2 
                    className="text-2xl font-bold mb-4 pixelized"
                    style={{
                      textShadow: '0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)',
                      color: 'rgba(180, 220, 180, 0.95)',
                    }}
                  >
                    Profile Overview
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'rgba(200, 240, 200, 0.6)' }}>
                        Email
                      </p>
                      <p className="text-base font-semibold" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                        {user?.email}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'rgba(200, 240, 200, 0.6)' }}>
                        Role
                      </p>
                      <p className="text-base font-semibold" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                        {user?.role}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'rgba(200, 240, 200, 0.6)' }}>
                        Member Since
                      </p>
                      <p className="text-base font-semibold" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    
                    {user?.developerProfile?.developerType && (
                      <div>
                        <p className="text-sm font-medium mb-1" style={{ color: 'rgba(200, 240, 200, 0.6)' }}>
                          Developer Type
                        </p>
                        <p className="text-base font-semibold" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                          {user.developerProfile.developerType}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GameCardContent>
          </GameCard>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GameCard interactive>
              <GameCardContent className="p-6 text-center cursor-pointer">
                <GameIcon size="md" className="mx-auto mb-4">
                  <RocketLaunch className="w-full h-full" />
                </GameIcon>
                <h3 
                  className="text-lg font-bold mb-2 pixelized"
                  style={{
                    textShadow: '0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)',
                    color: 'rgba(180, 220, 180, 0.95)',
                  }}
                >
                  My Projects
                </h3>
                <p className="text-sm" style={{ color: 'rgba(200, 240, 200, 0.7)' }}>
                  Manage your game projects
                </p>
              </GameCardContent>
            </GameCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <GameCard interactive>
              <GameCardContent className="p-6 text-center cursor-pointer">
                <GameIcon size="md" className="mx-auto mb-4">
                  <AnalyticsEye className="w-full h-full" />
                </GameIcon>
                <h3 
                  className="text-lg font-bold mb-2 pixelized"
                  style={{
                    textShadow: '0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)',
                    color: 'rgba(180, 220, 180, 0.95)',
                  }}
                >
                  Analytics
                </h3>
                <p className="text-sm" style={{ color: 'rgba(200, 240, 200, 0.7)' }}>
                  View your game stats
                </p>
              </GameCardContent>
            </GameCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <GameCard interactive>
              <GameCardContent className="p-6 text-center cursor-pointer">
                <GameIcon size="md" className="mx-auto mb-4">
                  <GearSettings className="w-full h-full" />
                </GameIcon>
                <h3 
                  className="text-lg font-bold mb-2 pixelized"
                  style={{
                    textShadow: '0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)',
                    color: 'rgba(180, 220, 180, 0.95)',
                  }}
                >
                  Settings
                </h3>
                <p className="text-sm" style={{ color: 'rgba(200, 240, 200, 0.7)' }}>
                  Manage your account
                </p>
              </GameCardContent>
            </GameCard>
          </motion.div>
        </div>

        {/* Developer-Specific Info */}
        {user?.developerProfile && (
          <motion.div
            className="w-full max-w-5xl mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <GameCard>
              <GameCardContent className="p-8">
                <h2 
                  className="text-2xl font-bold mb-6 pixelized"
                  style={{
                    textShadow: '0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)',
                    color: 'rgba(180, 220, 180, 0.95)',
                  }}
                >
                  Developer Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.developerProfile.teamSize !== null && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'rgba(200, 240, 200, 0.6)' }}>
                        Team Size
                      </p>
                      <p className="text-base font-semibold" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                        {user.developerProfile.teamSize} {user.developerProfile.teamSize === 1 ? 'person' : 'people'}
                      </p>
                    </div>
                  )}
                  
                  {user.developerProfile.hasPublisher !== null && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'rgba(200, 240, 200, 0.6)' }}>
                        Publisher
                      </p>
                      <p className="text-base font-semibold" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                        {user.developerProfile.hasPublisher ? 'Yes' : 'No'}
                      </p>
                    </div>
                  )}
                  
                  {user.developerProfile.ownsIP !== null && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'rgba(200, 240, 200, 0.6)' }}>
                        Owns IP
                      </p>
                      <p className="text-base font-semibold" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                        {user.developerProfile.ownsIP ? 'Yes' : 'No'}
                      </p>
                    </div>
                  )}
                  
                  {user.developerProfile.companyType && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'rgba(200, 240, 200, 0.6)' }}>
                        Company Type
                      </p>
                      <p className="text-base font-semibold" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                        {user.developerProfile.companyType.replace(/_/g, ' ')}
                      </p>
                    </div>
                  )}
                  
                  {user.developerProfile.isIndieEligible !== null && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'rgba(200, 240, 200, 0.6)' }}>
                        Indie Status
                      </p>
                      <p className="text-base font-semibold" style={{ 
                        color: user.developerProfile.isIndieEligible 
                          ? 'rgba(150, 250, 150, 0.95)' 
                          : 'rgba(250, 200, 150, 0.95)' 
                      }}>
                        {user.developerProfile.isIndieEligible ? '✓ Indie Verified' : '⚠ Under Review'}
                      </p>
                    </div>
                  )}
                </div>
              </GameCardContent>
            </GameCard>
          </motion.div>
        )}
      </motion.main>
    </div>
  );
}

