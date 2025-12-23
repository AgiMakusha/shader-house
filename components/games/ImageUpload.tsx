"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAudio } from "@/components/audio/AudioProvider";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  required?: boolean;
}

export function ImageUpload({ value, onChange, label, required = false }: ImageUploadProps) {
  const { play } = useAudio();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [useUrl, setUseUrl] = useState(true);

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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          className="block text-sm font-medium"
          style={{ color: "rgba(200, 240, 200, 0.7)" }}
        >
          {label} {required && <span style={{ color: "rgba(250, 100, 100, 0.9)" }}>*</span>}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setUseUrl(true)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              useUrl ? 'opacity-100' : 'opacity-50'
            }`}
            style={{
              background: useUrl ? "rgba(100, 200, 100, 0.3)" : "rgba(100, 200, 100, 0.1)",
              border: "1px solid rgba(200, 240, 200, 0.3)",
              color: "rgba(200, 240, 200, 0.9)",
            }}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setUseUrl(false)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              !useUrl ? 'opacity-100' : 'opacity-50'
            }`}
            style={{
              background: !useUrl ? "rgba(100, 200, 100, 0.3)" : "rgba(100, 200, 100, 0.1)",
              border: "1px solid rgba(200, 240, 200, 0.3)",
              color: "rgba(200, 240, 200, 0.9)",
            }}
          >
            Upload
          </button>
        </div>
      </div>

      {useUrl ? (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
          style={{ color: "rgba(200, 240, 200, 0.85)" }}
          required={required}
        />
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <motion.button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "rgba(100, 200, 100, 0.2)",
              border: "1px solid rgba(200, 240, 200, 0.3)",
              color: "rgba(200, 240, 200, 0.9)",
            }}
            whileHover={!isUploading ? { scale: 1.02 } : {}}
            whileTap={!isUploading ? { scale: 0.98 } : {}}
          >
            {isUploading ? 'Uploading...' : value ? 'Change Image' : 'Choose Image'}
          </motion.button>
          <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
            Max size: 5MB. Formats: JPEG, PNG, GIF, WebP, HEIC, AVIF
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm font-semibold" style={{ color: "rgba(250, 100, 100, 0.9)" }}>
          {error}
        </p>
      )}

      {value && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border" style={{ borderColor: "rgba(200, 240, 200, 0.2)" }}>
          <Image
            src={value}
            alt="Preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}
    </div>
  );
}



