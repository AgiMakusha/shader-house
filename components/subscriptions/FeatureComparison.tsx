'use client';

import { Check, X } from 'lucide-react';

interface Feature {
  name: string;
  free: boolean | string;
  creator: boolean | string;
}

// UPDATED: Most features now available in FREE tier
// Creator Support Pass is hidden but comparison logic preserved
const features: Feature[] = [
  { name: 'Buy games individually', free: true, creator: true },
  { name: 'Community access & reviews', free: true, creator: true },
  { name: 'Free demos & F2P games', free: true, creator: true },
  { name: 'Cloud saves for purchased games', free: true, creator: true },
  { name: 'User profiles & wishlists', free: true, creator: true },
  { name: 'Shader House digest newsletter', free: true, creator: true },
  { name: 'Beta builds access', free: true, creator: true }, // MOVED TO FREE
  { name: 'Game test access', free: true, creator: true }, // MOVED TO FREE
  { name: 'Support developers directly', free: true, creator: true }, // MOVED TO FREE
  { name: 'Exclusive in-game cosmetics', free: true, creator: true }, // MOVED TO FREE
  { name: 'Voting power on updates & features', free: true, creator: true }, // MOVED TO FREE
  { name: 'Direct dev community access', free: true, creator: true }, // MOVED TO FREE
  { name: 'Achievements & badges', free: true, creator: true }, // MOVED TO FREE
  // Only paid feature remaining:
  // { name: 'Unlimited access to entire game library', free: false, creator: true },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 mx-auto" style={{ color: 'rgba(140, 240, 140, 0.85)' }} />
    ) : (
      <X className="w-5 h-5 mx-auto" style={{ color: 'rgba(240, 140, 140, 0.4)' }} />
    );
  }
  return (
    <span className="text-xs pixelized" style={{ color: 'rgba(200, 240, 200, 0.8)' }}>
      {value}
    </span>
  );
}

export function FeatureComparison() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(120, 200, 120, 0.2)' }}>
            <th 
              className="text-left py-4 px-4 font-bold uppercase tracking-wider pixelized text-sm"
              style={{ color: 'rgba(180, 220, 180, 0.95)', textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)' }}
            >
              Feature
            </th>
            <th 
              className="text-center py-4 px-4 font-bold uppercase tracking-wider pixelized text-sm"
              style={{ color: 'rgba(180, 220, 180, 0.95)', textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)' }}
            >
              Free Access
            </th>
            <th 
              className="text-center py-4 px-4 font-bold uppercase tracking-wider pixelized text-sm"
              style={{ color: 'rgba(240, 220, 140, 0.95)', textShadow: '0 0 6px rgba(220, 180, 80, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)' }}
            >
              Creator Support Pass
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr
              key={index}
              className="transition-colors"
              style={{ 
                borderBottom: '1px solid rgba(120, 200, 120, 0.1)',
              }}
            >
              <td 
                className="py-3 px-4 text-sm pixelized"
                style={{ color: 'rgba(200, 240, 200, 0.8)' }}
              >
                {feature.name}
              </td>
              <td className="py-3 px-4 text-center">
                <FeatureValue value={feature.free} />
              </td>
              <td className="py-3 px-4 text-center">
                <FeatureValue value={feature.creator} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

