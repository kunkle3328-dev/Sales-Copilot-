export enum SessionStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  ACTIVE = 'active',
  ERROR = 'error',
  FINISHED = 'finished'
}

export type ViewType = 'copilot' | 'admin' | 'pricing';

export interface AppConfig {
  enableLiveSuggestions: boolean;
  enableObjectionDetection: boolean;
  enableBuyingSignals: boolean;
  enableDealHealth: boolean;
  adminMode: boolean; // Simulates an admin user
  systemLimits: {
    maxCallDuration: number; // minutes
    suggestionFrequency: 'Low' | 'Medium' | 'High';
    memoryRetention: 'Session' | 'User' | 'Account';
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Manager' | 'Seller';
  status: 'Active' | 'Suspended' | 'Invited';
  lastActive: string;
  permissions: {
    canExportData: boolean;
    canEditPlaybooks: boolean;
    canSeeTeamAnalytics: boolean;
    canManageUsers: boolean;
  };
}

export interface PlaybookEntry {
  id: string;
  name: string;
  trigger: string;
  responseStrategy: string;
  isActive: boolean;
}

export interface Objection {
  type: 'Pricing' | 'Timing' | 'Trust' | 'Authority' | 'Competition' | 'Need/Fit' | 'Other';
  confidence: number;
  suggestion: string;
  timestamp: number;
}

export interface SalesInsight {
  dealHealth: number; // 0-100
  buyingSignal?: string;
  latestSuggestion?: string;
  lastUpdated: number;
}

export interface TranscriptItem {
  id: string;
  role: 'user' | 'model'; // 'user' is the conversation (seller/prospect), 'model' is the coach
  text: string;
  timestamp: number;
  isFinal: boolean;
}

export interface CallSummary {
  overview: string;
  objections: string[];
  followUpEmail: string;
  actionItems: string[];
}