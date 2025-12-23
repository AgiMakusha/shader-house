"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAudio } from "@/components/audio/AudioProvider";
import { BuildTools, GameController } from "@/components/icons";

interface AvatarUploadProps {
  value: string | null | undefined;
  onChange: (url: string) => void;
  label?: string;
  role?: "DEVELOPER" | "GAMER" | "ADMIN";
}

export function AvatarUpload({ value, onChange, label = "Avatar", role = "GAMER" }: AvatarUploadProps) {
  const { play } = useAudio();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      play("error");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      play("error");
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onChange(data.url);
      play("success");
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload image');
      play("error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label
          className="block text-sm font-medium"
          style={{ color: "rgba(200, 240, 200, 0.7)" }}
        >
          {label}
        </label>
      )}

      <div className="flex items-center gap-4">
        {/* Avatar Display */}
        <div className="relative">
          {value ? (
            <div
              className="relative w-24 h-24 rounded-full overflow-hidden border-2"
              style={{
                borderColor: "rgba(200, 240, 200, 0.3)",
                boxShadow: `
                  0 0 12px rgba(120, 200, 120, 0.4),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `,
              }}
            >
              <Image
                src={value}
                alt="Avatar"
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          ) : (
            <div 
              className="relative rounded-full overflow-hidden"
              style={{
                width: '96px',
                height: '96px',
                background: `
                  linear-gradient(135deg, 
                    rgba(40, 60, 40, 0.38) 0%, 
                    rgba(50, 70, 50, 0.34) 50%, 
                    rgba(35, 55, 35, 0.38) 100%
                  )
                `,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: `
                  inset 0 1px 0 rgba(255, 255, 255, 0.1),
                  0 1px 3px rgba(0, 0, 0, 0.3),
                  0 2px 8px rgba(0,0,0,.35),
                  0 6px 24px rgba(0,0,0,.35)
                `,
              }}
            >
              <div 
                className="flex items-center justify-center w-full h-full"
                style={{ padding: role === "DEVELOPER" ? '18px' : '16px' }}
              >
                {role === "DEVELOPER" ? (
                  <BuildTools 
                    className="w-full h-full icon-ink" 
                    title="Developer Avatar"
                  />
                ) : (
                  <GameController 
                    className="w-full h-full icon-ink" 
                    title="Gamer Avatar"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex gap-2">
            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "rgba(100, 200, 100, 0.2)",
                border: "1px solid rgba(200, 240, 200, 0.3)",
                color: "rgba(200, 240, 200, 0.9)",
              }}
              whileHover={!isUploading ? { scale: 1.02 } : {}}
              whileTap={!isUploading ? { scale: 0.98 } : {}}
            >
              {isUploading ? 'Uploading...' : value ? 'Change' : 'Upload'}
            </motion.button>
            {value && (
              <motion.button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "rgba(180, 60, 60, 0.2)",
                  border: "1px solid rgba(255, 120, 120, 0.3)",
                  color: "rgba(255, 180, 180, 0.9)",
                }}
                whileHover={!isUploading ? { scale: 1.02 } : {}}
                whileTap={!isUploading ? { scale: 0.98 } : {}}
              >
                Remove
              </motion.button>
            )}
          </div>
          <p className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
            Max size: 5MB. Formats: JPEG, PNG, GIF, WebP, HEIC, AVIF
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm font-semibold" style={{ color: "rgba(250, 100, 100, 0.9)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

