'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Zap, Coins, Upload, Image as ImageIcon, Video, Trash2 } from 'lucide-react';
import { ThreadCategory } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Toast } from './Toast';
import Image from 'next/image';
import { Select } from '@/components/ui/Select';

interface ThreadComposerProps {
  gameId: string;
  gameSlug: string;
  onClose: () => void;
  isDeveloper?: boolean; // Game owner (for announcements)
  userRole?: 'DEVELOPER' | 'GAMER' | 'ADMIN'; // User role for category restrictions
}

const ALL_CATEGORIES: { value: ThreadCategory; label: string; description: string }[] = [
  { 
    value: 'GENERAL', 
    label: 'General Discussion',
    description: 'For gamers and developers - general chat about the game'
  },
  { 
    value: 'BUG_REPORT', 
    label: 'Bug Report',
    description: 'For gamers - report bugs or issues you found while playing'
  },
  { 
    value: 'SUGGESTION', 
    label: 'Suggestion',
    description: 'For gamers - suggest improvements or new features you\'d like to see'
  },
  { 
    value: 'SHOWCASE', 
    label: 'Showcase',
    description: 'For gamers - share your gameplay clips, screenshots, achievements, or impressive moments from playing'
  },
];

// Get available categories based on user role
const getAvailableCategories = (userRole?: 'DEVELOPER' | 'GAMER' | 'ADMIN', isDeveloper?: boolean) => {
  const isUserDeveloper = userRole === 'DEVELOPER';
  
  // Developers can only create threads in GENERAL and ANNOUNCEMENT
  if (isUserDeveloper) {
    return [
      ALL_CATEGORIES.find(c => c.value === 'GENERAL')!,
      ...(isDeveloper ? [{ value: 'ANNOUNCEMENT' as ThreadCategory, label: 'Announcement', description: 'For developers - make official announcements' }] : [])
    ];
  }
  
  // Gamers can create threads in all categories except ANNOUNCEMENT
  return ALL_CATEGORIES;
};

export function ThreadComposer({
  gameId,
  gameSlug,
  onClose,
  isDeveloper,
  userRole,
}: ThreadComposerProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Get available categories based on user role
  const availableCategories = getAvailableCategories(userRole, isDeveloper);
  const [category, setCategory] = useState<ThreadCategory>(availableCategories[0]?.value || 'GENERAL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reward, setReward] = useState<any>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 files max
    if (mediaUrls.length + files.length > 5) {
      setError('Maximum 5 images/videos allowed');
      return;
    }

    setUploadingMedia(true);
    setError('');

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file type (images and videos)
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
          throw new Error(`Invalid file type: ${file.name}. Only images and videos are allowed.`);
        }

        // Validate file size (10MB for images, 50MB for videos)
        const maxSize = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error(`${file.name} is too large. Max size: ${isImage ? '10MB' : '50MB'}`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'media'); // Use media type for showcase uploads

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      setMediaUrls([...mediaUrls, ...urls]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload media');
    } finally {
      setUploadingMedia(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/discussions/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          title,
          content,
          category,
          mediaUrls: category === 'SHOWCASE' ? mediaUrls : [],
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create thread';
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
          // Include additional details if available
          if (data.details && typeof data.details === 'string') {
            errorMessage += `: ${data.details}`;
          }
        } catch (parseError) {
          // If JSON parsing fails, use status text
          errorMessage = `Error ${response.status}: ${response.statusText || 'Unknown error'}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setReward(data.reward);

      // Show reward briefly, then redirect
      setTimeout(() => {
        router.push(`/games/${gameSlug}/community/${data.thread.id}`);
        router.refresh();
      }, 2000);
    } catch (err: any) {
      console.error('Thread creation error:', err);
      // Show detailed error message
      const errorMsg = err.message || 'Failed to create thread. Please try again.';
      setError(errorMsg);
      setIsSubmitting(false);
      
      // Also log to console for debugging
      console.error('Full error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response,
      });
    }
  };

  if (reward) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 rounded-lg text-center"
          style={{
            background: 'rgba(40, 50, 40, 0.95)',
            border: '1px solid rgba(100, 200, 100, 0.5)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          }}
        >
          <h3
            className="text-2xl font-bold mb-4 pixelized"
            style={{
              color: 'rgba(180, 240, 180, 0.95)',
              textShadow: '0 0 8px rgba(120, 200, 120, 0.6)',
            }}
          >
            Thread Created!
          </h3>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Zap
                size={24}
                style={{
                  color: 'rgba(180, 240, 180, 0.9)',
                  filter: 'drop-shadow(0 0 4px rgba(120, 200, 120, 0.6))',
                }}
              />
              <span
                className="text-xl font-bold"
                style={{ color: 'rgba(180, 240, 180, 0.95)' }}
              >
                +{reward.xpEarned} XP
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Coins
                size={24}
                style={{
                  color: 'rgba(240, 220, 140, 0.9)',
                  filter: 'drop-shadow(0 0 4px rgba(240, 220, 140, 0.6))',
                }}
              />
              <span
                className="text-xl font-bold"
                style={{ color: 'rgba(240, 220, 140, 0.95)' }}
              >
                +{reward.pointsEarned} Points
              </span>
            </div>
          </div>
          <p style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
            Redirecting to thread...
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {error && (
          <Toast
            message={error}
            type="error"
            onClose={() => setError('')}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.8)' }}
        onClick={onClose}
      >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl p-6 rounded-lg"
        style={{
          background: 'rgba(40, 50, 40, 0.95)',
          border: '1px solid rgba(100, 150, 100, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-bold pixelized"
            style={{
              color: 'rgba(180, 240, 180, 0.95)',
              textShadow: '0 0 8px rgba(120, 200, 120, 0.6)',
            }}
          >
            New Discussion
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded transition-all hover:bg-white/10"
          >
            <X size={20} style={{ color: 'rgba(180, 240, 180, 0.7)' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Display - Inline in form for better visibility */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg"
              style={{
                background: 'rgba(180, 60, 60, 0.2)',
                border: '2px solid rgba(255, 120, 120, 0.6)',
                boxShadow: '0 4px 12px rgba(255, 100, 100, 0.3)',
              }}
            >
              <div className="flex items-start gap-3">
                <span style={{ color: 'rgba(255, 150, 150, 0.95)', fontSize: '20px' }}>⚠️</span>
                <div className="flex-1">
                  <p
                    className="font-bold mb-1"
                    style={{ color: 'rgba(255, 180, 180, 0.95)' }}
                  >
                    Error Creating Thread
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: 'rgba(255, 200, 200, 0.9)' }}
                  >
                    {error}
                  </p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="flex-shrink-0 p-1 rounded hover:bg-white/10"
                  style={{ color: 'rgba(255, 150, 150, 0.95)' }}
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Category */}
          <div>
            <label
              className="block mb-2 text-sm font-bold"
              style={{ color: 'rgba(180, 220, 180, 0.9)' }}
            >
              Category
            </label>
            <Select
              value={category}
              onChange={(value) => setCategory(value as ThreadCategory)}
              options={availableCategories.map((cat) => ({
                value: cat.value,
                label: cat.label,
              }))}
              className="w-full"
            />
            {/* Category description helper text */}
            <p
              className="text-xs mt-2 p-2 rounded"
              style={{ 
                color: 'rgba(150, 200, 180, 0.8)',
                background: 'rgba(20, 40, 30, 0.3)',
                border: '1px solid rgba(100, 180, 150, 0.2)',
              }}
            >
              {availableCategories.find(c => c.value === category)?.description || ''}
            </p>
          </div>

          {/* Title */}
          <div>
            <label
              className="block mb-2 text-sm font-bold"
              style={{ color: 'rgba(180, 220, 180, 0.9)' }}
            >
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={200}
              required
              className="w-full px-4 py-2 rounded-lg"
              style={{
                background: 'rgba(20, 30, 20, 0.8)',
                border: '1px solid rgba(100, 150, 100, 0.3)',
                color: 'rgba(200, 240, 200, 0.95)',
              }}
            />
            <p
              className="text-xs mt-1"
              style={{ color: 'rgba(150, 180, 150, 0.6)' }}
            >
              {title.length}/200 characters • Min. 5 characters
            </p>
          </div>

          {/* Content */}
          <div>
            <label
              className="block mb-2 text-sm font-bold"
              style={{ color: 'rgba(180, 220, 180, 0.9)' }}
            >
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, ask questions, or report issues..."
              rows={6}
              required
              className="w-full px-4 py-2 rounded-lg resize-none"
              style={{
                background: 'rgba(20, 30, 20, 0.8)',
                border: '1px solid rgba(100, 150, 100, 0.3)',
                color: 'rgba(200, 240, 200, 0.95)',
              }}
            />
            <p
              className="text-xs mt-1"
              style={{ color: 'rgba(150, 180, 150, 0.6)' }}
            >
              Min. 20 characters
            </p>
          </div>

          {/* Media Upload (only for Showcase) */}
          {category === 'SHOWCASE' && (
            <div>
              <label
                className="block mb-2 text-sm font-bold"
                style={{ color: 'rgba(180, 220, 180, 0.9)' }}
              >
                Media (Images/Videos)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaUpload}
                className="hidden"
              />
              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingMedia || mediaUrls.length >= 5}
                whileHover={!uploadingMedia && mediaUrls.length < 5 ? { scale: 1.02 } : {}}
                whileTap={!uploadingMedia && mediaUrls.length < 5 ? { scale: 0.98 } : {}}
                className="w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(200, 150, 255, 0.2)',
                  border: '1px solid rgba(200, 150, 255, 0.4)',
                  color: 'rgba(220, 180, 255, 0.95)',
                }}
              >
                <Upload size={18} />
                {uploadingMedia 
                  ? 'Uploading...' 
                  : mediaUrls.length >= 5 
                    ? 'Maximum 5 files' 
                    : `Upload ${mediaUrls.length > 0 ? 'More ' : ''}Media`
                }
              </motion.button>
              <p
                className="text-xs mt-1"
                style={{ color: 'rgba(150, 180, 150, 0.6)' }}
              >
                {mediaUrls.length}/5 files • Images: 10MB max • Videos: 50MB max
              </p>

              {/* Media Preview */}
              {mediaUrls.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {mediaUrls.map((url, index) => {
                    const isVideo = url.match(/\.(mp4|webm|mov|avi)$/i);
                    return (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden"
                        style={{
                          background: 'rgba(20, 30, 20, 0.5)',
                          border: '1px solid rgba(100, 150, 100, 0.3)',
                        }}
                      >
                        {isVideo ? (
                          <video
                            src={url}
                            className="w-full h-32 object-cover"
                            controls
                          />
                        ) : (
                          <div className="relative w-full h-32">
                            <Image
                              src={url}
                              alt={`Upload ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, 25vw"
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            background: 'rgba(180, 60, 60, 0.9)',
                            color: 'white',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isSubmitting || title.length < 5 || content.length < 20}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-6 py-3 rounded-lg font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            style={{
              background:
                isSubmitting || title.length < 5 || content.length < 20
                  ? 'rgba(100, 150, 100, 0.3)'
                  : 'linear-gradient(135deg, rgba(180, 240, 180, 0.4) 0%, rgba(120, 200, 120, 0.3) 100%)',
              border: '1px solid rgba(180, 240, 180, 0.4)',
              color:
                isSubmitting || title.length < 5 || content.length < 20
                  ? 'rgba(180, 220, 180, 0.5)'
                  : 'rgba(200, 240, 200, 0.95)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Send size={16} />
            {isSubmitting ? 'Creating...' : 'Create Thread'}
          </motion.button>

          {/* Reward Info */}
          <p
            className="text-xs text-center"
            style={{ color: 'rgba(150, 180, 150, 0.7)' }}
          >
            You'll earn +5 XP and +10 Points for creating this thread
          </p>
        </form>
      </motion.div>
      </motion.div>
    </>
  );
}

