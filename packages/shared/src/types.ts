// ─── User Types ──────────────────────────────────────────────────────────────

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface User {
  id: string;
  phone: string;
  alias: string;
  avatarSeed: string;
  gender: Gender;
  isActive: boolean;
  createdAt: string;
}

export interface AnonymousUser {
  id: string;
  alias: string;
  avatarSeed: string;
  gender: Gender;
  sessionId: string;
}

// ─── Venue Types ─────────────────────────────────────────────────────────────

export type VenueCategory = 'CAFE' | 'BAR' | 'RESTAURANT' | 'LOUNGE' | 'OTHER';

export interface Venue {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: VenueCategory;
  isActive: boolean;
  qrCode?: string;
  activeUserCount?: number;
}

export interface Table {
  id: string;
  venueId: string;
  label: string;
  qrCode?: string;
}

// ─── Session Types ────────────────────────────────────────────────────────────

export interface Session {
  id: string;
  userId: string;
  venueId: string;
  tableId?: string;
  checkedInAt: string;
  exitedAt?: string;
  isActive: boolean;
  lat: number;
  lng: number;
}

export interface CheckInPayload {
  venueId: string;
  tableId?: string;
  lat: number;
  lng: number;
}

// ─── Chat Types ───────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  venueId: string;
  createdAt: string;
  otherUser?: AnonymousUser;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export interface TableReveal {
  id: string;
  conversationId: string;
  user1Consented: boolean;
  user2Consented: boolean;
  revealedAt?: string;
  tableLabel?: string;
}

// ─── Safety Types ─────────────────────────────────────────────────────────────

export interface BlockPayload {
  blockedId: string;
}

export interface ReportPayload {
  reportedId: string;
  reason: string;
}

// ─── Socket Event Payloads ───────────────────────────────────────────────────

export interface JoinVenuePayload {
  venueId: string;
  sessionId: string;
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
}

export interface RevealConsentPayload {
  conversationId: string;
}

export interface VenueUsersUpdate {
  venueId: string;
  activeCount: number;
  users: AnonymousUser[];
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  isNewUser: boolean;
}

// ─── Admin Types ──────────────────────────────────────────────────────────────

export interface AnalyticsOverview {
  totalUsers: number;
  activeSessions: number;
  totalCheckInsToday: number;
  peakHour: string;
  mostActiveVenue: string;
}

export interface DailyStats {
  date: string;
  checkIns: number;
  activeUsers: number;
  newUsers: number;
}

export interface VenueStats {
  venueId: string;
  venueName: string;
  checkIns: number;
  peakHour: string;
}
