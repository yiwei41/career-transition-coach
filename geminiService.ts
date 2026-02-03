
import { GoogleGenAI, Type } from "@google/genai";
import { UserContext, AIPreview, RoleCard, SkillMapping, DecisionSupport } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateAIUnderstanding = async (context: UserContext): Promise<AIPreview> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Analyze this career transition context and return a structured assessment.
    - Origin: ${context.origin}
    - Considering: ${context.considering.join(", ")}
    - Friction Points: ${context.frictionPoints.join(", ")}
    - Additional Input: ${context.frictionText || "None"}

    IMPORTANT: Keep each item in clear, assumptions, and unclear arrays brief and concise (short phrases, not full sentences).`,
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
    model: "gemini-2.5-flash",
    contents: `Generate 3-4 role possibility cards for someone transitioning from ${context.origin} into ${context.considering.join(", ")}. 
    Focus on non-seniority, neutral role names. 
    For each role, provide why (makes sense), assumptions, and uncertainties. 
    IMPORTANT: Keep each item in why, assumptions, and uncertainties to 1 short sentence or phrase (max ~15 words). Be concise.`,
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
    model: "gemini-2.5-flash",
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
    model: "gemini-2.5-flash",
    contents: `Based on the transition analysis for "${role.name}":
    - Origin: ${context.origin}
    - Confirmed Skills: ${skills.filter(s => s.confidence === 'high').map(s => s.skill).join(", ")}
    - Gaps/Unsure: ${skills.filter(s => s.confidence !== 'high').map(s => s.skill).join(", ")}
    Provide: (1) a confidence snapshot (Low/Medium/High), (2) the main uncertainty, (3) signals in favor, (4) open risks, and (5) 3–4 concrete suggested next steps the user can take (e.g. "Talk to 2 people in this role", "Try a small project in X", "Take a short course in Y"). Make next steps specific and actionable.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          confidenceLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          mainUncertainty: { type: Type.STRING },
          signals: { type: Type.ARRAY, items: { type: Type.STRING } },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedNextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["confidenceLevel", "mainUncertainty", "signals", "risks", "suggestedNextSteps"]
      },
    },
  });
  return JSON.parse(response.text);
};

export const generateResumeReframe = async (
  role: RoleCard,
  context: UserContext,
  resumeText: string,
  highSkills: string[]
): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You are a career transition coach. Reframe the following resume content for a candidate transitioning to the role "${role.name}" from "${context.origin}".

**Validated strengths to emphasize:** ${highSkills.length ? highSkills.join(', ') : 'None specified yet.'}

**Original resume content:**
---
${resumeText}
---

**Instructions:**
1. Extract outcomes from tasks and reframe them in Product Enablement / ${role.name} terminology.
2. Weight bullet points by relevance to the target role.
3. Keep the same structure (bullet points) but make each point more impactful and role-aligned.
4. Output the reframed resume as plain text with bullet points (use "- " for bullets).
5. Do NOT add headers, explanations, or meta-commentary. Output ONLY the reframed resume content.`,
  });
  return response.text;
};
