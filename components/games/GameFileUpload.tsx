"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAudio } from "@/components/audio/AudioProvider";

interface GameFileUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  required?: boolean;
}

export function GameFileUpload({ value, onChange, label, required = false }: GameFileUploadProps) {
  const { play } = useAudio();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (allow .zip, .rar, .7z, etc.)
    const allowedExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      setError('Please select a valid game archive (.zip, .rar, .7z, .tar, .gz)');
      play("error");
      return;
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      play("error");
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'game'); // Indicate this is a game file

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
      setError(error.message || 'Failed to upload game file');
      play("error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    // RULE 4: Confirm before deleting uploaded file
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to remove this game file?\n\n' +
      'This action cannot be undone. The file will be permanently deleted from the server.\n\n' +
      'Make sure you have an external URL or will upload a new file before saving.'
    );

    if (!confirmed) {
      return;
    }

    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    play("error"); // Play error sound to emphasize deletion
  };

  return (
    <div className="space-y-3">
      <label
        className="block text-sm font-medium"
        style={{ color: "rgba(200, 240, 200, 0.7)" }}
      >
        {label} {required && <span style={{ color: "rgba(250, 100, 100, 0.9)" }}>*</span>}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept=".zip,.rar,.7z,.tar,.gz"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!value ? (
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
          {isUploading ? 'Uploading...' : 'Choose Game File'}
        </motion.button>
      ) : (
        <div
          className="p-4 rounded-lg border flex items-center justify-between"
          style={{
            background: "rgba(100, 200, 100, 0.1)",
            borderColor: "rgba(200, 240, 200, 0.3)",
          }}
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-8 h-8"
              style={{ color: "rgba(150, 250, 150, 0.8)" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "rgba(200, 240, 200, 0.9)" }}
              >
                Game file uploaded
              </p>
              <p
                className="text-xs"
                style={{ color: "rgba(200, 240, 200, 0.5)" }}
              >
                {value.split('/').pop()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 rounded text-xs font-semibold"
              style={{
                background: "rgba(100, 200, 100, 0.2)",
                border: "1px solid rgba(200, 240, 200, 0.3)",
                color: "rgba(200, 240, 200, 0.9)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Change
            </motion.button>
            <motion.button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1 rounded text-xs font-semibold"
              style={{
                background: "rgba(200, 100, 100, 0.2)",
                border: "1px solid rgba(240, 200, 200, 0.3)",
                color: "rgba(240, 200, 200, 0.9)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Remove
            </motion.button>
          </div>
        </div>
      )}

      <p className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
        Max size: 100MB. Formats: .zip, .rar, .7z, .tar, .gz
      </p>

      {error && (
        <p className="text-sm font-semibold" style={{ color: "rgba(250, 100, 100, 0.9)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

