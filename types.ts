
export interface ClipData {
  title: string;
  startTime: string;
  endTime: string;
  description: string;
  viralityScore: number;
  reasoning: string;
}

export interface SmartClipResponse {
  clips: ClipData[];
  overallSummary: string;
}

export interface VideoAsset {
  file: File;
  previewUrl: string;
  base64Data: string;
  mimeType: string;
  storagePath?: string; // For Supabase Storage reference
  source: 'LOCAL' | 'CLOUD';
}

export enum AppView {
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD',
  USER_DASHBOARD = 'USER_DASHBOARD',
  CLIPS = 'CLIPS',
  TRAILER = 'TRAILER',
  BLOG = 'BLOG',
  SCRIPT = 'SCRIPT',
  REPURPOSE = 'REPURPOSE',
  CHAT = 'CHAT',
  SOCIAL = 'SOCIAL',
  PROMPTS = 'PROMPTS',
  SETTINGS = 'SETTINGS',
  PRICING = 'PRICING',
  TIKTOK = 'TIKTOK',
  SHORTS = 'SHORTS',
  PERFORMANCE = 'PERFORMANCE',
  CHECKOUT = 'CHECKOUT',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_DECLINED = 'PAYMENT_DECLINED',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  WATERMARK_REMOVER = 'WATERMARK_REMOVER',
  PURCHASE_CREDITS = 'PURCHASE_CREDITS'
}

export enum UserTier {
  FREE = 'FREE',
  CREATOR = 'CREATOR',
  AGENCY = 'AGENCY'
}

export enum AIProvider {
  GEMINI = 'GEMINI',
  OPENAI = 'OPENAI',
  CLAUDE = 'CLAUDE'
}

export interface ViralityMetric {
  category: string;
  score: number;
  fullMark: number;
}

export interface SocialPost {
  platform: 'TWITTER' | 'LINKEDIN';
  content: string[]; // Array of strings (tweets or slides)
}

export interface ImagePrompt {
  conceptName: string;
  prompt: string;
  rationale: string;
}

export interface TrailerCut {
  startTime: string;
  endTime: string;
  description: string;
}

export interface TrailerResponse {
  title: string;
  mood: string;
  synopsis: string;
  cuts: TrailerCut[];
}

export interface ShortsStrategy {
  hooks: string[];
  audioSuggestions: string[];
  hashtags: string[];
  description: string;
}

export interface CaptionWord {
  word: string;
  start: number;
  end: number;
}

export interface SystemLog {
  id: number;
  type: 'INFO' | 'WARN' | 'ERR' | 'SUCCESS';
  msg: string;
  timestamp: string;
}

export interface AppStats {
  uploads: number;
  storageMB: number;
  apiCalls: number;
}

export interface SocialConnection {
  platform: 'TWITTER' | 'LINKEDIN';
  connected: boolean;
  username?: string;
}

// Backend Integration Types
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface PostHogConfig {
  apiKey: string;
  host: string;
}