import { z } from 'zod';
import { Platform, ReleaseStatus } from '@prisma/client';

// Helper to validate URL, data URL, or relative path
const urlOrDataUrl = z.string().refine(
  (val) => {
    if (!val || val.trim() === '') return false;
    // Allow data URLs
    if (val.startsWith('data:image/')) return true;
    // Allow relative paths (starting with /)
    if (val.startsWith('/')) return true;
    // Allow full URLs
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Must be a valid URL, relative path, or data URL' }
);

export const gameUpsertSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  tagline: z.string().min(4, 'Tagline must be at least 4 characters').max(120, 'Tagline must be less than 120 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  coverUrl: urlOrDataUrl,
  screenshots: z.array(urlOrDataUrl).max(8, 'Maximum 8 screenshots allowed'),
  priceCents: z.number().int().min(0, 'Price must be 0 or greater'),
  platforms: z.array(z.nativeEnum(Platform)).min(1, 'At least one platform is required'),
  gameFileUrl: z.string().optional().or(z.literal('')), // Uploaded game file
  externalUrl: z.string().optional().or(z.literal('')), // External link
  releaseStatus: z.nativeEnum(ReleaseStatus).default(ReleaseStatus.BETA), // Beta or Released
  tags: z.array(z.string()).max(8, 'Maximum 8 tags allowed'),
}).refine(
  (data) => data.gameFileUrl || data.externalUrl,
  {
    message: 'Either upload a game file or provide an external link',
    path: ['gameFileUrl'],
  }
);

export const ratingSchema = z.object({
  stars: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(1000, 'Comment must be less than 1000 characters').optional(),
});

export const gameQuerySchema = z.object({
  q: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  platform: z.nativeEnum(Platform).optional(),
  priceFilter: z.enum(['all', 'free', 'paid']).optional().default('all'),
  sort: z.enum(['new', 'popular', 'rating', 'price-low', 'price-high']).optional().default('new'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(12),
  developer: z.string().optional(), // 'me' or developer ID
});

export type GameUpsert = z.infer<typeof gameUpsertSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
export type GameQuery = z.infer<typeof gameQuerySchema>;

