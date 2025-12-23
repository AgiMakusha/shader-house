'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { DevlogEditor } from '@/components/devlogs/DevlogEditor';
import Particles from '@/components/fx/Particles';

export default function EditDevlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [devlog, setDevlog] = useState<any>(null);
  const [games, setGames] = useState<{ id: string; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fetchDevlog(), fetchGames()]).finally(() => setIsLoading(false));
  }, [slug]);

  const fetchDevlog = async () => {
    try {
      const response = await fetch(`/api/devlogs/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/profile/developer/devlogs');
          return;
        }
        throw new Error('Failed to fetch devlog');
      }

      const data = await response.json();
      
      // Check if user owns this devlog
      if (!data.devlog.isOwner) {
        router.push('/profile/developer/devlogs');
        return;
      }

      setDevlog(data.devlog);
    } catch (error) {
      console.error('Failed to fetch devlog:', error);
      router.push('/profile/developer/devlogs');
    }
  };

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/developer/games');
      if (response.ok) {
        const data = await response.json();
        setGames(data.games || []);
      }
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
  };

  const handleSave = async (data: any, publish: boolean) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/devlogs/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          isPublished: publish,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update devlog');
      }

      const result = await response.json();
      
      if (publish) {
        router.push(`/devlogs/${result.devlog.slug}`);
      } else {
        router.push('/profile/developer/devlogs');
      }
    } catch (error: any) {
      console.error('Failed to update devlog:', error);
      alert(error.message || 'Failed to update devlog');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to discard your changes?')) {
      router.push('/profile/developer/devlogs');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgba(20, 30, 20, 0.95)' }}>
        <div style={{ color: 'rgba(180, 220, 180, 0.7)' }}>Loading...</div>
      </div>
    );
  }

  if (!devlog) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgba(20, 30, 20, 0.95)' }}>
        <div style={{ color: 'rgba(180, 220, 180, 0.7)' }}>Devlog not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'rgba(20, 30, 20, 0.95)' }}>
      <Particles />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile/developer/devlogs"
            className="text-sm hover:underline inline-block mb-4"
            style={{ color: 'rgba(180, 240, 180, 0.7)' }}
          >
            <span className="flex items-center gap-1">
              <ArrowLeft size={14} />
              Back to Devlogs
            </span>
          </Link>

          <h1
            className="text-3xl font-bold pixelized flex items-center gap-3"
            style={{
              color: 'rgba(180, 240, 180, 0.95)',
              textShadow: '0 0 12px rgba(120, 200, 120, 0.6), 2px 2px 0px rgba(0, 0, 0, 0.8)',
            }}
          >
            <BookOpen size={32} />
            Edit Devlog
          </h1>
          <p style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
            Update your devlog content
          </p>
        </div>

        {/* Editor */}
        <div className="max-w-4xl mx-auto">
          <DevlogEditor
            initialData={{
              title: devlog.title,
              content: devlog.content,
              excerpt: devlog.excerpt,
              coverImage: devlog.coverImage,
              mediaUrls: devlog.mediaUrls,
              category: devlog.category,
              tags: devlog.tags,
              gameId: devlog.gameId,
              isPublished: devlog.isPublished,
            }}
            games={games}
            onSave={handleSave}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}

