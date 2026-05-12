// ─── Venue Constants ─────────────────────────────────────────────────────────

export const VENUE_RADIUS_METERS = 150; // GPS validation radius
export const SESSION_TIMEOUT_MINUTES = 240; // 4 hours auto-exit

// ─── Auth Constants ───────────────────────────────────────────────────────────

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_MOCK_CODE = '000000'; // dev bypass
export const JWT_EXPIRY = '7d';

// ─── Chat Constants ───────────────────────────────────────────────────────────

export const MAX_MESSAGE_LENGTH = 500;
export const MESSAGE_RATE_LIMIT_PER_MINUTE = 30;

// ─── Filter Options ───────────────────────────────────────────────────────────

export const GENDER_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'MALE', label: 'Men' },
  { value: 'FEMALE', label: 'Women' },
  { value: 'OTHER', label: 'Other' },
] as const;

export type GenderFilter = 'ALL' | 'MALE' | 'FEMALE' | 'OTHER';

// ─── Venue Categories ─────────────────────────────────────────────────────────

export const VENUE_CATEGORIES = [
  { value: 'CAFE', label: 'Café', emoji: '☕' },
  { value: 'BAR', label: 'Bar', emoji: '🍸' },
  { value: 'RESTAURANT', label: 'Restaurant', emoji: '🍽️' },
  { value: 'LOUNGE', label: 'Lounge', emoji: '🛋️' },
  { value: 'OTHER', label: 'Other', emoji: '📍' },
] as const;

// ─── Socket Events ────────────────────────────────────────────────────────────

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // Venue presence
  JOIN_VENUE: 'join_venue',
  LEAVE_VENUE: 'leave_venue',
  VENUE_USERS_UPDATE: 'venue_users_update',

  // Chat
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  MESSAGE_READ: 'message_read',

  // Table reveal
  REVEAL_CONSENT: 'reveal_consent',
  REVEAL_CONFIRMED: 'reveal_confirmed',

  // Safety
  USER_BLOCKED: 'user_blocked',
  PANIC_EXIT: 'panic_exit',

  // Errors
  ERROR: 'error',
} as const;

// ─── Report Reasons ───────────────────────────────────────────────────────────

export const REPORT_REASONS = [
  'Harassment or bullying',
  'Inappropriate content',
  'Spam or fake profile',
  'Threatening behavior',
  'Other',
] as const;

// ─── Anonymous Alias Generation ───────────────────────────────────────────────

export const ADJECTIVES = [
  'Silent', 'Cosmic', 'Velvet', 'Neon', 'Electric', 'Midnight',
  'Golden', 'Shadow', 'Crystal', 'Lunar', 'Stellar', 'Phantom',
  'Mystic', 'Azure', 'Crimson', 'Jade', 'Ember', 'Frost',
];

export const NOUNS = [
  'Fox', 'Wolf', 'Hawk', 'Echo', 'Drift', 'Spark',
  'Blaze', 'Ghost', 'Arrow', 'Storm', 'River', 'Flame',
  'Comet', 'Prism', 'Cipher', 'Raven', 'Drake', 'Pulse',
];
