
import { GoogleGenAI, Type } from "@google/genai";
import { UserContext, AIPreview, RoleCard, SkillMapping, DecisionSupport } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateAIUnderstanding = async (context: UserContext): Promise<AIPreview> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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
    model: "gemini-3-flash-preview",
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
    model: "gemini-3-flash-preview",
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
    model: "gemini-3-flash-preview",
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
