'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading2,
  Heading3,
  Eye,
  EyeOff,
  Save,
  Send,
  X,
  Upload,
} from 'lucide-react';
import { DevlogCategory } from '@prisma/client';

interface DevlogEditorProps {
  initialData?: {
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    mediaUrls?: string[];
    category: DevlogCategory;
    tags?: string[];
    gameId?: string | null;
    isPublished?: boolean;
  };
  games?: { id: string; title: string }[];
  onSave: (data: any, publish: boolean) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const categories: { value: DevlogCategory; label: string }[] = [
  { value: 'BEHIND_THE_SCENES', label: 'Behind the Scenes' },
  { value: 'DEVELOPMENT_UPDATE', label: 'Development Update' },
  { value: 'ANNOUNCEMENT', label: 'Announcement' },
  { value: 'TUTORIAL', label: 'Tutorial' },
  { value: 'POSTMORTEM', label: 'Postmortem' },
  { value: 'TIPS_AND_TRICKS', label: 'Tips & Tricks' },
];

export function DevlogEditor({
  initialData,
  games = [],
  onSave,
  onCancel,
  isSubmitting = false,
}: DevlogEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [category, setCategory] = useState<DevlogCategory>(
    initialData?.category || 'BEHIND_THE_SCENES'
  );
  const [gameId, setGameId] = useState(initialData?.gameId || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText =
      content.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      content.substring(end);
    setContent(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  const handleFileUpload = async (file: File, isCover: boolean = false) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      const imageUrl = data.url;

      if (isCover) {
        setCoverImage(imageUrl);
      } else {
        insertMarkdown(`![${file.name}](${imageUrl})\n`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag) && tags.length < 5) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (publish: boolean) => {
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required');
      return;
    }

    await onSave(
      {
        title: title.trim(),
        content,
        excerpt: excerpt.trim() || undefined,
        coverImage: coverImage || undefined,
        category,
        tags,
        gameId: gameId || null,
      },
      publish
    );
  };

  // Simple markdown to HTML converter for preview
  const renderPreview = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-green-300 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-green-200 mt-6 mb-3">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-black/30 px-1 rounded">$1</code>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-green-400 underline">$1</a>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-green-500/50 pl-4 italic text-green-300/70">$1</blockquote>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: 'rgba(30, 40, 30, 0.95)',
        border: '1px solid rgba(100, 150, 100, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Cover Image */}
      <div className="mb-6">
        <label
          className="block text-sm font-bold mb-2"
          style={{ color: 'rgba(180, 220, 180, 0.9)' }}
        >
          Cover Image
        </label>
        {coverImage ? (
          <div className="relative h-48 rounded-lg overflow-hidden">
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setCoverImage('')}
              className="absolute top-2 right-2 p-2 rounded-full"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'rgba(255, 150, 150, 0.9)',
              }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={isUploading}
            className="w-full h-32 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-all hover:border-green-500/50"
            style={{
              borderColor: 'rgba(100, 150, 100, 0.3)',
              color: 'rgba(180, 220, 180, 0.7)',
            }}
          >
            <Upload size={20} />
            {isUploading ? 'Uploading...' : 'Upload Cover Image'}
          </button>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file, true);
          }}
        />
      </div>

      {/* Title */}
      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your devlog title..."
          className="w-full px-4 py-3 rounded-lg text-xl font-bold pixelized"
          style={{
            background: 'rgba(40, 50, 40, 0.8)',
            border: '1px solid rgba(100, 150, 100, 0.3)',
            color: 'rgba(200, 240, 200, 0.95)',
          }}
        />
      </div>

      {/* Category & Game Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            className="block text-sm font-bold mb-2"
            style={{ color: 'rgba(180, 220, 180, 0.9)' }}
          >
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as DevlogCategory)}
            className="w-full px-4 py-2 rounded-lg"
            style={{
              background: 'rgba(40, 50, 40, 0.8)',
              border: '1px solid rgba(100, 150, 100, 0.3)',
              color: 'rgba(200, 240, 200, 0.95)',
            }}
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="block text-sm font-bold mb-2"
            style={{ color: 'rgba(180, 220, 180, 0.9)' }}
          >
            Related Game (Optional)
          </label>
          <select
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="w-full px-4 py-2 rounded-lg"
            style={{
              background: 'rgba(40, 50, 40, 0.8)',
              border: '1px solid rgba(100, 150, 100, 0.3)',
              color: 'rgba(200, 240, 200, 0.95)',
            }}
          >
            <option value="">No specific game</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <label
          className="block text-sm font-bold mb-2"
          style={{ color: 'rgba(180, 220, 180, 0.9)' }}
        >
          Tags (up to 5)
        </label>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
              style={{
                background: 'rgba(120, 200, 120, 0.2)',
                color: 'rgba(180, 240, 180, 0.9)',
                border: '1px solid rgba(120, 200, 120, 0.3)',
              }}
            >
              #{tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-400"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="Add a tag..."
            className="flex-1 px-3 py-2 rounded-lg text-sm"
            style={{
              background: 'rgba(40, 50, 40, 0.8)',
              border: '1px solid rgba(100, 150, 100, 0.3)',
              color: 'rgba(200, 240, 200, 0.95)',
            }}
          />
          <button
            onClick={handleAddTag}
            disabled={tags.length >= 5}
            className="px-4 py-2 rounded-lg font-bold text-sm"
            style={{
              background: 'rgba(120, 200, 120, 0.3)',
              color: 'rgba(180, 240, 180, 0.9)',
              border: '1px solid rgba(120, 200, 120, 0.4)',
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-1 p-2 rounded-t-lg border-b"
        style={{
          background: 'rgba(40, 50, 40, 0.6)',
          borderColor: 'rgba(100, 150, 100, 0.3)',
        }}
      >
        <button
          onClick={() => insertMarkdown('**', '**')}
          className="p-2 rounded hover:bg-white/10"
          title="Bold"
        >
          <Bold size={16} style={{ color: 'rgba(180, 220, 180, 0.9)' }} />
        </button>
        <button
          onClick={() => insertMarkdown('*', '*')}
          className="p-2 rounded hover:bg-white/10"
          title="Italic"
        >
          <Italic size={16} style={{ color: 'rgba(180, 220, 180, 0.9)' }} />
        </button>
        <button
          onClick={() => insertMarkdown('## ')}
          className="p-2 rounded hover:bg-white/10"
          title="Heading 2"
        >
          <Heading2 size={16} style={{ color: 'rgba(180, 220, 180, 0.9)' }} />
        </button>
        <button
          onClick={() => insertMarkdown('### ')}
          className="p-2 rounded hover:bg-white/10"
          title="Heading 3"
        >
          <Heading3 size={16} style={{ color: 'rgba(180, 220, 180, 0.9)' }} />
        </button>
        <div
          className="w-px h-6 mx-1"
          style={{ background: 'rgba(100, 150, 100, 0.3)' }}
        />
        <button
          onClick={() => insertMarkdown('[', '](url)')}
          className="p-2 rounded hover:bg-white/10"
          title="Link"
        >
          <LinkIcon size={16} style={{ color: 'rgba(180, 220, 180, 0.9)' }} />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded hover:bg-white/10"
          title="Image"
        >
          <ImageIcon size={16} style={{ color: 'rgba(180, 220, 180, 0.9)' }} />
        </button>
        <button
          onClick={() => insertMarkdown('\n<video src="', '" controls></video>\n')}
          className="p-2 rounded hover:bg-white/10"
          title="Video"
        >
          <Video size={16} style={{ color: 'rgba(180, 220, 180, 0.9)' }} />
        </button>
        <div
          className="w-px h-6 mx-1"
          style={{ background: 'rgba(100, 150, 100, 0.3)' }}
        />
        <button
          onClick={() => insertMarkdown('- ')}
          className="p-2 rounded hover:bg-white/10"
          title="Bullet List"
        >
          <List size={16} style={{ color: 'rgba(180, 220, 180, 0.9)' }} />
        </button>
        <button
          onClick={() => insertMarkdown('1. ')}
          className="p-2 rounded hover:bg-white/10"
          title="Numbered List"
        >
          <ListOrdered size={16} style={{ color: 'rgba(180, 220, 180, 0.9)' }} />
        </button>
        <button
          onClick={() => insertMarkdown('> ')}
          className="p-2 rounded hover:bg-white/10"
          title="Quote"
        >
          <Quote size={16} style={{ color: 'rgba(180, 220, 180, 0.9)' }} />
        </button>
        <button
          onClick={() => insertMarkdown('`', '`')}
          className="p-2 rounded hover:bg-white/10"
          title="Code"
        >
          <Code size={16} style={{ color: 'rgba(180, 220, 180, 0.9)' }} />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3 py-1 rounded text-sm font-medium"
          style={{
            background: showPreview
              ? 'rgba(120, 200, 120, 0.3)'
              : 'transparent',
            color: 'rgba(180, 220, 180, 0.9)',
          }}
        >
          {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />

      {/* Content Area */}
      <div
        className="rounded-b-lg overflow-hidden"
        style={{
          background: 'rgba(40, 50, 40, 0.8)',
          border: '1px solid rgba(100, 150, 100, 0.3)',
          borderTop: 'none',
        }}
      >
        {showPreview ? (
          <div
            className="min-h-[400px] p-4 prose prose-invert max-w-none"
            style={{ color: 'rgba(200, 240, 200, 0.9)' }}
            dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
          />
        ) : (
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your devlog content here... (Markdown supported)"
            className="w-full min-h-[400px] p-4 resize-y"
            style={{
              background: 'transparent',
              color: 'rgba(200, 240, 200, 0.95)',
              outline: 'none',
            }}
          />
        )}
      </div>

      {/* Excerpt */}
      <div className="mt-4">
        <label
          className="block text-sm font-bold mb-2"
          style={{ color: 'rgba(180, 220, 180, 0.9)' }}
        >
          Excerpt (Optional - for preview cards)
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A short summary of your devlog..."
          rows={2}
          className="w-full px-4 py-3 rounded-lg resize-none"
          style={{
            background: 'rgba(40, 50, 40, 0.8)',
            border: '1px solid rgba(100, 150, 100, 0.3)',
            color: 'rgba(200, 240, 200, 0.95)',
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-green-900/30">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2 rounded-lg font-bold transition-all"
          style={{
            background: 'rgba(100, 100, 100, 0.3)',
            color: 'rgba(200, 200, 200, 0.9)',
            border: '1px solid rgba(150, 150, 150, 0.3)',
          }}
        >
          Cancel
        </button>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all"
            style={{
              background: 'rgba(100, 150, 100, 0.3)',
              color: 'rgba(180, 220, 180, 0.9)',
              border: '1px solid rgba(120, 180, 120, 0.4)',
            }}
          >
            <Save size={16} />
            {isSubmitting ? 'Saving...' : 'Save Draft'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all"
            style={{
              background:
                'linear-gradient(135deg, rgba(120, 200, 120, 0.5) 0%, rgba(80, 160, 80, 0.4) 100%)',
              color: 'rgba(220, 255, 220, 0.95)',
              border: '1px solid rgba(150, 220, 150, 0.5)',
              boxShadow: '0 4px 12px rgba(120, 200, 120, 0.3)',
            }}
          >
            <Send size={16} />
            {isSubmitting ? 'Publishing...' : 'Publish'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

