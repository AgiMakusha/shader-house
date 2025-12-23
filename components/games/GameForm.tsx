"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Platform, ReleaseStatus } from "@prisma/client";
import { useAudio } from "@/components/audio/AudioProvider";
import { ImageUpload } from "./ImageUpload";
import { GameFileUpload } from "./GameFileUpload";
import { FlaskConical, Rocket, Lightbulb, Sparkles, CheckCircle2, AlertTriangle, Info } from "lucide-react";

interface GameFormProps {
  initialData?: {
    id?: string;
    title: string;
    tagline: string;
    description: string;
    coverUrl: string;
    screenshots: string[];
    priceCents: number;
    platforms: Platform[];
    gameFileUrl: string;
    externalUrl: string;
    releaseStatus: ReleaseStatus;
    tags: string[];
  };
  mode: 'create' | 'edit';
}

const PLATFORM_OPTIONS = [
  { value: Platform.WINDOWS, label: 'Windows' },
  { value: Platform.MAC, label: 'Mac' },
  { value: Platform.LINUX, label: 'Linux' },
  { value: Platform.WEB, label: 'Web' },
  { value: Platform.ANDROID, label: 'Android' },
  { value: Platform.IOS, label: 'iOS' },
];

export function GameForm({ initialData, mode }: GameFormProps) {
  const router = useRouter();
  const { play } = useAudio();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    tagline: initialData?.tagline || '',
    description: initialData?.description || '',
    coverUrl: initialData?.coverUrl || '',
    screenshots: initialData?.screenshots || [''],
    priceCents: initialData?.priceCents || 0,
    platforms: initialData?.platforms || [],
    gameFileUrl: initialData?.gameFileUrl || '',
    externalUrl: initialData?.externalUrl || '',
    releaseStatus: initialData?.releaseStatus || ReleaseStatus.BETA,
    tags: initialData?.tags || [''],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const renderFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg text-sm mt-2 pixelized"
          style={{
            background: 'rgba(180, 60, 60, 0.15)',
            border: '1px solid rgba(255, 120, 120, 0.3)',
            color: 'rgba(255, 180, 180, 0.95)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
          }}
        >
          {errors[fieldName]}
        </motion.div>
      );
    }
    return null;
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleScreenshotChange = (index: number, value: string) => {
    const newScreenshots = [...formData.screenshots];
    newScreenshots[index] = value;
    handleChange('screenshots', newScreenshots);
  };

  const addScreenshot = () => {
    if (formData.screenshots.length < 8) {
      handleChange('screenshots', [...formData.screenshots, '']);
    }
  };

  const removeScreenshot = (index: number) => {
    const newScreenshots = formData.screenshots.filter((_, i) => i !== index);
    handleChange('screenshots', newScreenshots.length > 0 ? newScreenshots : ['']);
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    handleChange('tags', newTags);
  };

  const addTag = () => {
    if (formData.tags.length < 8) {
      handleChange('tags', [...formData.tags, '']);
    }
  };

  const removeTag = (index: number) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    handleChange('tags', newTags.length > 0 ? newTags : ['']);
  };

  const togglePlatform = (platform: Platform) => {
    const newPlatforms = formData.platforms.includes(platform)
      ? formData.platforms.filter(p => p !== platform)
      : [...formData.platforms, platform];
    handleChange('platforms', newPlatforms);
  };

  // RULE 3: Smart handling when switching between file and URL
  const handleGameFileChange = (url: string) => {
    handleChange('gameFileUrl', url);
    
    // Clear the gameFileUrl error if a file is uploaded or if externalUrl is filled
    if ((url && url.trim() !== '') || (formData.externalUrl && formData.externalUrl.trim() !== '')) {
      if (errors.gameFileUrl) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.gameFileUrl;
          return newErrors;
        });
      }
    }
    
    // Optional: Clear external URL when uploading a file
    // Uncomment if you want to enforce single distribution method
    // if (url && formData.externalUrl) {
    //   const shouldClear = window.confirm(
    //     'You uploaded a game file. Do you want to remove the external URL?\n\n' +
    //     '(You can keep both if you want to offer multiple download options)'
    //   );
    //   if (shouldClear) {
    //     handleChange('externalUrl', '');
    //   }
    // }
  };

  const handleExternalUrlChange = (url: string) => {
    handleChange('externalUrl', url);
    
    // Clear the gameFileUrl error if externalUrl is filled or if gameFileUrl is filled
    if ((url && url.trim() !== '') || (formData.gameFileUrl && formData.gameFileUrl.trim() !== '')) {
      if (errors.gameFileUrl) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.gameFileUrl;
          return newErrors;
        });
      }
    }
    
    // Optional: Clear game file when adding external URL
    // Uncomment if you want to enforce single distribution method
    // if (url && formData.gameFileUrl) {
    //   const shouldClear = window.confirm(
    //     'You added an external URL. Do you want to remove the uploaded game file?\n\n' +
    //     '(You can keep both if you want to offer multiple download options)'
    //   );
    //   if (shouldClear) {
    //     handleChange('gameFileUrl', '');
    //   }
    // }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Client-side validation
    const validationErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      validationErrors.title = 'Game title is required';
    }
    
    if (!formData.tagline.trim()) {
      validationErrors.tagline = 'Tagline is required';
    }
    
    if (!formData.description.trim()) {
      validationErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      validationErrors.description = 'Description must be at least 20 characters';
    }
    
    if (!formData.coverUrl.trim()) {
      validationErrors.coverUrl = 'Cover image is required';
    }
    
    if (formData.platforms.length === 0) {
      validationErrors.platforms = 'Please select at least one platform';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      play("error");
      return;
    }

    try {
      // Filter out empty values
      const submitData = {
        ...formData,
        screenshots: formData.screenshots.filter(s => s.trim()),
        tags: formData.tags.filter(t => t.trim()),
        gameFileUrl: formData.gameFileUrl?.trim() || undefined,
        externalUrl: formData.externalUrl?.trim() || undefined,
      };

      const url = mode === 'create' 
        ? '/api/games'
        : `/api/games/${initialData?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors (array format from Zod)
        if (Array.isArray(data)) {
          const fieldErrors: Record<string, string> = {};
          data.forEach((err: any) => {
            const field = err.path?.[0];
            if (field) {
              fieldErrors[field] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsSubmitting(false);
          play("error");
          return; // Don't throw, just return to stop execution
        } else if (data.error) {
          setErrors({ general: data.error });
          setIsSubmitting(false);
          play("error");
          return; // Don't throw, just return to stop execution
        }
        setErrors({ general: 'Failed to save game' });
        setIsSubmitting(false);
        play("error");
        return;
      }

      play("success");
      
      // For new games, redirect to publishing fee payment
      if (mode === 'create' && data.id) {
        router.push(`/dashboard/games/${data.id}/publish`);
      } else {
        router.push(`/games/${data.slug}`);
      }
      router.refresh();
    } catch (error: any) {
      console.error('Error saving game:', error);
      play("error");
      setErrors(prev => ({ ...prev, general: error.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg text-center pixelized"
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

      {/* Basic Info */}
      <div className="space-y-6">
        <h3
          className="text-xl font-bold pixelized"
          style={{
            color: "rgba(180, 220, 180, 0.95)",
            textShadow: "0 0 8px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
          }}
        >
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "rgba(200, 240, 200, 0.7)" }}
            >
              Game Title <span style={{ color: "rgba(250, 100, 100, 0.9)" }}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Pixel Quest"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
              style={{ color: "rgba(200, 240, 200, 0.85)" }}
            />
            {renderFieldError('title')}
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "rgba(200, 240, 200, 0.7)" }}
            >
              Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={(formData.priceCents / 100).toFixed(2)}
              onChange={(e) => handleChange('priceCents', Math.round(parseFloat(e.target.value) * 100))}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              style={{ color: "rgba(200, 240, 200, 0.85)" }}
            />
            <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
              Set to 0 for free games
            </p>
          </div>
        </div>

        {/* Release Status Toggle */}
        <div>
          <label
            className="block text-sm font-medium mb-3"
            style={{ color: "rgba(200, 240, 200, 0.7)" }}
          >
            Release Status <span style={{ color: "rgba(250, 100, 100, 0.9)" }}>*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleChange('releaseStatus', ReleaseStatus.BETA)}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.releaseStatus === ReleaseStatus.BETA ? 'scale-[1.02]' : 'opacity-60'
              }`}
              style={{
                background: formData.releaseStatus === ReleaseStatus.BETA
                  ? "rgba(100, 150, 255, 0.15)"
                  : "rgba(100, 150, 255, 0.05)",
                borderColor: formData.releaseStatus === ReleaseStatus.BETA
                  ? "rgba(150, 180, 255, 0.5)"
                  : "rgba(150, 180, 255, 0.2)",
              }}
            >
              <div className="flex items-center gap-3">
                <FlaskConical 
                  className="w-6 h-6 flex-shrink-0" 
                  style={{ color: "rgba(150, 200, 255, 0.95)" }} 
                />
                <div className="text-left">
                  <div
                    className="text-sm font-bold mb-1 pixelized"
                    style={{ color: "rgba(150, 200, 255, 0.95)" }}
                  >
                    Beta Testing
                  </div>
                  <div className="text-xs" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    Only visible to Pro subscribers for testing
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleChange('releaseStatus', ReleaseStatus.RELEASED)}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.releaseStatus === ReleaseStatus.RELEASED ? 'scale-[1.02]' : 'opacity-60'
              }`}
              style={{
                background: formData.releaseStatus === ReleaseStatus.RELEASED
                  ? "rgba(100, 200, 100, 0.15)"
                  : "rgba(100, 200, 100, 0.05)",
                borderColor: formData.releaseStatus === ReleaseStatus.RELEASED
                  ? "rgba(150, 250, 150, 0.5)"
                  : "rgba(150, 250, 150, 0.2)",
              }}
            >
              <div className="flex items-center gap-3">
                <Rocket 
                  className="w-6 h-6 flex-shrink-0" 
                  style={{ color: "rgba(150, 250, 150, 0.95)" }} 
                />
                <div className="text-left">
                  <div
                    className="text-sm font-bold mb-1 pixelized"
                    style={{ color: "rgba(150, 250, 150, 0.95)" }}
                  >
                    Full Release
                  </div>
                  <div className="text-xs" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    Public marketplace, visible to everyone
                  </div>
                </div>
              </div>
            </button>
          </div>
          <div className="flex items-start gap-2 mt-2">
            {formData.releaseStatus === ReleaseStatus.BETA ? (
              <>
                <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "rgba(150, 200, 255, 0.7)" }} />
                <p className="text-xs" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                  Tip: Start with Beta to test with Pro subscribers, then promote to Full Release when ready
                </p>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "rgba(150, 250, 150, 0.7)" }} />
                <p className="text-xs" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                  Your game will be visible in the public marketplace
                </p>
              </>
            )}
          </div>
          {renderFieldError('releaseStatus')}
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "rgba(200, 240, 200, 0.7)" }}
          >
            Tagline <span style={{ color: "rgba(250, 100, 100, 0.9)" }}>*</span>
          </label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => handleChange('tagline', e.target.value)}
            placeholder="A short, catchy description (max 120 characters)"
            maxLength={120}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
            style={{ color: "rgba(200, 240, 200, 0.85)" }}
          />
          <p className="text-xs mt-1 text-right" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
            {formData.tagline.length} / 120
          </p>
          {renderFieldError('tagline')}
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "rgba(200, 240, 200, 0.7)" }}
          >
            Description <span style={{ color: "rgba(250, 100, 100, 0.9)" }}>*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={8}
            placeholder="Detailed description of your game, gameplay, features, etc."
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm resize-none"
            style={{ color: "rgba(200, 240, 200, 0.85)" }}
          />
          {renderFieldError('description')}
        </div>

        {/* Game File or External Link */}
        <div className="space-y-4">
          <div
            className="p-4 rounded-lg"
            style={{
              background: "rgba(100, 200, 100, 0.05)",
              border: "1px solid rgba(200, 240, 200, 0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <p
                className="text-sm font-semibold"
                style={{ color: "rgba(200, 240, 200, 0.9)" }}
              >
                Game Distribution
              </p>
              {formData.gameFileUrl || formData.externalUrl ? (
                <CheckCircle2 
                  className="w-4 h-4" 
                  style={{ color: "rgba(150, 250, 150, 0.9)" }} 
                />
              ) : (
                <AlertTriangle 
                  className="w-4 h-4" 
                  style={{ color: "rgba(255, 200, 100, 0.9)" }} 
                />
              )}
            </div>
            <p
              className="text-xs mb-2"
              style={{ color: "rgba(200, 240, 200, 0.6)" }}
            >
              Choose at least one: Upload your game file (.zip) OR provide an external link (itch.io, Steam, web game, etc.)
            </p>
            {errors.gameFileUrl && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 mt-2"
              >
                <AlertTriangle 
                  className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" 
                  style={{ color: "rgba(255, 180, 180, 0.95)" }} 
                />
                <p
                  className="text-xs font-semibold"
                  style={{ color: "rgba(255, 180, 180, 0.95)" }}
                >
                  {errors.gameFileUrl}
                </p>
              </motion.div>
            )}
            {formData.gameFileUrl && formData.externalUrl && !errors.gameFileUrl && (
              <div className="flex items-start gap-2">
                <Info 
                  className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" 
                  style={{ color: "rgba(150, 250, 150, 0.9)" }} 
                />
                <p
                  className="text-xs font-semibold"
                  style={{ color: "rgba(150, 250, 150, 0.9)" }}
                >
                  Both methods active: Users can download the file OR visit the external link
                </p>
              </div>
            )}
          </div>

          <GameFileUpload
            value={formData.gameFileUrl}
            onChange={handleGameFileChange}
            label="Upload Game File"
          />
          {renderFieldError('gameFileUrl')}

          <div className="text-center" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
            — OR —
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "rgba(200, 240, 200, 0.7)" }}
            >
              External URL
            </label>
            <input
              type="url"
              value={formData.externalUrl}
              onChange={(e) => handleExternalUrlChange(e.target.value)}
              placeholder="https://yourgame.com or https://itch.io/your-game"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
              style={{ color: "rgba(200, 240, 200, 0.85)" }}
            />
            <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
              Link to where users can play or download your game (itch.io, Steam, web game, etc.)
            </p>
            {renderFieldError('externalUrl')}
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="space-y-6">
        <h3
          className="text-xl font-bold pixelized"
          style={{
            color: "rgba(180, 220, 180, 0.95)",
            textShadow: "0 0 8px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
          }}
        >
          Media
        </h3>

        <ImageUpload
          value={formData.coverUrl}
          onChange={(url) => handleChange('coverUrl', url)}
          label="Cover Image"
        />
        {renderFieldError('coverUrl')}

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "rgba(200, 240, 200, 0.7)" }}
          >
            Screenshots (Max 8)
          </label>
          <div className="space-y-3">
            {formData.screenshots.map((screenshot, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={screenshot}
                  onChange={(e) => handleScreenshotChange(index, e.target.value)}
                  placeholder={`Screenshot ${index + 1} URL`}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                  style={{ color: "rgba(200, 240, 200, 0.85)" }}
                />
                {formData.screenshots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeScreenshot(index)}
                    className="px-4 py-2 rounded-lg transition-all"
                    style={{
                      background: "rgba(250, 100, 100, 0.2)",
                      border: "1px solid rgba(250, 100, 100, 0.3)",
                      color: "rgba(250, 100, 100, 0.9)",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {formData.screenshots.length < 8 && (
            <button
              type="button"
              onClick={addScreenshot}
              className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: "rgba(100, 200, 100, 0.2)",
                border: "1px solid rgba(200, 240, 200, 0.3)",
                color: "rgba(200, 240, 200, 0.9)",
              }}
            >
              + Add Screenshot
            </button>
          )}
        </div>
      </div>

      {/* Platforms */}
      <div className="space-y-6">
        <h3
          className="text-xl font-bold pixelized"
          style={{
            color: "rgba(180, 220, 180, 0.95)",
            textShadow: "0 0 8px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
          }}
        >
          Platforms <span style={{ color: "rgba(250, 100, 100, 0.9)" }}>*</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PLATFORM_OPTIONS.map((platform) => (
            <button
              key={platform.value}
              type="button"
              onClick={() => togglePlatform(platform.value)}
              className="px-4 py-3 rounded-lg font-semibold transition-all"
              style={{
                background: formData.platforms.includes(platform.value)
                  ? "rgba(100, 200, 100, 0.3)"
                  : "rgba(100, 200, 100, 0.1)",
                border: `1px solid ${
                  formData.platforms.includes(platform.value)
                    ? "rgba(200, 240, 200, 0.5)"
                    : "rgba(200, 240, 200, 0.2)"
                }`,
                color: "rgba(200, 240, 200, 0.9)",
              }}
            >
              {platform.label}
            </button>
          ))}
        </div>
        {renderFieldError('platforms')}
      </div>

      {/* Tags */}
      <div className="space-y-6">
        <h3
          className="text-xl font-bold pixelized"
          style={{
            color: "rgba(180, 220, 180, 0.95)",
            textShadow: "0 0 8px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
          }}
        >
          Tags (Max 8)
        </h3>

        <div className="space-y-3">
          {formData.tags.map((tag, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={tag}
                onChange={(e) => handleTagChange(index, e.target.value)}
                placeholder={`Tag ${index + 1} (e.g., Action, RPG, Puzzle)`}
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                style={{ color: "rgba(200, 240, 200, 0.85)" }}
              />
              {formData.tags.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="px-4 py-2 rounded-lg transition-all"
                  style={{
                    background: "rgba(250, 100, 100, 0.2)",
                    border: "1px solid rgba(250, 100, 100, 0.3)",
                    color: "rgba(250, 100, 100, 0.9)",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {renderFieldError('tags')}
        {formData.tags.length < 8 && (
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: "rgba(100, 200, 100, 0.2)",
              border: "1px solid rgba(200, 240, 200, 0.3)",
              color: "rgba(200, 240, 200, 0.9)",
            }}
          >
            + Add Tag
          </button>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-4 pt-6">
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-4 rounded-lg font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, rgba(100, 200, 100, 0.4) 0%, rgba(80, 180, 80, 0.3) 100%)",
            border: "1px solid rgba(200, 240, 200, 0.4)",
            color: "rgba(200, 240, 200, 0.95)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Game' : 'Update Game'}
        </motion.button>

        <motion.button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-6 py-4 rounded-lg font-bold uppercase tracking-wider transition-all disabled:opacity-50"
          style={{
            background: "rgba(100, 100, 100, 0.2)",
            border: "1px solid rgba(200, 240, 200, 0.3)",
            color: "rgba(200, 240, 200, 0.9)",
          }}
          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
        >
          Cancel
        </motion.button>
      </div>
    </form>
  );
}

