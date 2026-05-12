import { ADJECTIVES, NOUNS } from './constants';

// ─── Geo Utils ────────────────────────────────────────────────────────────────

/**
 * Haversine formula: distance between two GPS coordinates in meters
 */
export function distanceBetweenCoords(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if user is within allowed radius of a venue
 */
export function isWithinVenueRadius(
  userLat: number,
  userLng: number,
  venueLat: number,
  venueLng: number,
  radiusMeters: number
): boolean {
  return distanceBetweenCoords(userLat, userLng, venueLat, venueLng) <= radiusMeters;
}

// ─── Alias Generator ──────────────────────────────────────────────────────────

/**
 * Generates a deterministic anonymous alias from a seed string
 */
export function generateAnonymousAlias(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const absHash = Math.abs(hash);
  const adjective = ADJECTIVES[absHash % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(absHash / ADJECTIVES.length) % NOUNS.length];
  return `${adjective}${noun}`;
}

/**
 * Generates a random anonymous alias (for new users)
 */
export function generateRandomAlias(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj}${noun}${num}`;
}

// ─── Time Utils ───────────────────────────────────────────────────────────────

export function formatTimestamp(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return d.toLocaleDateString();
}

export function formatChatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Avatar Utils ─────────────────────────────────────────────────────────────

/**
 * Returns a DiceBear avatar URL from a seed
 */
export function getAvatarUrl(seed: string, style: 'avataaars' | 'bottts' | 'identicon' = 'bottts'): string {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=6C63FF`;
}

// ─── Validation Utils ─────────────────────────────────────────────────────────

export function isValidPhone(phone: string): boolean {
  return /^\+?[1-9]\d{9,14}$/.test(phone.replace(/\s/g, ''));
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\s|-|\(|\)/g, '');
}
