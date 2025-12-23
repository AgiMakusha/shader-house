"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { TrendingUp, Coins } from "lucide-react";

import Particles from "@/components/fx/Particles";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { SubscriptionBadge } from "@/components/subscriptions/SubscriptionBadge";
import { ProfileCardPreview } from "@/components/profile/ProfileCardPreview";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { AccountDeletion } from "@/components/profile/AccountDeletion";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { LinkedAccounts, SessionManagement, TwoFactorSetup, DataExport, EmailChange } from "@/components/security";

export default function GamerSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [wantsDigestNewsletter, setWantsDigestNewsletter] = useState(true);
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [notifyBetaAccess, setNotifyBetaAccess] = useState(true);
  const [notifyFeedbackResponse, setNotifyFeedbackResponse] = useState(true);
  const [notifyGameUpdates, setNotifyGameUpdates] = useState(true);
  const [notifyAchievements, setNotifyAchievements] = useState(true);
  const [notifyDevlogs, setNotifyDevlogs] = useState(true);
  
  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Account Information form fields
  const [displayName, setDisplayName] = useState('');
  const [publicEmail, setPublicEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarImage, setAvatarImage] = useState<string>('');
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');
  
  // Preferences error/success (separate from account)
  const [preferencesError, setPreferencesError] = useState('');
  const [preferencesSuccess, setPreferencesSuccess] = useState('');

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
        
        // Load preferences
        setWantsDigestNewsletter(data.user.wantsDigestNewsletter ?? false);
        
        // Load notification preferences
        setEmailNotifications(data.user.emailNotifications ?? true);
        setInAppNotifications(data.user.inAppNotifications ?? true);
        setNotifyBetaAccess(data.user.notifyBetaAccess ?? true);
        setNotifyFeedbackResponse(data.user.notifyFeedbackResponse ?? true);
        setNotifyGameUpdates(data.user.notifyGameUpdates ?? true);
        setNotifyAchievements(data.user.notifyAchievements ?? true);
        setNotifyDevlogs(data.user.notifyDevlogs ?? true);
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const getPlanName = (tier: string) => {
    switch (tier) {
      case 'CREATOR_SUPPORT':
        return 'Creator Support Pass';
      case 'GAMER_PRO':
        return 'Gamer Pro Pass';
      case 'FREE':
      default:
        return 'Free Access';
    }
  };

  const getPlanPrice = (tier: string) => {
    switch (tier) {
      case 'CREATOR_SUPPORT':
        return '$14.99 / month';
      case 'GAMER_PRO':
        return '$14.99 / month';
      case 'FREE':
      default:
        return '$0';
    }
  };

  const membershipDetails = {
    plan: user ? getPlanName(user.subscriptionTier) : "Free Access",
    price: user ? getPlanPrice(user.subscriptionTier) : "Free",
    status: user?.subscriptionStatus === 'ACTIVE' ? "Active" : user?.subscriptionTier === 'FREE' ? 'Free' : 'Inactive',
    renews: user?.subscriptionTier === 'FREE' ? 'No subscription' : "Renews monthly",
    startedAt: "Member since",
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
      
      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      setPasswordError(error.message || 'Failed to change password. Please try again.');
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handlePreferencesSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPreferences(true);
    setPreferencesError('');
    setPreferencesSuccess('');

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wantsDigestNewsletter,
          // Notification preferences
          emailNotifications,
          inAppNotifications,
          notifyBetaAccess,
          notifyFeedbackResponse,
          notifyGameUpdates,
          notifyAchievements,
          notifyDevlogs,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save preferences');
      }

      // Update user state
      setUser(data.user);
      setPreferencesSuccess('Preferences saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setPreferencesSuccess(''), 3000);
    } catch (error: any) {
      setPreferencesError(error.message || 'Failed to save preferences. Please try again.');
    } finally {
      setIsSavingPreferences(false);
    }
  };

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
      
      // Clear success message after 3 seconds
      setTimeout(() => setAccountSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setAccountError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSavingAccount(false);
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
              Gamer Settings
            </h1>
            <p
              className="mt-2 text-sm pixelized"
              style={{ color: "rgba(200, 240, 200, 0.65)", textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)" }}
            >
              Tune your profile, security, and play preferences here.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            {/* Level & Points */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} style={{ color: "rgba(180, 240, 180, 0.7)" }} />
                <span
                  className="text-sm font-bold pixelized"
                  style={{ color: "rgba(180, 240, 180, 0.9)" }}
                >
                  Lv. {user?.level || 1}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Coins size={14} style={{ color: "rgba(240, 220, 140, 0.7)" }} />
                <span
                  className="text-sm font-bold pixelized"
                  style={{ color: "rgba(240, 220, 140, 0.9)" }}
                >
                  {user?.points || 0}
                </span>
              </div>
            </div>
            <Link
              href="/profile/gamer"
              className="text-xs font-semibold uppercase tracking-[0.2em] hover:underline transition-all"
              style={{ color: "rgba(200, 240, 200, 0.75)" }}
            >
              ← Back to Gamer Hub
            </Link>
          </div>
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
                Membership
              </h2>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-3">
                  {user?.subscriptionTier && <SubscriptionBadge tier={user.subscriptionTier} size="lg" />}
                  <h3
                    className="text-2xl font-bold pixelized"
                    style={{ 
                      textShadow: user?.subscriptionTier === 'FREE' 
                        ? "0 0 8px rgba(140, 240, 140, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)" 
                        : user?.subscriptionTier === 'CREATOR_SUPPORT'
                        ? "0 0 8px rgba(220, 180, 80, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)"
                        : "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", 
                      color: user?.subscriptionTier === 'FREE' 
                        ? "rgba(180, 240, 180, 0.95)" 
                        : user?.subscriptionTier === 'CREATOR_SUPPORT'
                        ? "rgba(240, 220, 140, 0.95)"
                        : "rgba(180, 220, 180, 0.95)" 
                    }}
                  >
                    {membershipDetails.plan}
                  </h3>
                  <p 
                    className="text-lg font-semibold pixelized" 
                    style={{ 
                      color: user?.subscriptionTier === 'FREE' 
                        ? "rgba(180, 255, 180, 0.95)" 
                        : user?.subscriptionTier === 'CREATOR_SUPPORT'
                        ? "rgba(255, 240, 180, 0.95)"
                        : "rgba(150, 250, 150, 0.9)" 
                    }}
                  >
                    {membershipDetails.price}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                      Status
                    </p>
                    <p 
                      className="text-base font-semibold" 
                      style={{ 
                        color: user?.subscriptionTier === 'FREE' 
                          ? "rgba(180, 255, 180, 0.95)" 
                          : user?.subscriptionTier === 'CREATOR_SUPPORT'
                          ? "rgba(255, 240, 180, 0.95)"
                          : "rgba(150, 250, 150, 0.95)" 
                      }}
                    >
                      ✓ {membershipDetails.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                      Billing
                    </p>
                    <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                      {membershipDetails.renews}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                      {membershipDetails.startedAt}
                    </p>
                    <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                      Manage Plan
                    </p>
                    <Link
                      href="/profile/gamer/subscription"
                      className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide hover:underline transition-all"
                      style={{ 
                        color: user?.subscriptionTier === 'FREE' 
                          ? "rgba(180, 255, 180, 0.95)" 
                          : user?.subscriptionTier === 'CREATOR_SUPPORT'
                          ? "rgba(255, 240, 180, 0.95)"
                          : "rgba(150, 250, 150, 0.9)" 
                      }}
                    >
                      View subscription →
                    </Link>
                  </div>
                </div>
              </div>
            </GameCardContent>
          </GameCard>
        </motion.div>

        <motion.div
          className="w-full max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.27 }}
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
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                    Account Status
                  </p>
                  <p className="text-base font-semibold" style={{ color: "rgba(150, 250, 150, 0.95)" }}>
                    ✓ Active
                  </p>
                </div>
              </div>
            </GameCardContent>
          </GameCard>
        </motion.div>

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
                      placeholder="ShaderGamer"
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
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    Bio
                  </span>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share your favourite playstyle, current goals, or anything else other gamers should know."
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
          transition={{ duration: 0.6, delay: 0.4 }}
        >
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
        </motion.div>

        <motion.div
          className="w-full max-w-4xl mb-12"
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
                Preferences
              </h2>

              <form onSubmit={handlePreferencesSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={wantsDigestNewsletter}
                        onChange={(event) => setWantsDigestNewsletter(event.target.checked)}
                        className="peer w-[18px] h-[18px] rounded-md cursor-pointer appearance-none transition-all"
                        style={{
                          border: "2px solid rgba(180, 220, 180, 0.45)",
                          backgroundColor: wantsDigestNewsletter ? "rgba(120, 200, 120, 0.75)" : "rgba(100, 180, 100, 0.18)",
                          boxShadow: wantsDigestNewsletter
                            ? "0 0 12px rgba(120, 200, 120, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)"
                            : "0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.08)",
                        }}
                      />
                      {wantsDigestNewsletter && (
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
                      Sign me up for the Shader House digest newsletter
                    </span>
                  </label>
                </div>

                {/* Notification Preferences Section */}
                <div className="pt-6 border-t" style={{ borderColor: "rgba(200, 240, 200, 0.2)" }}>
                  <h3
                    className="text-lg font-bold mb-4 pixelized"
                    style={{ color: "rgba(180, 220, 180, 0.95)", textShadow: "0 0 6px rgba(120, 200, 120, 0.5)" }}
                  >
                    Notification Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={(e) => setEmailNotifications(e.target.checked)}
                            className="peer w-[18px] h-[18px] rounded-md cursor-pointer appearance-none transition-all"
                            style={{
                              border: "2px solid rgba(180, 220, 180, 0.45)",
                              backgroundColor: emailNotifications ? "rgba(120, 200, 120, 0.75)" : "rgba(100, 180, 100, 0.18)",
                              boxShadow: emailNotifications
                                ? "0 0 12px rgba(120, 200, 120, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)"
                                : "0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.08)",
                            }}
                          />
                          {emailNotifications && (
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
                        <span className="text-sm leading-relaxed select-none" style={{ color: "rgba(200, 240, 200, 0.75)" }}>
                          Email notifications
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={inAppNotifications}
                            onChange={(e) => setInAppNotifications(e.target.checked)}
                            className="peer w-[18px] h-[18px] rounded-md cursor-pointer appearance-none transition-all"
                            style={{
                              border: "2px solid rgba(180, 220, 180, 0.45)",
                              backgroundColor: inAppNotifications ? "rgba(120, 200, 120, 0.75)" : "rgba(100, 180, 100, 0.18)",
                              boxShadow: inAppNotifications
                                ? "0 0 12px rgba(120, 200, 120, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)"
                                : "0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.08)",
                            }}
                          />
                          {inAppNotifications && (
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
                        <span className="text-sm leading-relaxed select-none" style={{ color: "rgba(200, 240, 200, 0.75)" }}>
                          In-app notifications
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={notifyBetaAccess}
                            onChange={(e) => setNotifyBetaAccess(e.target.checked)}
                            className="peer w-[18px] h-[18px] rounded-md cursor-pointer appearance-none transition-all"
                            style={{
                              border: "2px solid rgba(180, 220, 180, 0.45)",
                              backgroundColor: notifyBetaAccess ? "rgba(120, 200, 120, 0.75)" : "rgba(100, 180, 100, 0.18)",
                              boxShadow: notifyBetaAccess
                                ? "0 0 12px rgba(120, 200, 120, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)"
                                : "0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.08)",
                            }}
                          />
                          {notifyBetaAccess && (
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
                        <span className="text-sm leading-relaxed select-none" style={{ color: "rgba(200, 240, 200, 0.75)" }}>
                          Beta access granted
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={notifyFeedbackResponse}
                            onChange={(e) => setNotifyFeedbackResponse(e.target.checked)}
                            className="peer w-[18px] h-[18px] rounded-md cursor-pointer appearance-none transition-all"
                            style={{
                              border: "2px solid rgba(180, 220, 180, 0.45)",
                              backgroundColor: notifyFeedbackResponse ? "rgba(120, 200, 120, 0.75)" : "rgba(100, 180, 100, 0.18)",
                              boxShadow: notifyFeedbackResponse
                                ? "0 0 12px rgba(120, 200, 120, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)"
                                : "0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.08)",
                            }}
                          />
                          {notifyFeedbackResponse && (
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
                        <span className="text-sm leading-relaxed select-none" style={{ color: "rgba(200, 240, 200, 0.75)" }}>
                          Developer responds to feedback
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={notifyGameUpdates}
                            onChange={(e) => setNotifyGameUpdates(e.target.checked)}
                            className="peer w-[18px] h-[18px] rounded-md cursor-pointer appearance-none transition-all"
                            style={{
                              border: "2px solid rgba(180, 220, 180, 0.45)",
                              backgroundColor: notifyGameUpdates ? "rgba(120, 200, 120, 0.75)" : "rgba(100, 180, 100, 0.18)",
                              boxShadow: notifyGameUpdates
                                ? "0 0 12px rgba(120, 200, 120, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)"
                                : "0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.08)",
                            }}
                          />
                          {notifyGameUpdates && (
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
                        <span className="text-sm leading-relaxed select-none" style={{ color: "rgba(200, 240, 200, 0.75)" }}>
                          Game updates & changelogs
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={notifyAchievements}
                            onChange={(e) => setNotifyAchievements(e.target.checked)}
                            className="peer w-[18px] h-[18px] rounded-md cursor-pointer appearance-none transition-all"
                            style={{
                              border: "2px solid rgba(180, 220, 180, 0.45)",
                              backgroundColor: notifyAchievements ? "rgba(120, 200, 120, 0.75)" : "rgba(100, 180, 100, 0.18)",
                              boxShadow: notifyAchievements
                                ? "0 0 12px rgba(120, 200, 120, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)"
                                : "0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.08)",
                            }}
                          />
                          {notifyAchievements && (
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
                        <span className="text-sm leading-relaxed select-none" style={{ color: "rgba(200, 240, 200, 0.75)" }}>
                          Achievement unlocks
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={notifyDevlogs}
                            onChange={(e) => setNotifyDevlogs(e.target.checked)}
                            className="peer w-[18px] h-[18px] rounded-md cursor-pointer appearance-none transition-all"
                            style={{
                              border: "2px solid rgba(180, 220, 180, 0.45)",
                              backgroundColor: notifyDevlogs ? "rgba(120, 200, 120, 0.75)" : "rgba(100, 180, 100, 0.18)",
                              boxShadow: notifyDevlogs
                                ? "0 0 12px rgba(120, 200, 120, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)"
                                : "0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.08)",
                            }}
                          />
                          {notifyDevlogs && (
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
                        <span className="text-sm leading-relaxed select-none" style={{ color: "rgba(200, 240, 200, 0.75)" }}>
                          Developer devlogs & updates
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {preferencesError && (
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
                    {preferencesError}
                  </div>
                )}

                {preferencesSuccess && (
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
                    ✓ {preferencesSuccess}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={isSavingPreferences}
                  className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
                    border: "1px solid rgba(200, 240, 200, 0.3)",
                    color: "rgba(200, 240, 200, 0.95)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                  whileHover={!isSavingPreferences ? { scale: 1.02 } : {}}
                  whileTap={!isSavingPreferences ? { scale: 0.98 } : {}}
                >
                  {isSavingPreferences ? "Saving..." : "Save Preferences"}
                </motion.button>
              </form>
            </GameCardContent>
          </GameCard>
        </motion.div>

        {/* Email Change Section */}
        <motion.div
          className="w-full max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <EmailChange currentEmail={user?.email || ''} hasPassword={user?.hasPassword ?? false} />
        </motion.div>

        {/* Two-Factor Authentication Section */}
        <motion.div
          className="w-full max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
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
          transition={{ duration: 0.6, delay: 0.7 }}
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
          transition={{ duration: 0.6, delay: 0.75 }}
        >
          <SessionManagement />
        </motion.div>

        {/* Data Export Section */}
        <motion.div
          className="w-full max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <DataExport />
        </motion.div>

        {/* Account Deletion Section */}
        <motion.div
          className="w-full max-w-4xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
        >
          <AccountDeletion userRole={user?.role} />
        </motion.div>
      </motion.main>
    </div>
  );
}
