/**
 * database.ts
 * Complete TypeScript types for all Supabase tables and shared domain interfaces.
 */

// ---------------------------------------------------------------------------
// Shared domain interfaces
// ---------------------------------------------------------------------------

export interface ImageFeatureVector {
  warmth: number;
  brightness: number;
  contrast: number;
  saturation: number;
  naturalLight: number;
  candidness: number;
  posedness: number;
  editorialness: number;
  documentaryness: number;
  intimacy: number;
  wideComposition: number;
  retouchLevel: number;
  emotionalIntensity: number;
  minimalism: number;
}

export interface AlignmentDimension {
  key: keyof ImageFeatureVector;
  photographerValue: number;
  clientValue: number;
  difference: number;
  weight: number;
}

export interface AlignmentMismatch {
  dimension: keyof ImageFeatureVector;
  photographerValue: number;
  clientValue: number;
  difference: number;
  explanation: string;
}

export interface BriefContent {
  visualDirection: string[];
  priorityAttributes: string[];
  avoid: string[];
  mustHaveShots: string[];
  editingExpectations: string;
  referenceImageIds: string[];
  openQuestions: string[];
  summary: string;
}

export interface ClientAnswers {
  sessionType?: string;
  location?: string;
  mood?: string;
  specialRequests?: string;
}

// ---------------------------------------------------------------------------
// Database row types
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  display_name: string | null;
  studio_name: string | null;
  avatar_path: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  owner_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'draft' | 'active' | 'waiting' | 'aligned' | 'archived';

export interface Project {
  id: string;
  owner_id: string;
  client_id: string | null;
  name: string;
  type: string;
  event_date: string | null;
  status: ProjectStatus;
  alignment_score: number | null;
  created_at: string;
  updated_at: string;
}

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PortfolioImage {
  id: string;
  owner_id: string;
  storage_path: string;
  thumbnail_path: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  category: string | null;
  is_style_reference: boolean;
  analysis_status: AnalysisStatus;
  created_at: string;
  updated_at: string;
}

export interface ImageFeatures {
  image_id: string;
  feature_version: string;
  features: ImageFeatureVector;
  embedding: number[] | null;
  confidence: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface ProjectReferenceImage {
  project_id: string;
  image_id: string;
  sort_order: number;
}

export type SessionStatus = 'pending' | 'active' | 'completed' | 'revoked';

export interface ClientSession {
  id: string;
  project_id: string;
  token_hash: string;
  expires_at: string;
  status: SessionStatus;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface PairwiseChoice {
  id: string;
  session_id: string;
  left_image_id: string;
  right_image_id: string;
  selected_image_id: string;
  response_ms: number | null;
  created_at: string;
}

export interface ClientAnswerRecord {
  session_id: string;
  answers: ClientAnswers;
  created_at: string;
}

export interface PreferenceProfile {
  session_id: string;
  vector: ImageFeatureVector;
  confidence: Record<string, number>;
  algorithm_version: string;
  created_at: string;
}

export interface StyleProfile {
  owner_id: string;
  vector: ImageFeatureVector;
  spread: Record<string, number>;
  sample_count: number;
  algorithm_version: string;
  updated_at: string;
}

export interface AlignmentResult {
  project_id: string;
  score: number;
  dimensions: AlignmentDimension[];
  mismatches: AlignmentMismatch[];
  explanation: string | null;
  algorithm_version: string;
  created_at: string;
}

export type BriefStatus = 'draft' | 'pending_approval' | 'approved';

export interface Brief {
  id: string;
  project_id: string;
  version: number;
  content: BriefContent;
  status: BriefStatus;
  created_at: string;
  updated_at: string;
}

export type ActorType = 'photographer' | 'client';

export interface BriefApproval {
  brief_id: string;
  actor_type: ActorType;
  approved_at: string;
  comment: string | null;
}

// ---------------------------------------------------------------------------
// Database schema aggregate (for typed Supabase client)
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Client, 'id' | 'owner_id' | 'created_at' | 'updated_at'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'owner_id' | 'created_at' | 'updated_at'>>;
      };
      portfolio_images: {
        Row: PortfolioImage;
        Insert: Omit<PortfolioImage, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PortfolioImage, 'id' | 'owner_id' | 'created_at' | 'updated_at'>>;
      };
      image_features: {
        Row: ImageFeatures;
        Insert: ImageFeatures;
        Update: Partial<ImageFeatures>;
      };
      project_reference_images: {
        Row: ProjectReferenceImage;
        Insert: ProjectReferenceImage;
        Update: Partial<ProjectReferenceImage>;
      };
      client_sessions: {
        Row: ClientSession;
        Insert: Omit<ClientSession, 'id' | 'created_at'>;
        Update: Partial<Omit<ClientSession, 'id' | 'created_at'>>;
      };
      pairwise_choices: {
        Row: PairwiseChoice;
        Insert: Omit<PairwiseChoice, 'id' | 'created_at'>;
        Update: never;
      };
      client_answers: {
        Row: ClientAnswerRecord;
        Insert: ClientAnswerRecord;
        Update: never;
      };
      preference_profiles: {
        Row: PreferenceProfile;
        Insert: PreferenceProfile;
        Update: Partial<PreferenceProfile>;
      };
      style_profiles: {
        Row: StyleProfile;
        Insert: StyleProfile;
        Update: Partial<StyleProfile>;
      };
      alignment_results: {
        Row: AlignmentResult;
        Insert: AlignmentResult;
        Update: Partial<AlignmentResult>;
      };
      briefs: {
        Row: Brief;
        Insert: Omit<Brief, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Brief, 'id' | 'created_at' | 'updated_at'>>;
      };
      brief_approvals: {
        Row: BriefApproval;
        Insert: BriefApproval;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      project_status: ProjectStatus;
      session_status: SessionStatus;
      analysis_status: AnalysisStatus;
      brief_status: BriefStatus;
      actor_type: ActorType;
    };
  };
}
