
import { GoogleGenAI, Type } from "@google/genai";
import { UserContext, AIPreview, RoleCard, SkillMapping, DecisionSupport, ResumeDraft, UserExperienceInput } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const generateAIUnderstanding = async (context: UserContext): Promise<AIPreview> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Analyze this career transition context and return a structured assessment:
    - Origin: ${context.origin}
    - Considering: ${context.considering.join(", ")}
    - Friction Points: ${context.frictionPoints.join(", ")}
    - Additional Input: ${context.frictionText || "None"}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          clear: { type: Type.ARRAY, items: { type: Type.STRING } },
          assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
          unclear: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["clear", "assumptions", "unclear"]
      },
    },
  });
  return JSON.parse(response.text);
};

export const generateRolePossibilities = async (context: UserContext): Promise<RoleCard[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Generate 3-4 role possibility cards for someone transitioning from ${context.origin} into ${context.considering.join(", ")}. 
    Focus on non-seniority, neutral role names. 
    Explain why each makes sense, the assumptions behind it, and what is still unclear.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            why: { type: Type.ARRAY, items: { type: Type.STRING } },
            assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
            uncertainties: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["id", "name", "why", "assumptions", "uncertainties"]
        }
      },
    },
  });
  return JSON.parse(response.text);
};

export const generateSkillMapping = async (role: RoleCard, context: UserContext): Promise<SkillMapping[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Create a skill mapping table for the role "${role.name}" for a candidate coming from "${context.origin}".
    Each entry should describe a skill, why it matters for this specific role, and what assumed background suggests the user has it.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            skill: { type: Type.STRING },
            whyItMatters: { type: Type.STRING },
            assumedBackground: { type: Type.STRING },
          },
          required: ["skill", "whyItMatters", "assumedBackground"]
        }
      },
    },
  });
  const data = JSON.parse(response.text);
  return data.map((item: any) => ({ ...item, confidence: 'unsure' }));
};

export const generateDecisionSupport = async (role: RoleCard, skills: SkillMapping[], context: UserContext): Promise<DecisionSupport> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Based on the transition analysis for "${role.name}":
    - Origin: ${context.origin}
    - Confirmed Skills: ${skills.filter(s => s.confidence === 'high').map(s => s.skill).join(", ")}
    - Gaps/Unsure: ${skills.filter(s => s.confidence !== 'high').map(s => s.skill).join(", ")}
    Provide a confidence snapshot (Low/Medium/High), the main uncertainty, signals in favor, and open risks.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          confidenceLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          mainUncertainty: { type: Type.STRING },
          signals: { type: Type.ARRAY, items: { type: Type.STRING } },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["confidenceLevel", "mainUncertainty", "signals", "risks"]
      },
    },
  });
  return JSON.parse(response.text);
};

export const generateResumeDraft = async (role: RoleCard, skills: SkillMapping[], context: UserContext, personalInfo?: UserExperienceInput): Promise<ResumeDraft> => {
  const rawExperience = personalInfo?.rawExperience?.trim() || '';
  if (!rawExperience) {
    throw new Error('Please provide your resume or work experience before generating.');
  }

  const contents = `You are a career coach creating a CUSTOMIZED RESUME for a career switcher. Use their EXACT experience data below.

TARGET ROLE: ${role.name}
CURRENT BACKGROUND: ${context.origin}
VALIDATED STRENGTHS: ${skills.filter(s => s.confidence === 'high').map(s => s.skill).join(', ')}

USER'S RESUME/EXPERIENCE (use this as source material):
---
${rawExperience}
---

Generate a resume-ready output:
1. summary: 2-3 sentence professional summary that bridges their background to ${role.name}. Use their specific achievements.
2. experienceBullets: 5-7 REFRAMED bullet points ready to paste into a resume. Each should be 1-2 lines, action-oriented, include metrics if possible. Transform their actual experience for the target role.
3. pivotPoints: 3 before/after examples. original and reframed: max 80 chars each, one line. why: one short sentence.
4. suggestedSkills: 6 skills (mix technical + soft).
5. experienceGuidance: 2-3 SHORT bullet-style sentences (max 15 words each) on presenting work history for ${role.name}.`;

  const modelsToTry = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-3-flash-preview'];
  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              experienceBullets: { type: Type.ARRAY, items: { type: Type.STRING } },
              pivotPoints: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original: { type: Type.STRING },
                    reframed: { type: Type.STRING },
                    why: { type: Type.STRING }
                  },
                  required: ["original", "reframed", "why"]
                }
              },
              suggestedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              experienceGuidance: { type: Type.STRING }
            },
            required: ["summary", "experienceBullets", "pivotPoints", "suggestedSkills", "experienceGuidance"]
          },
        },
      });
      const parsed = JSON.parse(response.text);
      if (!parsed.experienceBullets) parsed.experienceBullets = [];
      return parsed;
    } catch (err) {
      lastError = err;
      const msg = String((err as Error)?.message || err);
      const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
      const isNotFound = msg.includes('404') || msg.includes('NOT_FOUND') || msg.includes('not found');
      if (model === modelsToTry[modelsToTry.length - 1]) {
        if (isQuota) throw new Error('API quota exceeded. Please wait a few minutes and try again, or check your Gemini API plan at ai.google.dev.');
        if (isNotFound) throw new Error('Model unavailable. Please try again later or check ai.google.dev for API status.');
        throw err;
      }
    }
  }
  throw lastError || new Error('Failed to generate resume.');
};

export const refineResumeWithFeedback = async (
  currentResume: ResumeDraft,
  userMessage: string,
  role: RoleCard
): Promise<ResumeDraft> => {
  const contents = `You are a resume coach. The user has a resume draft and wants to adjust it.

CURRENT RESUME (JSON):
${JSON.stringify(currentResume, null, 2)}

TARGET ROLE: ${role.name}

USER'S REQUEST: "${userMessage}"

Apply the user's requested changes. Keep content concise. Return the UPDATED resume in the exact same JSON structure:
- summary: string
- experienceBullets: string[]
- pivotPoints: [{ original, reframed, why }]
- suggestedSkills: string[]
- experienceGuidance: string

Only modify what the user asked for. Keep the rest unchanged.`;

  const modelsToTry = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-3-flash-preview'];
  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              experienceBullets: { type: Type.ARRAY, items: { type: Type.STRING } },
              pivotPoints: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original: { type: Type.STRING },
                    reframed: { type: Type.STRING },
                    why: { type: Type.STRING }
                  },
                  required: ["original", "reframed", "why"]
                }
              },
              suggestedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              experienceGuidance: { type: Type.STRING }
            },
            required: ["summary", "experienceBullets", "pivotPoints", "suggestedSkills", "experienceGuidance"]
          },
        },
      });
      const parsed = JSON.parse(response.text);
      if (!parsed.experienceBullets) parsed.experienceBullets = [];
      return parsed;
    } catch (err) {
      lastError = err;
      const msg = String((err as Error)?.message || err);
      const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
      const isNotFound = msg.includes('404') || msg.includes('NOT_FOUND') || msg.includes('not found');
      if (model === modelsToTry[modelsToTry.length - 1]) {
        if (isQuota) throw new Error('API quota exceeded. Please wait and try again.');
        if (isNotFound) throw new Error('Model unavailable. Please try again later.');
        throw err;
      }
    }
  }
  throw lastError || new Error('Failed to refine resume.');
};
