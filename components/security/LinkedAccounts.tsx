"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Unlink, Shield, AlertTriangle } from "lucide-react";
import { GameCard, GameCardContent } from "@/components/game/GameCard";

interface Account {
  id: string;
  provider: string;
  type: string;
}

interface LinkedAccountsProps {
  accounts: Account[];
  hasPassword: boolean;
  onUnlink: (accountId: string, provider: string) => Promise<void>;
  onRefresh: () => void;
}

const providerIcons: Record<string, { icon: string; color: string; bg: string }> = {
  google: {
    icon: "G",
    color: "rgba(234, 67, 53, 0.95)",
    bg: "rgba(234, 67, 53, 0.15)",
  },
  github: {
    icon: "GH",
    color: "rgba(255, 255, 255, 0.95)",
    bg: "rgba(255, 255, 255, 0.15)",
  },
  discord: {
    icon: "D",
    color: "rgba(88, 101, 242, 0.95)",
    bg: "rgba(88, 101, 242, 0.15)",
  },
};

const getProviderIcon = (provider: string) => {
  switch (provider) {
    case 'google':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      );
    case 'github':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      );
    case 'discord':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      );
    default:
      return null;
  }
};

export function LinkedAccounts({ accounts, hasPassword, onUnlink, onRefresh }: LinkedAccountsProps) {
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUnlink = async (accountId: string, provider: string) => {
    setError("");
    setSuccess("");
    setUnlinkingId(accountId);

    try {
      await onUnlink(accountId, provider);
      setSuccess(`${provider.charAt(0).toUpperCase() + provider.slice(1)} account unlinked`);
      onRefresh();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to unlink account");
    } finally {
      setUnlinkingId(null);
    }
  };

  const canUnlink = hasPassword || accounts.length > 1;

  const availableProviders = ['google', 'github', 'discord'].filter(
    p => !accounts.some(a => a.provider === p)
  );

  return (
    <GameCard>
      <GameCardContent className="p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link2 size={24} style={{ color: "rgba(180, 220, 180, 0.9)" }} />
          <h2
            className="text-2xl font-bold pixelized"
            style={{
              textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
              color: "rgba(180, 220, 180, 0.95)",
            }}
          >
            Linked Accounts
          </h2>
        </div>

        <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.65)" }}>
          Connect your accounts to enable quick sign-in with your favorite providers.
        </p>

        {/* Warning if no password and only one account */}
        {!hasPassword && accounts.length <= 1 && (
          <div
            className="p-4 rounded-lg flex items-start gap-3"
            style={{
              background: "rgba(240, 180, 60, 0.15)",
              border: "1px solid rgba(240, 180, 60, 0.3)",
            }}
          >
            <AlertTriangle size={20} style={{ color: "rgba(240, 200, 100, 0.95)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "rgba(240, 220, 150, 0.95)" }}>
                Set a password to unlink accounts
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(240, 220, 150, 0.7)" }}>
                You need at least one way to sign in. Add a password before unlinking your only connected account.
              </p>
            </div>
          </div>
        )}

        {/* Connected Accounts */}
        <div className="space-y-3">
          <p className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
            Connected
          </p>
          
          {accounts.length === 0 ? (
            <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
              No accounts linked yet.
            </p>
          ) : (
            accounts.map((account) => {
              const provider = providerIcons[account.provider] || {
                icon: account.provider[0].toUpperCase(),
                color: "rgba(200, 240, 200, 0.95)",
                bg: "rgba(200, 240, 200, 0.15)",
              };

              return (
                <motion.div
                  key={account.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: provider.bg }}
                    >
                      {getProviderIcon(account.provider)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold capitalize" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                        {account.provider}
                      </p>
                      <p className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                        Connected via OAuth
                      </p>
                    </div>
                  </div>

                  <motion.button
                    onClick={() => handleUnlink(account.id, account.provider)}
                    disabled={!canUnlink || unlinkingId === account.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 justify-center sm:justify-start"
                    style={{
                      background: canUnlink ? "rgba(200, 80, 80, 0.2)" : "rgba(100, 100, 100, 0.1)",
                      border: "1px solid rgba(200, 80, 80, 0.3)",
                      color: canUnlink ? "rgba(255, 180, 180, 0.95)" : "rgba(200, 200, 200, 0.5)",
                    }}
                    whileHover={canUnlink ? { scale: 1.02 } : {}}
                    whileTap={canUnlink ? { scale: 0.98 } : {}}
                  >
                    <Unlink size={14} />
                    {unlinkingId === account.id ? "Unlinking..." : "Unlink"}
                  </motion.button>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Available Providers */}
        {availableProviders.length > 0 && (
          <div className="space-y-3 pt-4 border-t" style={{ borderColor: "rgba(200, 240, 200, 0.1)" }}>
            <p className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
              Available to Connect
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              {availableProviders.map((provider) => {
                return (
                  <motion.a
                    key={provider}
                    href={`/api/auth/oauth/${provider}`}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(200, 240, 200, 0.2)',
                      color: 'rgba(200, 240, 200, 0.9)',
                    }}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {getProviderIcon(provider)}
                    <span>Continue with {provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
                  </motion.a>
                );
              })}
            </div>
          </div>
        )}

        {/* Security note */}
        <div
          className="p-4 rounded-lg flex items-start gap-3"
          style={{
            background: "rgba(100, 200, 100, 0.1)",
            border: "1px solid rgba(100, 200, 100, 0.2)",
          }}
        >
          <Shield size={18} style={{ color: "rgba(150, 240, 150, 0.9)", flexShrink: 0, marginTop: 2 }} />
          <p className="text-xs" style={{ color: "rgba(180, 240, 180, 0.8)" }}>
            Linking multiple accounts provides backup login options and makes it easier to access your account across devices.
          </p>
        </div>

        {error && (
          <div
            className="p-3 rounded-lg"
            style={{
              background: "rgba(180, 60, 60, 0.15)",
              border: "1px solid rgba(255, 120, 120, 0.3)",
              color: "rgba(255, 180, 180, 0.95)",
              fontSize: "12px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="p-3 rounded-lg"
            style={{
              background: "rgba(100, 200, 100, 0.15)",
              border: "1px solid rgba(150, 240, 150, 0.3)",
              color: "rgba(180, 240, 180, 0.95)",
              fontSize: "12px",
            }}
          >
            {success}
          </div>
        )}
      </GameCardContent>
    </GameCard>
  );
}

