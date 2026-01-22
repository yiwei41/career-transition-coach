
export interface UserContext {
  origin: string;
  considering: string[];
  frictionPoints: string[];
  frictionText?: string;
  experienceSummary?: string;
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

export type Page = 'builder' | 'exploration' | 'validation' | 'decision' | 'exit';
