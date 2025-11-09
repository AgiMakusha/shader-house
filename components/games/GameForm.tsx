"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Platform } from "@prisma/client";
import { useAudio } from "@/components/audio/AudioProvider";
import { ImageUpload } from "./ImageUpload";

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
    externalUrl: string;
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
    externalUrl: initialData?.externalUrl || '',
    tags: initialData?.tags || [''],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Filter out empty values
      const submitData = {
        ...formData,
        screenshots: formData.screenshots.filter(s => s.trim()),
        tags: formData.tags.filter(t => t.trim()),
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
        if (data.error) {
          setErrors({ general: data.error });
        }
        throw new Error(data.error || 'Failed to save game');
      }

      play("success");
      router.push(`/games/${data.slug}`);
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors.general && (
        <div
          className="p-4 rounded-lg"
          style={{
            background: "rgba(250, 100, 100, 0.2)",
            border: "1px solid rgba(250, 100, 100, 0.4)",
          }}
        >
          <p style={{ color: "rgba(250, 100, 100, 0.9)" }}>
            {errors.general}
          </p>
        </div>
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
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "rgba(200, 240, 200, 0.7)" }}
            >
              Price (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={(formData.priceCents / 100).toFixed(2)}
              onChange={(e) => handleChange('priceCents', Math.round(parseFloat(e.target.value) * 100))}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
              style={{ color: "rgba(200, 240, 200, 0.85)" }}
            />
            <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
              Set to 0 for free games
            </p>
          </div>
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
            required
          />
          <p className="text-xs mt-1 text-right" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
            {formData.tagline.length} / 120
          </p>
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
            required
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "rgba(200, 240, 200, 0.7)" }}
          >
            External URL (Optional)
          </label>
          <input
            type="url"
            value={formData.externalUrl}
            onChange={(e) => handleChange('externalUrl', e.target.value)}
            placeholder="https://yourgame.com or https://itch.io/your-game"
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
            style={{ color: "rgba(200, 240, 200, 0.85)" }}
          />
          <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
            Link to where users can play or purchase your game
          </p>
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
          required
        />

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

