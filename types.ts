
export interface HistoryRecord {
  id: string;
  timestamp: number;
  role: RoleCard;
  context: UserContext;
  skills: SkillMapping[];
  decision?: DecisionSupport;
  completed: boolean; // true if reached decision page, false if exited early
}

export interface ResumeDraft {
  summary: string;
  pivotPoints: { original: string; reframed: string; why: string }[];
  suggestedSkills: string[];
  experienceGuidance: string;
}

export type Page =
  | 'builder'
  | 'exploration'
  | 'validation'
  | 'decision'
  | 'resume-form'
  | 'resume'
  | 'history'
  | 'exit';
