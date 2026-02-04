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

export const generateResumeDraft = async (
  role: RoleCard,
  skills: SkillMapping[],
  context: UserContext,
  personalInfo?: UserExperienceInput
): Promise<ResumeDraft> => {
  const contents = `Create a "Bridge Narrative" resume draft for a career switcher.
Target Role: ${role.name}
Current Background: ${context.origin}
Validated Strengths: ${skills.filter(s => s.confidence === 'high').map(s => s.skill).join(", ")}

PERSONAL EVIDENCE PROVIDED BY USER:
- Raw Experience/Resume Data: ${personalInfo?.rawExperience || "Not provided"}

INSTRUCTIONS:
The output should focus on REFRAMING the specific evidence provided by the user for the target role.
- summary: A 2-3 sentence professional summary that bridges the two fields using user's specific background.
- pivotPoints: 3 specific examples where you take an "original" bullet point from the user's raw input and "reframe" it for the target role. Explain "why" it works.
- suggestedSkills: Top 6 technical/soft skills to list based on both the target role and user's validated strengths.
- experienceGuidance: Specific advice on how to structure their unique work history.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
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
        required: ["summary", "pivotPoints", "suggestedSkills", "experienceGuidance"]
      },
    },
  });

  return JSON.parse(response.text);
};
