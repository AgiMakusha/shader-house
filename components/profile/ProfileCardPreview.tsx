"use client";

import { motion } from "framer-motion";
import { Award, TrendingUp, Gamepad2, Heart, FlaskConical, MessageSquare, Crown, Star, Sparkles } from "lucide-react";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { getBadgeName, getBadgeRarity, getBadgeColor, getBadgeIcon, getBadgeDescription, type IconType } from "@/lib/badges/mappings";
import { Avatar } from "@/components/profile/Avatar";

interface ProfileCardPreviewProps {
  displayName?: string | null;
  publicEmail?: string | null;
  bio?: string | null;
  role?: string | null;
  level?: number;
  badges?: string[];
  image?: string | null;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function ProfileCardPreview({
  displayName,
  publicEmail,
  bio,
  role,
  level = 1,
  badges = [],
  image,
  title = "Community Chat Preview",
  subtitle = "How your profile card will appear in community chats",
  compact = false,
}: ProfileCardPreviewProps) {
  const roleDisplay = role ? (role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()) : "User";
  
  // Process badges - ensure we have valid badge strings
  const validBadges = Array.isArray(badges) 
    ? badges.filter(b => b && typeof b === 'string' && b.trim().length > 0)
    : [];
  
  // Debug: log badges to console
  if (typeof window !== 'undefined') {
    console.log('🏆 ProfileCardPreview badges:', badges, 'Type:', Array.isArray(badges), 'Length:', badges?.length);
    console.log('🏆 Valid badges:', validBadges, 'Valid length:', validBadges.length);
  }

  // Render achievement icon (matching achievements page style, icon-only for profile card)
  const renderBadgeIcon = (iconType: IconType | undefined, rarity: string, badgeId?: string) => {
    const colors = getBadgeColor(rarity as 'common' | 'rare' | 'epic' | 'legendary', badgeId);
    const baseColor = colors.text;
    const baseFilter = `drop-shadow(0 0 6px ${colors.text.replace('0.9', '0.5')})`;
    const iconSize = compact ? 16 : 20;
    const smallIconSize = compact ? 5 : 6;

    if (!iconType) {
      return <Star size={iconSize} style={{ color: baseColor, filter: baseFilter }} />;
    }

    switch (iconType) {
      case 'gamepad':
        return (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gamepad2 
              size={iconSize}
              style={{
                color: baseColor,
                filter: baseFilter,
              }}
            />
          </div>
        );
      
      case 'heart':
        return (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart 
              size={compact ? 16 : 18}
              fill={colors.text.replace('0.9', '0.3')}
              style={{
                color: baseColor,
                filter: `drop-shadow(0 0 8px ${colors.text.replace('0.9', '0.6')})`,
              }}
            />
          </div>
        );
      
      case 'flask':
        return (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlaskConical 
              size={compact ? 16 : 18}
              style={{
                color: baseColor,
                filter: baseFilter,
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: compact ? '3px' : '4px',
              width: compact ? '4px' : '6px',
              height: compact ? '4px' : '6px',
              background: colors.text.replace('0.9', '0.4'),
              borderRadius: '50%',
              filter: `blur(2px)`,
            }} />
          </div>
        );
      
      case 'message':
        return (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare 
              size={iconSize}
              style={{
                color: baseColor,
                filter: baseFilter,
              }}
            />
            <Star 
              size={smallIconSize}
              style={{
                position: 'absolute',
                top: compact ? '1px' : '2px',
                right: compact ? '1px' : '2px',
                color: baseColor,
                filter: `drop-shadow(0 0 2px ${colors.text.replace('0.9', '0.8')})`,
              }}
            />
          </div>
        );
      
      case 'crown':
        return (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Crown 
              size={compact ? 18 : 22}
              fill={colors.text.replace('0.9', '0.2')}
              style={{
                color: baseColor,
                filter: `drop-shadow(0 0 8px ${colors.text.replace('0.9', '0.7')}) drop-shadow(0 0 4px ${colors.text.replace('0.9', '0.5')})`,
              }}
            />
            <Sparkles 
              size={smallIconSize}
              style={{
                position: 'absolute',
                top: compact ? '1px' : '2px',
                right: compact ? '1px' : '2px',
                color: colors.text,
                filter: `drop-shadow(0 0 2px ${colors.text.replace('0.9', '0.8')})`,
              }}
            />
          </div>
        );
      
      default:
        return <Star size={iconSize} style={{ color: baseColor, filter: baseFilter }} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={compact ? "" : "mt-6"}
    >
      {(title || subtitle) && (
        <div className="mb-3">
          {title && (
            <h3
              className="text-sm font-semibold pixelized mb-1"
              style={{
                color: "rgba(200, 240, 200, 0.8)",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
              }}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p
              className="text-xs"
              style={{
                color: "rgba(200, 240, 200, 0.6)",
                fontFamily: '"Press Start 2P", monospace',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      <GameCard>
        <GameCardContent className={compact ? "p-4 sm:p-5" : "p-6"}>
          <div className={compact ? "space-y-3" : "space-y-4"}>
            {/* Header with Avatar, Display Name and Level */}
            <div className={`flex items-start justify-between ${compact ? "gap-3" : "gap-4"}`}>
              <div className={`flex items-start flex-1 min-w-0 ${compact ? "gap-2.5" : "gap-3"}`}>
                <Avatar 
                  image={image} 
                  role={role as "DEVELOPER" | "GAMER" | "ADMIN"} 
                  size={compact ? 40 : 48}
                />
                <div className="flex-1 min-w-0">
                  <div className={`flex items-center ${compact ? "gap-1.5" : "gap-2"} mb-1`}>
                    <h4
                      className={`${compact ? "text-base" : "text-lg"} font-bold pixelized truncate`}
                      style={{
                        color: displayName
                          ? "rgba(180, 240, 180, 0.95)"
                          : "rgba(150, 150, 150, 0.6)",
                        textShadow: "0 0 6px rgba(120, 200, 120, 0.4), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                      }}
                    >
                      {displayName || "Display Name"}
                    </h4>
                    <div className="flex items-center gap-1">
                      <TrendingUp size={compact ? 12 : 14} style={{ color: "rgba(180, 240, 180, 0.7)" }} />
                      <span
                        className={`${compact ? "text-[10px]" : "text-xs"} font-bold pixelized`}
                        style={{
                          color: "rgba(180, 240, 180, 0.9)",
                          textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
                        }}
                      >
                        Lv.{level}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`${compact ? "text-[10px]" : "text-xs"} font-semibold pixelized`}
                    style={{
                      color: role === "DEVELOPER" || role === "developer"
                        ? "rgba(220, 180, 100, 0.9)"
                        : "rgba(150, 200, 255, 0.9)",
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
                    }}
                  >
                    {roleDisplay}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Email */}
            {publicEmail && (
              <div className={`${compact ? "pt-2" : "pt-2"} border-t border-white/10`}>
                <p
                  className={`${compact ? "text-[10px]" : "text-xs"} font-medium mb-1`}
                  style={{ color: "rgba(200, 240, 200, 0.6)" }}
                >
                  Contact Email
                </p>
                <p
                  className={`${compact ? "text-xs" : "text-sm"} font-semibold`}
                  style={{
                    color: "rgba(200, 240, 200, 0.9)",
                    wordBreak: "break-all",
                  }}
                >
                  {publicEmail}
                </p>
              </div>
            )}

            {/* Bio */}
            {bio && (
              <div className={publicEmail ? `${compact ? "pt-2" : "pt-2"}` : `${compact ? "pt-2" : "pt-2"} border-t border-white/10`}>
                <p
                  className={`${compact ? "text-[10px]" : "text-xs"} font-medium mb-1`}
                  style={{ color: "rgba(200, 240, 200, 0.6)" }}
                >
                  Bio
                </p>
                <p
                  className={`${compact ? "text-xs" : "text-sm"} leading-relaxed`}
                  style={{
                    color: "rgba(200, 240, 200, 0.85)",
                    wordBreak: "break-word",
                  }}
                >
                  {bio}
                </p>
              </div>
            )}

            {/* Badges - Only show for gamers, not developers */}
            {role !== "DEVELOPER" && role !== "developer" && (
              <>
                {validBadges.length > 0 ? (
                  <div className={`${compact ? "pt-2" : "pt-3"} ${bio || publicEmail ? "border-t border-white/10" : ""}`}>
                    <div className={`flex items-center ${compact ? "gap-1.5 mb-1.5" : "gap-2 mb-2"}`}>
                      <Award size={compact ? 12 : 14} style={{ color: "rgba(180, 240, 180, 0.7)" }} />
                      <p
                        className={`${compact ? "text-[10px]" : "text-xs"} font-semibold pixelized`}
                        style={{
                          color: "rgba(180, 220, 180, 0.9)",
                          textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
                        }}
                      >
                        Badges
                      </p>
                    </div>
                    <div className={`flex flex-wrap ${compact ? "gap-1.5" : "gap-2"}`}>
                      {validBadges.map((badgeId, index) => {
                          // Debug: log badge ID to console
                          if (typeof window !== 'undefined' && index === 0) {
                            console.log('🏆 Rendering badges. First badge ID:', badgeId, 'Type:', typeof badgeId);
                          }
                          
                          const badgeName = getBadgeName(badgeId);
                          const rarity = getBadgeRarity(badgeId) || 'common';
                          const iconType = getBadgeIcon(badgeId);
                          const colors = getBadgeColor(rarity as 'common' | 'rare' | 'epic' | 'legendary', badgeId);
                          
                          return (
                            <div
                              key={`${badgeId}-${index}`}
                              title={`${badgeName}${getBadgeDescription(badgeId) ? `: ${getBadgeDescription(badgeId)}` : ''}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: compact ? "28px" : "32px",
                                height: compact ? "28px" : "32px",
                                borderRadius: "6px",
                                background: colors.bg,
                                border: `1px solid ${colors.border}`,
                                cursor: "default",
                                position: "relative",
                              }}
                            >
                              {renderBadgeIcon(iconType, rarity, badgeId)}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : badges && badges.length > 0 && validBadges.length === 0 ? (
                  // Debug: Show if badges exist but are invalid
                  <div className={`pt-3 ${bio || publicEmail ? "border-t border-white/10" : ""}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Award size={14} style={{ color: "rgba(255, 150, 150, 0.7)" }} />
                      <p
                        className="text-xs font-semibold pixelized"
                        style={{
                          color: "rgba(255, 150, 150, 0.9)",
                          textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
                        }}
                      >
                        Badges (Debug: {badges.length} badge(s) found but invalid format)
                      </p>
                    </div>
                    <div className="text-xs" style={{ color: "rgba(255, 150, 150, 0.7)" }}>
                      Raw badges: {JSON.stringify(badges)}
                    </div>
                  </div>
                ) : null}
              </>
            )}

            {/* Empty State Messages */}
            {!publicEmail && !bio && (role === "DEVELOPER" || role === "developer" || validBadges.length === 0) && (
              <div className="pt-2 border-t border-white/10">
                <p
                  className="text-xs italic"
                  style={{ color: "rgba(200, 240, 200, 0.5)" }}
                >
                  Fill in your profile information above to see it here
                </p>
              </div>
            )}
          </div>
        </GameCardContent>
      </GameCard>
    </motion.div>
  );
}
