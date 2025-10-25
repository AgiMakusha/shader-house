"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { GameIcon } from "@/components/game/GameIcon";
import { BuildTools, GameController } from "@/components/icons";
import Particles from "@/components/fx/Particles";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useAudio } from "@/components/audio/AudioProvider";
import { checkIndieEligibility, INDIE_POLICY, FIELD_TOOLTIPS } from "@/lib/indie/eligibility";
import OAuthButtons from "@/components/auth/OAuthButtons";

type DeveloperType = "INDIE" | "STUDIO";
type CompanyType = "NONE" | "SOLE_PROP" | "LLC" | "CORP";
type FundingSource = "SELF" | "CROWDFUND" | "ANGEL" | "VC" | "MAJOR_PUBLISHER";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { play } = useAudio();
  
  // Get role from URL params (e.g., /signup?role=developer or /signup?role=gamer)
  const role = (searchParams.get("role") as "developer" | "gamer") || "developer";
  const isDeveloper = role === "developer";
  
  // Basic fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Developer profile fields
  const [developerType, setDeveloperType] = useState<DeveloperType | "">("");
  const [teamSize, setTeamSize] = useState("");
  const [hasPublisher, setHasPublisher] = useState<boolean | null>(null);
  const [ownsIP, setOwnsIP] = useState<boolean | null>(null);
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [companyType, setCompanyType] = useState<CompanyType | "">("");
  const [evidenceLinks, setEvidenceLinks] = useState<string[]>([""]);
  const [attestIndie, setAttestIndie] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showIndiePolicy, setShowIndiePolicy] = useState(false);

  // Check indie eligibility whenever relevant fields change
  useEffect(() => {
    if (teamSize && hasPublisher !== null && ownsIP !== null && companyType) {
      const eligibility = checkIndieEligibility({
        teamSize: parseInt(teamSize) || 0,
        hasPublisher,
        ownsIP,
        companyType: companyType as CompanyType,
        fundingSources,
      });
      
      setWarnings(eligibility.warnings);
    }
  }, [teamSize, hasPublisher, ownsIP, companyType, fundingSources]);

  const toggleFundingSource = (source: FundingSource) => {
    setFundingSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const addEvidenceLink = () => {
    if (evidenceLinks.length < 5) {
      setEvidenceLinks([...evidenceLinks, ""]);
    }
  };

  const removeEvidenceLink = (index: number) => {
    setEvidenceLinks(evidenceLinks.filter((_, i) => i !== index));
  };

  const updateEvidenceLink = (index: number, value: string) => {
    const newLinks = [...evidenceLinks];
    newLinks[index] = value;
    setEvidenceLinks(newLinks);
  };

  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    
    // Basic fields
    if (!name.trim()) newErrors.name = "Your name is required";
    else if (name.trim().length < 2) newErrors.name = "Name should be at least 2 characters";
    
    if (!email.trim()) newErrors.email = "Your email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email";
    
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
    
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    
    // Developer profile fields (only validate if developer)
    if (!isDeveloper) {
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
    if (!developerType) newErrors.developerType = "Please select your developer type";
    
    if (!teamSize) newErrors.teamSize = "Team size is required";
    else if (parseInt(teamSize) < 0) newErrors.teamSize = "Team size cannot be negative";
    else if (parseInt(teamSize) > 500) newErrors.teamSize = "Team size cannot exceed 500";
    
    if (hasPublisher === null) newErrors.hasPublisher = "Please indicate if you have a publisher";
    if (ownsIP === null) newErrors.ownsIP = "Please indicate if you own your IP";
    
    if (fundingSources.length === 0) newErrors.fundingSources = "Please select at least one funding source";
    
    if (!companyType) newErrors.companyType = "Please select your company type";
    
    // Validate evidence links
    const validLinks = evidenceLinks.filter(link => link.trim());
    if (validLinks.length === 0) {
      newErrors.evidenceLinks = "Please provide at least one evidence link";
    } else {
      const invalidLinks = validLinks.filter(link => {
        try {
          new URL(link);
          return false;
        } catch {
          return true;
        }
      });
      if (invalidLinks.length > 0) {
        newErrors.evidenceLinks = "Please enter valid URLs";
      }
    }
    
    if (!attestIndie) {
      newErrors.attestIndie = "You must attest to meet the indie criteria";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateFields()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const payload: any = {
        name,
        email,
        password,
        confirmPassword,
        role,
      };
      
      // Only include developer profile if role is developer
      if (isDeveloper) {
        const validLinks = evidenceLinks.filter(link => link.trim());
        payload.developerProfile = {
          developerType,
          teamSize: parseInt(teamSize),
          hasPublisher,
          ownsIP,
          fundingSources,
          companyType,
          evidenceLinks: validLinks,
          attestIndie,
        };
      }
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details?.fieldErrors) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(data.details.fieldErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              fieldErrors[field] = messages[0];
            }
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: data.error || "Registration failed" });
        }
        setIsLoading(false);
        return;
      }

      // Success!
      play("door");
      setTimeout(() => {
        if (role === "developer") {
          router.push("/register/developer");
        } else {
          router.push("/register/gamer");
        }
      }, 300);

    } catch (err) {
      console.error("Registration error:", err);
      setErrors({ general: "An unexpected error occurred" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />
      
      <motion.main 
        className="relative z-10 flex min-h-dvh flex-col items-center justify-center p-6 py-12"
        initial={{ opacity: 0, y: 6 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
        }}
      >
        <div className="w-full max-w-2xl min-w-[672px] space-y-6">
          {/* Logo/Icon */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <GameIcon size={72} glow rounded={false} aria-hidden>
              {isDeveloper ? (
                <BuildTools className="w-2/3 h-2/3 icon-ink" title="Developer" />
              ) : (
                <GameController className="w-3/4 h-3/4 icon-ink" title="Gamer" />
              )}
            </GameIcon>
          </motion.div>

          {/* Title */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 
              className="text-3xl font-bold tracking-wider uppercase pixelized mb-2"
              style={{
                textShadow: `
                  0 0 10px rgba(100, 200, 100, 0.6),
                  0 0 20px rgba(80, 160, 80, 0.4),
                  2px 2px 0px rgba(0, 0, 0, 0.8)
                `,
                color: 'rgba(150, 250, 150, 0.95)',
              }}
            >
              {isDeveloper ? "Developer Registration" : "Gamer Registration"}
            </h1>
            <p
              className="text-sm font-semibold tracking-wide uppercase pixelized"
              style={{
                textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                color: 'rgba(200, 240, 200, 0.8)',
              }}
            >
              {isDeveloper ? "Join the indie community" : "Join the gaming community"}
            </p>
          </motion.div>

          {/* Indie Policy Banner (only for developers) */}
          {isDeveloper && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <div 
                className="p-4 rounded-lg border cursor-pointer"
                style={{
                  background: 'rgba(100, 200, 100, 0.1)',
                  borderColor: 'rgba(200, 240, 200, 0.3)',
                }}
                onClick={() => setShowIndiePolicy(!showIndiePolicy)}
              >
              <div className="flex items-center justify-between">
                <h3 
                  className="text-sm font-semibold"
                  style={{ color: 'rgba(200, 240, 200, 0.95)' }}
                >
                  {INDIE_POLICY.title}
                </h3>
                <motion.svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                  animate={{ rotate: showIndiePolicy ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </div>
              
              <AnimatePresence>
                {showIndiePolicy && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ul className="mt-3 space-y-1 text-xs" style={{ color: 'rgba(200, 240, 200, 0.8)' }}>
                      {INDIE_POLICY.criteria.map((criterion, i) => (
                        <li key={i} className="flex items-start">
                          <span className="mr-2">✓</span>
                          <span>{criterion}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs italic" style={{ color: 'rgba(200, 240, 200, 0.7)' }}>
                      {INDIE_POLICY.note}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          )}

          {/* Registration Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GameCard>
              <GameCardContent className="p-8 w-full items-stretch text-left">
                <form onSubmit={handleSubmit} noValidate className="space-y-6 w-full">
                  {/* Basic Information Section */}
                  <div className="space-y-4">
                    <h2 
                      className="text-lg font-semibold border-b pb-2"
                      style={{ 
                        color: 'rgba(200, 240, 200, 0.95)',
                        borderColor: 'rgba(200, 240, 200, 0.2)',
                      }}
                    >
                      Basic Information
                    </h2>

                    {/* Name */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                        }}
                        className={`w-full px-4 py-3 rounded-lg bg-white/10 border placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-sm ${
                          errors.name ? 'border-red-500/50 focus:ring-red-500/40' : 'border-white/20 focus:ring-white/40'
                        }`}
                        style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                        placeholder="Your name"
                        disabled={isLoading}
                      />
                      {errors.name && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs mt-1.5 px-1"
                          style={{ color: 'rgba(255, 180, 180, 0.9)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)' }}
                        >
                          {errors.name}
                        </motion.p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                        }}
                        className={`w-full px-4 py-3 rounded-lg bg-white/10 border placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-sm ${
                          errors.email ? 'border-red-500/50 focus:ring-red-500/40' : 'border-white/20 focus:ring-white/40'
                        }`}
                        style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                        placeholder="your@email.com"
                        disabled={isLoading}
                      />
                      {errors.email && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs mt-1.5 px-1"
                          style={{ color: 'rgba(255, 180, 180, 0.9)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)' }}
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                        }}
                        className={`w-full px-4 py-3 rounded-lg bg-white/10 border placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-sm ${
                          errors.password ? 'border-red-500/50 focus:ring-red-500/40' : 'border-white/20 focus:ring-white/40'
                        }`}
                        style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                      {errors.password && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs mt-1.5 px-1"
                          style={{ color: 'rgba(255, 180, 180, 0.9)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)' }}
                        >
                          {errors.password}
                        </motion.p>
                      )}
                      <PasswordStrength password={password} className="mt-2" />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                        Confirm Password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                        }}
                        className={`w-full px-4 py-3 rounded-lg bg-white/10 border placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-sm ${
                          errors.confirmPassword ? 'border-red-500/50 focus:ring-red-500/40' : 'border-white/20 focus:ring-white/40'
                        }`}
                        style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                      {errors.confirmPassword && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs mt-1.5 px-1"
                          style={{ color: 'rgba(255, 180, 180, 0.9)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)' }}
                        >
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Developer Profile Section (only for developers) */}
                  {isDeveloper && (
                    <div className="space-y-4">
                      <h2 
                        className="text-lg font-semibold border-b pb-2"
                        style={{ 
                          color: 'rgba(200, 240, 200, 0.95)',
                          borderColor: 'rgba(200, 240, 200, 0.2)',
                        }}
                      >
                        Developer Profile
                      </h2>

                    {/* Developer Type */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                        Developer Type
                        <InfoTooltip content={FIELD_TOOLTIPS.developerType} />
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setDeveloperType("INDIE");
                            if (errors.developerType) setErrors(prev => ({ ...prev, developerType: undefined }));
                          }}
                          disabled={isLoading}
                          className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                            developerType === "INDIE"
                              ? 'bg-white/20 border-2 border-white/40 text-white'
                              : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          Indie
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeveloperType("STUDIO");
                            if (errors.developerType) setErrors(prev => ({ ...prev, developerType: undefined }));
                          }}
                          disabled={isLoading}
                          className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                            developerType === "STUDIO"
                              ? 'bg-white/20 border-2 border-white/40 text-white'
                              : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          Studio
                        </button>
                      </div>
                      {errors.developerType && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs mt-1.5 px-1"
                          style={{ color: 'rgba(255, 180, 180, 0.9)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)' }}
                        >
                          {errors.developerType}
                        </motion.p>
                      )}
                    </div>

                    {/* Team Size */}
                    <div className="space-y-2">
                      <label htmlFor="teamSize" className="block text-sm font-medium" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                        Team Size
                        <InfoTooltip content={FIELD_TOOLTIPS.teamSize} />
                      </label>
                      <input
                        id="teamSize"
                        type="number"
                        min="0"
                        max="500"
                        value={teamSize}
                        onChange={(e) => {
                          setTeamSize(e.target.value);
                          if (errors.teamSize) setErrors(prev => ({ ...prev, teamSize: undefined }));
                        }}
                        className={`w-full px-4 py-3 rounded-lg bg-white/10 border placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-sm ${
                          errors.teamSize ? 'border-red-500/50 focus:ring-red-500/40' : 'border-white/20 focus:ring-white/40'
                        }`}
                        style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                        placeholder="e.g., 5"
                        disabled={isLoading}
                      />
                      {errors.teamSize && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs mt-1.5 px-1"
                          style={{ color: 'rgba(255, 180, 180, 0.9)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)' }}
                        >
                          {errors.teamSize}
                        </motion.p>
                      )}
                    </div>

                    {/* Has Publisher */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                        Do you have a major publisher?
                        <InfoTooltip content={FIELD_TOOLTIPS.hasPublisher} />
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setHasPublisher(false);
                            if (errors.hasPublisher) setErrors(prev => ({ ...prev, hasPublisher: undefined }));
                          }}
                          disabled={isLoading}
                          className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                            hasPublisher === false
                              ? 'bg-white/20 border-2 border-white/40 text-white'
                              : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          No
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHasPublisher(true);
                            if (errors.hasPublisher) setErrors(prev => ({ ...prev, hasPublisher: undefined }));
                          }}
                          disabled={isLoading}
                          className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                            hasPublisher === true
                              ? 'bg-white/20 border-2 border-white/40 text-white'
                              : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          Yes
                        </button>
                      </div>
                      {errors.hasPublisher && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs mt-1.5 px-1"
                          style={{ color: 'rgba(255, 180, 180, 0.9)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)' }}
                        >
                          {errors.hasPublisher}
                        </motion.p>
                      )}
                    </div>

                    {/* Owns IP */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                        Do you own your IP?
                        <InfoTooltip content={FIELD_TOOLTIPS.ownsIP} />
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setOwnsIP(true);
                            if (errors.ownsIP) setErrors(prev => ({ ...prev, ownsIP: undefined }));
                          }}
                          disabled={isLoading}
                          className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                            ownsIP === true
                              ? 'bg-white/20 border-2 border-white/40 text-white'
                              : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOwnsIP(false);
                            if (errors.ownsIP) setErrors(prev => ({ ...prev, ownsIP: undefined }));
                          }}
                          disabled={isLoading}
                          className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                            ownsIP === false
                              ? 'bg-white/20 border-2 border-white/40 text-white'
                              : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          No
                        </button>
                      </div>
                      {errors.ownsIP && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs mt-1.5 px-1"
                          style={{ color: 'rgba(255, 180, 180, 0.9)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)' }}
                        >
                          {errors.ownsIP}
                        </motion.p>
                      )}
                    </div>

                    {/* Funding Sources */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                        Funding Sources (select all that apply)
                        <InfoTooltip content={FIELD_TOOLTIPS.fundingSources} />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["SELF", "CROWDFUND", "ANGEL", "VC", "MAJOR_PUBLISHER"] as FundingSource[]).map((source) => (
                          <button
                            key={source}
                            type="button"
                            onClick={() => {
                              toggleFundingSource(source);
                              if (errors.fundingSources) setErrors(prev => ({ ...prev, fundingSources: undefined }));
                            }}
                            disabled={isLoading}
                            className={`px-3 py-2 rounded-lg font-medium text-xs transition-all ${
                              fundingSources.includes(source)
                                ? 'bg-white/20 border-2 border-white/40 text-white'
                                : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10'
                            }`}
                          >
                            {source.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                      {errors.fundingSources && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs mt-1.5 px-1"
                          style={{ color: 'rgba(255, 180, 180, 0.9)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)' }}
                        >
                          {errors.fundingSources}
                        </motion.p>
                      )}
                    </div>

                    {/* Company Type */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                        Company Type
                        <InfoTooltip content={FIELD_TOOLTIPS.companyType} />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["NONE", "SOLE_PROP", "LLC", "CORP"] as CompanyType[]).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setCompanyType(type);
                              if (errors.companyType) setErrors(prev => ({ ...prev, companyType: undefined }));
                            }}
                            disabled={isLoading}
                            className={`px-3 py-2 rounded-lg font-medium text-xs transition-all ${
                              companyType === type
                                ? 'bg-white/20 border-2 border-white/40 text-white'
                                : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10'
                            }`}
                          >
                            {type === "NONE" ? "None" : type === "SOLE_PROP" ? "Sole Prop" : type}
                          </button>
                        ))}
                      </div>
                      {errors.companyType && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs mt-1.5 px-1"
                          style={{ color: 'rgba(255, 180, 180, 0.9)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)' }}
                        >
                          {errors.companyType}
                        </motion.p>
                      )}
                    </div>

                    {/* Evidence Links */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                        Evidence Links (1-5 URLs)
                        <InfoTooltip content={FIELD_TOOLTIPS.evidenceLinks} />
                      </label>
                      <div className="space-y-2">
                        {evidenceLinks.map((link, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="url"
                              value={link}
                              onChange={(e) => {
                                updateEvidenceLink(index, e.target.value);
                                if (errors.evidenceLinks) setErrors(prev => ({ ...prev, evidenceLinks: undefined }));
                              }}
                              className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all backdrop-blur-sm"
                              style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                              placeholder="https://..."
                              disabled={isLoading}
                            />
                            {evidenceLinks.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeEvidenceLink(index)}
                                disabled={isLoading}
                                className="px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-all"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        {evidenceLinks.length < 5 && (
                          <button
                            type="button"
                            onClick={addEvidenceLink}
                            disabled={isLoading}
                            className="text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 transition-all"
                            style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                          >
                            + Add another link
                          </button>
                        )}
                      </div>
                      {errors.evidenceLinks && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs mt-1.5 px-1"
                          style={{ color: 'rgba(255, 180, 180, 0.9)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)' }}
                        >
                          {errors.evidenceLinks}
                        </motion.p>
                      )}
                    </div>

                    {/* Attestation */}
                    <div className="space-y-2">
                      <label className="flex items-start gap-2.5 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={attestIndie}
                            onChange={(e) => {
                              setAttestIndie(e.target.checked);
                              if (errors.attestIndie) setErrors(prev => ({ ...prev, attestIndie: undefined }));
                            }}
                            className="peer w-[18px] h-[18px] rounded-md cursor-pointer appearance-none transition-all hover:border-[rgba(150,220,150,0.7)]"
                            style={{
                              border: '2px solid rgba(180, 220, 180, 0.45)',
                              backgroundColor: attestIndie ? 'rgba(120, 200, 120, 0.75)' : 'rgba(100, 180, 100, 0.18)',
                              boxShadow: attestIndie 
                                ? '0 0 12px rgba(120, 200, 120, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)'
                                : '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.08)',
                            }}
                            disabled={isLoading}
                          />
                          {attestIndie && (
                            <svg
                              className="absolute w-3.5 h-3.5 pointer-events-none"
                              style={{ color: 'rgba(240, 255, 240, 0.98)', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }}
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
                        <span className="text-sm" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                          I certify that I meet the indie criteria and understand that providing false information may result in account suspension.
                          <InfoTooltip content={FIELD_TOOLTIPS.attestIndie} />
                        </span>
                      </label>
                      {errors.attestIndie && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs mt-1.5 px-1"
                          style={{ color: 'rgba(255, 180, 180, 0.9)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)' }}
                        >
                          {errors.attestIndie}
                        </motion.p>
                      )}
                    </div>
                  </div>
                  )}

                  {/* Warnings (only for developers) */}
                  {isDeveloper && warnings.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg space-y-2"
                      style={{
                        background: 'rgba(220, 180, 60, 0.15)',
                        border: '1px solid rgba(255, 220, 120, 0.3)',
                      }}
                    >
                      <p className="text-sm font-semibold" style={{ color: 'rgba(255, 220, 120, 0.95)' }}>
                        ⚠️ Indie Eligibility Warning
                      </p>
                      {warnings.map((warning, i) => (
                        <p key={i} className="text-xs" style={{ color: 'rgba(255, 220, 120, 0.85)' }}>
                          • {warning}
                        </p>
                      ))}
                    </motion.div>
                  )}

                  {/* General Error */}
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg text-sm text-center"
                      style={{
                        background: 'rgba(180, 60, 60, 0.15)',
                        border: '1px solid rgba(255, 120, 120, 0.3)',
                        color: 'rgba(255, 180, 180, 0.95)',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
                      }}
                    >
                      {errors.general}
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-lg font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)',
                      border: '1px solid rgba(200, 240, 200, 0.3)',
                      color: 'rgba(200, 240, 200, 0.95)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    }}
                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? 'Creating Account...' : isDeveloper ? 'Create Developer Account' : 'Create Gamer Account'}
                  </motion.button>

                  {/* OAuth Buttons */}
                  <OAuthButtons />
                </form>
              </GameCardContent>
            </GameCard>
          </motion.div>

          {/* Sign In Link */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <p className="text-sm" style={{ color: 'rgba(200, 240, 200, 0.7)' }}>
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-semibold hover:underline transition-all"
                style={{ color: 'rgba(200, 240, 200, 0.95)' }}
              >
                Sign in
              </Link>
            </p>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Link 
              href="/" 
              className="text-xs hover:underline transition-all"
              style={{ color: 'rgba(200, 240, 200, 0.5)' }}
            >
              ← Back to home
            </Link>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}

