
export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface UserContext {
  origin: string;
  considering: string[];
  frictionPoints: string[];
  frictionText?: string;
  experienceSummary?: string;
}

export interface UserExperienceInput {
  rawExperience: string;
  fullName?: string;
  contactEmail?: string;
  linkedIn?: string;
}

export interface AIPreview {
  clear: string[];
  assumptions: string[];
  unclear: string[];
}

export interface RoleCard {
  id: string;
  name: string;
  why: string[];
  assumptions: string[];
  uncertainties: string[];
  userFeedback?: 'worth' | 'unsure' | 'no';
}

export interface SkillMapping {
  skill: string;
  whyItMatters: string;
  assumedBackground: string;
  confidence: 'high' | 'unsure' | 'gap';
}

export interface DecisionSupport {
  confidenceLevel: 'Low' | 'Medium' | 'High';
  mainUncertainty: string;
  signals: string[];
  risks: string[];
}

export interface ResumeDraft {
  summary: string;
  experienceBullets: string[];
  pivotPoints: { original: string; reframed: string; why: string }[];
  suggestedSkills: string[];
  experienceGuidance: string;
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  role: RoleCard;
  context: UserContext;
  skills: SkillMapping[];
  decision?: DecisionSupport;
  completed: boolean;
}

export type Page = 'intro' | 'builder' | 'exploration' | 'validation' | 'decision' | 'resume-form' | 'resume' | 'history' | 'exit';
