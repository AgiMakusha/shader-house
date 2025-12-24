"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import Particles from "@/components/fx/Particles";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { ProfileCardPreview } from "@/components/profile/ProfileCardPreview";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { AccountDeletion } from "@/components/profile/AccountDeletion";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { LinkedAccounts, SessionManagement, TwoFactorSetup, DataExport, EmailChange, SetPassword } from "@/components/security";
import { StripeConnectSetup } from "@/components/payments";

export default function DeveloperSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isSavingStudio, setIsSavingStudio] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [isSavingCommunication, setIsSavingCommunication] = useState(false);
  
  // Account Information state
  const [displayName, setDisplayName] = useState('');
  const [publicEmail, setPublicEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarImage, setAvatarImage] = useState<string>('');
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');
  
  // Studio Profile state
  const [studioName, setStudioName] = useState('');
  const [tools, setTools] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [studioBio, setStudioBio] = useState('');
  const [studioError, setStudioError] = useState('');
  const [studioSuccess, setStudioSuccess] = useState('');
  
  // Communication Preferences state
  const [acceptCollabRequests, setAcceptCollabRequests] = useState(true);
  const [receiveLaunchUpdates, setReceiveLaunchUpdates] = useState(true);
  const [preferredContactNotes, setPreferredContactNotes] = useState('');
  const [communicationError, setCommunicationError] = useState('');
  const [communicationSuccess, setCommunicationSuccess] = useState('');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        setUser(data.user);
        
        // Sync achievements to badges (in case achievements were unlocked but badges not synced)
        try {
          const syncResponse = await fetch("/api/achievements/sync", {
            method: 'POST',
          });
          if (syncResponse.ok) {
            // Refresh user data to get updated badges
            const userResponse = await fetch("/api/auth/me");
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setUser(userData.user);
            }
          }
        } catch (error) {
          // Badge sync failed silently
        }
        
        // Load profile data into form fields
        setDisplayName(data.user.displayName || data.user.name || '');
        setPublicEmail(data.user.publicEmail || '');
        setBio(data.user.bio || '');
        setAvatarImage(data.user.image || '');
        
        // Load studio profile if exists
        if (data.user.developerProfile) {
          setStudioName(data.user.developerProfile.studioName || '');
          setTools(data.user.developerProfile.tools || '');
          setPortfolioUrl(data.user.developerProfile.portfolioUrl || '');
          setStudioBio(data.user.developerProfile.studioBio || '');
        }
        
        // Load communication preferences
        setAcceptCollabRequests(data.user.acceptCollabRequests ?? true);
        setReceiveLaunchUpdates(data.user.receiveLaunchUpdates ?? true);
        setPreferredContactNotes(data.user.preferredContactNotes || '');
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleAccountSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAccount(true);
    setAccountError('');
    setAccountSuccess('');

    try {
      // Validate and prepare fields
      const trimmedDisplayName = displayName.trim();
      const trimmedPublicEmail = publicEmail.trim();
      const trimmedBio = bio.trim();

      // Validate displayName if provided (must be at least 2 chars or empty)
      if (trimmedDisplayName && trimmedDisplayName.length < 2) {
        setAccountError('Display name must be at least 2 characters long');
        setIsSavingAccount(false);
        return;
      }

      // Validate email format if provided
      if (trimmedPublicEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedPublicEmail)) {
          setAccountError('Please enter a valid email address');
          setIsSavingAccount(false);
          return;
        }
      }

      // Build request body - send all fields (empty strings will clear them)
      const body: any = {
        displayName: trimmedDisplayName || '',
        publicEmail: trimmedPublicEmail || '',
        bio: trimmedBio || '',
        image: avatarImage || '',
      };

      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from API
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map((err: any) => {
            const field = err.path.join('.');
            return `${field}: ${err.message}`;
          }).join(', ');
          throw new Error(errorMessages || data.error || 'Failed to update profile');
        }
        throw new Error(data.error || 'Failed to update profile');
      }

      setUser(data.user);
      setAccountSuccess('Profile updated successfully!');
      setTimeout(() => setAccountSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setAccountError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleStudioSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStudio(true);
    setStudioError('');
    setStudioSuccess('');

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studioName: studioName.trim() || undefined,
          tools: tools.trim() || undefined,
          portfolioUrl: portfolioUrl.trim() || undefined,
          studioBio: studioBio.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update studio profile');
      }

      setStudioSuccess('Studio profile updated successfully!');
      setTimeout(() => setStudioSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error updating studio profile:', error);
      setStudioError(error.message || 'Failed to update studio profile. Please try again.');
    } finally {
      setIsSavingStudio(false);
    }
  };

  const handleCommunicationSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCommunication(true);
    setCommunicationError('');
    setCommunicationSuccess('');

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acceptCollabRequests,
          receiveLaunchUpdates,
          preferredContactNotes: preferredContactNotes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update communication preferences');
      }

      setUser(data.user);
      setCommunicationSuccess('Communication preferences updated successfully!');
      setTimeout(() => setCommunicationSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error updating communication preferences:', error);
      setCommunicationError(error.message || 'Failed to update preferences. Please try again.');
    } finally {
      setIsSavingCommunication(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSecurity(true);
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required');
      setIsSavingSecurity(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setIsSavingSecurity(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      setPasswordError(error.message || 'Failed to change password. Please try again.');
    } finally {
      setIsSavingSecurity(false);
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
        <motion.div
          className="w-full max-w-4xl mb-8 flex items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] pixelized" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
              Settings
            </p>
            <h1
              className="text-4xl font-bold tracking-wider uppercase pixelized"
              style={{
                textShadow: `
                  0 0 12px rgba(120, 200, 120, 0.8),
                  0 0 24px rgba(100, 180, 100, 0.6),
                  2px 2px 0px rgba(0, 0, 0, 0.9)
                `,
                color: "rgba(180, 220, 180, 0.95)",
              }}
            >
              Developer Settings
            </h1>
            <p
              className="mt-2 text-sm pixelized"
              style={{ color: "rgba(200, 240, 200, 0.65)", textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)" }}
            >
              Keep your studio information, security, and communication preferences up to date.
            </p>
          </div>

          <Link
            href="/profile/developer"
            className="text-xs font-semibold uppercase tracking-[0.2em] hover:underline transition-all"
            style={{ color: "rgba(200, 240, 200, 0.75)" }}
          >
            ← Back to Developer Hub
          </Link>
        </motion.div>

        <motion.div
          className="w-full max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <GameCard>
            <GameCardContent className="p-8 space-y-6">
              <h2
                className="text-2xl font-bold mb-4 pixelized"
                style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
              >
                Profile Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                    Email
                  </p>
                  <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                    {user?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                    Role
                  </p>
                  <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                    {user?.role}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                    Member Since
                  </p>
                  <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                {user?.developerProfile?.developerType && (
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                      Developer Type
                    </p>
                    <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                      {user.developerProfile.developerType}
                    </p>
                  </div>
                )}
              </div>
            </GameCardContent>
          </GameCard>
        </motion.div>

        {user?.developerProfile && (
          <motion.div
            className="w-full max-w-4xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.27 }}
          >
            <GameCard>
              <GameCardContent className="p-8 space-y-6">
                <h2
                  className="text-2xl font-bold pixelized"
                  style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
                >
                  Developer Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.developerProfile.teamSize !== null && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        Team Size
                      </p>
                      <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                        {user.developerProfile.teamSize}{" "}
                        {user.developerProfile.teamSize === 1 ? "person" : "people"}
                      </p>
                    </div>
                  )}

                  {user.developerProfile.hasPublisher !== null && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        Publisher
                      </p>
                      <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                        {user.developerProfile.hasPublisher ? "Yes" : "No"}
                      </p>
                    </div>
                  )}

                  {user.developerProfile.ownsIP !== null && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        Owns IP
                      </p>
                      <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                        {user.developerProfile.ownsIP ? "Yes" : "No"}
                      </p>
                    </div>
                  )}

                  {user.developerProfile.companyType && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        Company Type
                      </p>
                      <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                        {user.developerProfile.companyType.replace(/_/g, " ")}
                      </p>
                    </div>
                  )}

                  {user.developerProfile.isIndieEligible !== null && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        Indie Status
                      </p>
                      <p
                        className="text-base font-semibold"
                        style={{ color: user.developerProfile.isIndieEligible ? "rgba(150, 250, 150, 0.95)" : "rgba(250, 200, 150, 0.95)" }}
                      >
                        {user.developerProfile.isIndieEligible ? "✓ Indie Verified" : "⚠ Under Review"}
                      </p>
                    </div>
                  )}
                </div>
              </GameCardContent>
            </GameCard>
          </motion.div>
        )}

        <motion.div
          className="w-full max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <GameCard>
            <GameCardContent className="p-8 space-y-6">
              <h2
                className="text-2xl font-bold pixelized"
                style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
              >
                Account Information
              </h2>

              <form onSubmit={handleAccountSave} className="space-y-6">
                <AvatarUpload
                  value={avatarImage}
                  onChange={setAvatarImage}
                  label="Profile Picture"
                  role={user?.role}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="space-y-2">
                    <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      Display Name
                    </span>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Shader Dev"
                      minLength={2}
                      maxLength={50}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      Contact Email (Public)
                    </span>
                    <input
                      type="email"
                      value={publicEmail}
                      onChange={(e) => setPublicEmail(e.target.value)}
                      placeholder="studio@example.com"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    Public Bio
                  </span>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Introduce your studio, favourite tools, or what you're building next."
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm resize-none"
                    style={{ color: "rgba(200, 240, 200, 0.85)" }}
                  />
                  <p className="text-xs text-right" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                    {bio.length} / 500
                  </p>
                </label>

                {accountError && (
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      background: "rgba(180, 60, 60, 0.15)",
                      border: "1px solid rgba(255, 120, 120, 0.3)",
                      color: "rgba(255, 180, 180, 0.95)",
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
                      fontSize: "12px",
                      fontFamily: '"Press Start 2P", monospace',
                    }}
                  >
                    {accountError}
                  </div>
                )}

                {accountSuccess && (
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      background: "rgba(100, 200, 100, 0.15)",
                      border: "1px solid rgba(150, 240, 150, 0.3)",
                      color: "rgba(180, 240, 180, 0.95)",
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
                      fontSize: "12px",
                      fontFamily: '"Press Start 2P", monospace',
                    }}
                  >
                    ✓ {accountSuccess}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={isSavingAccount}
                  className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
                    border: "1px solid rgba(200, 240, 200, 0.3)",
                    color: "rgba(200, 240, 200, 0.95)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                  whileHover={!isSavingAccount ? { scale: 1.02 } : {}}
                  whileTap={!isSavingAccount ? { scale: 0.98 } : {}}
                >
                  {isSavingAccount ? "Saving..." : "Save Account"}
                </motion.button>
              </form>

              {/* Profile Card Preview */}
              <ProfileCardPreview
                displayName={displayName !== '' ? displayName : (user?.displayName || user?.name)}
                publicEmail={publicEmail !== '' ? publicEmail : user?.publicEmail}
                bio={bio !== '' ? bio : user?.bio}
                role={user?.role}
                level={user?.level || 1}
                badges={user?.badges || []}
                image={avatarImage || user?.image}
              />
            </GameCardContent>
          </GameCard>
        </motion.div>

        <motion.div
          className="w-full max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <GameCard>
            <GameCardContent className="p-8 space-y-6">
              <h2
                className="text-2xl font-bold pixelized"
                style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
              >
                Studio Profile
              </h2>

              <form onSubmit={handleStudioSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="space-y-2">
                    <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      Studio Name
                    </span>
                    <input
                      type="text"
                      value={studioName}
                      onChange={(e) => setStudioName(e.target.value)}
                      placeholder="Shader House Games"
                      maxLength={100}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      Portfolio URL
                    </span>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://shaderhouse.com"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    Primary Engine / Tools
                  </span>
                  <input
                    type="text"
                    value={tools}
                    onChange={(e) => setTools(e.target.value)}
                    placeholder="Unreal Engine, Blender, custom C++"
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                    style={{ color: "rgba(200, 240, 200, 0.85)" }}
                  />
                  <p className="text-xs text-right" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                    {tools.length} / 500
                  </p>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    Elevator Pitch
                  </span>
                  <textarea
                    rows={3}
                    value={studioBio}
                    onChange={(e) => setStudioBio(e.target.value)}
                    placeholder="Summarise your studio, current focus, or what you're seeking from the Shader House community."
                    maxLength={1000}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm resize-none"
                    style={{ color: "rgba(200, 240, 200, 0.85)" }}
                  />
                  <p className="text-xs text-right" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                    {studioBio.length} / 1000
                  </p>
                </label>

                {studioError && (
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      background: "rgba(180, 60, 60, 0.15)",
                      border: "1px solid rgba(255, 120, 120, 0.3)",
                      color: "rgba(255, 180, 180, 0.95)",
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
                      fontSize: "12px",
                      fontFamily: '"Press Start 2P", monospace',
                    }}
                  >
                    {studioError}
                  </div>
                )}

                {studioSuccess && (
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      background: "rgba(100, 200, 100, 0.15)",
                      border: "1px solid rgba(150, 240, 150, 0.3)",
                      color: "rgba(180, 240, 180, 0.95)",
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
                      fontSize: "12px",
                      fontFamily: '"Press Start 2P", monospace',
                    }}
                  >
                    ✓ {studioSuccess}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={isSavingStudio}
                  className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
                    border: "1px solid rgba(200, 240, 200, 0.3)",
                    color: "rgba(200, 240, 200, 0.95)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                  whileHover={!isSavingStudio ? { scale: 1.02 } : {}}
                  whileTap={!isSavingStudio ? { scale: 0.98 } : {}}
                >
                  {isSavingStudio ? "Saving..." : "Save Studio Profile"}
                </motion.button>
              </form>
            </GameCardContent>
          </GameCard>
        </motion.div>

        {/* Set Password (for OAuth users) or Change Password Section */}
        <motion.div
          className="w-full max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {!user?.hasPassword ? (
            <SetPassword
              onPasswordSet={() => {
                // Refresh user data to update hasPassword flag
                fetch("/api/auth/me").then(res => res.json()).then(data => setUser(data.user));
              }}
            />
          ) : (
            <GameCard>
              <GameCardContent className="p-8 space-y-6">
                <h2
                  className="text-2xl font-bold pixelized"
                  style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
                >
                  Security
                </h2>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <label className="space-y-2">
                    <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      Current Password
                    </span>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <label className="space-y-2">
                      <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                        New Password
                      </span>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Choose something strong"
                        required
                        minLength={8}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                        style={{ color: "rgba(200, 240, 200, 0.85)" }}
                      />
                      <PasswordStrength password={newPassword} />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                        Confirm Password
                      </span>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Retype new password"
                        required
                        minLength={8}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                        style={{ color: "rgba(200, 240, 200, 0.85)" }}
                      />
                    </label>
                  </div>

                  {passwordError && (
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        background: "rgba(180, 60, 60, 0.15)",
                        border: "1px solid rgba(255, 120, 120, 0.3)",
                        color: "rgba(255, 180, 180, 0.95)",
                        textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
                        fontSize: "12px",
                        fontFamily: '"Press Start 2P", monospace',
                      }}
                    >
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        background: "rgba(100, 200, 100, 0.15)",
                        border: "1px solid rgba(150, 240, 150, 0.3)",
                        color: "rgba(180, 240, 180, 0.95)",
                        textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
                        fontSize: "12px",
                        fontFamily: '"Press Start 2P", monospace',
                      }}
                    >
                      ✓ {passwordSuccess}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isSavingSecurity}
                    className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
                      border: "1px solid rgba(200, 240, 200, 0.3)",
                      color: "rgba(200, 240, 200, 0.95)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    }}
                    whileHover={!isSavingSecurity ? { scale: 1.02 } : {}}
                    whileTap={!isSavingSecurity ? { scale: 0.98 } : {}}
                  >
                    {isSavingSecurity ? "Updating..." : "Update Password"}
                  </motion.button>
                </form>
              </GameCardContent>
            </GameCard>
          )}
        </motion.div>

        <motion.div
          className="w-full max-w-4xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <GameCard>
            <GameCardContent className="p-8 space-y-6">
              <h2
                className="text-2xl font-bold pixelized"
                style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
              >
                Communication Preferences
              </h2>

              <form onSubmit={handleCommunicationSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={acceptCollabRequests}
                        onChange={(event) => setAcceptCollabRequests(event.target.checked)}
                        className="peer w-[18px] h-[18px] rounded-md cursor-pointer appearance-none transition-all"
                        style={{
                          border: "2px solid rgba(180, 220, 180, 0.45)",
                          backgroundColor: acceptCollabRequests ? "rgba(120, 200, 120, 0.75)" : "rgba(100, 180, 100, 0.18)",
                          boxShadow: acceptCollabRequests
                            ? "0 0 12px rgba(120, 200, 120, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)"
                            : "0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.08)",
                        }}
                      />
                      {acceptCollabRequests && (
                        <svg
                          className="absolute w-3.5 h-3.5 pointer-events-none"
                          style={{ color: "rgba(240, 255, 240, 0.98)", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span
                      className="text-sm leading-relaxed select-none"
                      style={{ color: "rgba(200, 240, 200, 0.75)", textShadow: "0 1px 2px rgba(0, 0, 0, 0.4)" }}
                    >
                      Allow other studios to request collaboration introductions
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={receiveLaunchUpdates}
                        onChange={(event) => setReceiveLaunchUpdates(event.target.checked)}
                        className="peer w-[18px] h-[18px] rounded-md cursor-pointer appearance-none transition-all"
                        style={{
                          border: "2px solid rgba(180, 220, 180, 0.45)",
                          backgroundColor: receiveLaunchUpdates ? "rgba(120, 200, 120, 0.75)" : "rgba(100, 180, 100, 0.18)",
                          boxShadow: receiveLaunchUpdates
                            ? "0 0 12px rgba(120, 200, 120, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)"
                            : "0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.08)",
                        }}
                      />
                      {receiveLaunchUpdates && (
                        <svg
                          className="absolute w-3.5 h-3.5 pointer-events-none"
                          style={{ color: "rgba(240, 255, 240, 0.98)", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span
                      className="text-sm leading-relaxed select-none"
                      style={{ color: "rgba(200, 240, 200, 0.75)", textShadow: "0 1px 2px rgba(0, 0, 0, 0.4)" }}
                    >
                      Receive shader house product updates and launch announcements
                    </span>
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    Preferred Contact Notes
                  </span>
                  <textarea
                    rows={3}
                    value={preferredContactNotes}
                    onChange={(e) => setPreferredContactNotes(e.target.value)}
                    placeholder="Let other studios know how to reach you, or any constraints around collaboration."
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm resize-none"
                    style={{ color: "rgba(200, 240, 200, 0.85)" }}
                  />
                  <p className="text-xs text-right" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                    {preferredContactNotes.length} / 500
                  </p>
                </label>

                {communicationError && (
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      background: "rgba(180, 60, 60, 0.15)",
                      border: "1px solid rgba(255, 120, 120, 0.3)",
                      color: "rgba(255, 180, 180, 0.95)",
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
                      fontSize: "12px",
                      fontFamily: '"Press Start 2P", monospace',
                    }}
                  >
                    {communicationError}
                  </div>
                )}

                {communicationSuccess && (
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      background: "rgba(100, 200, 100, 0.15)",
                      border: "1px solid rgba(150, 240, 150, 0.3)",
                      color: "rgba(180, 240, 180, 0.95)",
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
                      fontSize: "12px",
                      fontFamily: '"Press Start 2P", monospace',
                    }}
                  >
                    ✓ {communicationSuccess}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={isSavingCommunication}
                  className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
                    border: "1px solid rgba(200, 240, 200, 0.3)",
                    color: "rgba(200, 240, 200, 0.95)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                  whileHover={!isSavingCommunication ? { scale: 1.02 } : {}}
                  whileTap={!isSavingCommunication ? { scale: 0.98 } : {}}
                >
                  {isSavingCommunication ? "Saving..." : "Save Communication Preferences"}
                </motion.button>
              </form>
            </GameCardContent>
          </GameCard>
        </motion.div>

        {/* Payout Settings Section */}
        <motion.div
          className="w-full max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <GameCard>
            <GameCardContent className="p-8 space-y-6">
              <h2
                className="text-2xl font-bold pixelized"
                style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
              >
                Payout Settings
              </h2>
              <p
                className="text-sm"
                style={{ color: "rgba(200, 240, 200, 0.65)" }}
              >
                Connect your bank account to receive payments from game sales and tips. You'll earn <strong style={{ color: "rgba(150, 255, 150, 0.95)" }}>85%</strong> from game sales and <strong style={{ color: "rgba(150, 255, 150, 0.95)" }}>85%</strong> from tips.
              </p>
              <StripeConnectSetup />
            </GameCardContent>
          </GameCard>
        </motion.div>

        {/* Email Change Section */}
        <motion.div
          className="w-full max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          <EmailChange currentEmail={user?.email || ''} hasPassword={user?.hasPassword ?? false} />
        </motion.div>

        {/* Two-Factor Authentication Section */}
        <motion.div
          className="w-full max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <TwoFactorSetup 
            isEnabled={user?.twoFactorEnabled ?? false} 
            hasPassword={user?.hasPassword ?? false}
            onStatusChange={() => {
              // Refresh user data
              fetch("/api/auth/me").then(res => res.json()).then(data => setUser(data.user));
            }}
          />
        </motion.div>

        {/* Linked Accounts Section */}
        <motion.div
          className="w-full max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <LinkedAccounts 
            accounts={user?.accounts || []}
            hasPassword={user?.hasPassword ?? false}
            onUnlink={async (accountId, provider) => {
              const res = await fetch("/api/auth/unlink-account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accountId, provider }),
              });
              if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to unlink account");
              }
            }}
            onRefresh={() => {
              fetch("/api/auth/me").then(res => res.json()).then(data => setUser(data.user));
            }}
          />
        </motion.div>

        {/* Session Management Section */}
        <motion.div
          className="w-full max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          <SessionManagement />
        </motion.div>

        {/* Data Export Section */}
        <motion.div
          className="w-full max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <DataExport />
        </motion.div>

        {/* Account Deletion Section */}
        <motion.div
          className="w-full max-w-4xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
        >
          <AccountDeletion userRole={user?.role} />
        </motion.div>
      </motion.main>
    </div>
  );
}
