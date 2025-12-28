import axios from "axios";

const GROK_API_KEY = process.env.XAI_API_KEY;
const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

export interface GrokMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GrokResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callGrok(messages: GrokMessage[]): Promise<string> {
  if (!GROK_API_KEY) {
    throw new Error("Grok API key not configured");
  }

  try {
    const response = await axios.post<GrokResponse>(
      GROK_API_URL,
      {
        model: "grok-4-1-fast-non-reasoning",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROK_API_KEY}`,
        },
      }
    );

    return response.data.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";
  } catch (error) {
    console.error("Grok API error:", error);
    throw new Error("Failed to get response from AI");
  }
}

export async function generateDailyInsight(userContext: {
  name?: string;
  currentWeight?: number;
  targetWeight?: number;
  primaryGoal?: string;
  daysActive?: number;
}): Promise<{ title: string; content: string; type: "motivation" | "education" | "tip" | "reminder" | "celebration" }> {
  const systemPrompt = `You are a supportive and knowledgeable health coach specializing in obesity reversal and metabolic health. 
Generate a personalized daily insight for the user. The insight should be:
- Encouraging and motivational
- Evidence-based and practical
- Concise (2-3 sentences)
- Focused on one specific aspect of their journey

Return ONLY a JSON object with this structure:
{
  "title": "Brief catchy title",
  "content": "The insight message",
  "type": "motivation" | "education" | "tip" | "reminder" | "celebration"
}`;

  let userPrompt = "Generate a daily insight for me.";
  if (userContext.name) userPrompt += ` My name is ${userContext.name}.`;
  if (userContext.currentWeight && userContext.targetWeight) {
    userPrompt += ` I'm currently ${userContext.currentWeight} lbs and my target is ${userContext.targetWeight} lbs.`;
  }
  if (userContext.primaryGoal) userPrompt += ` My goal: ${userContext.primaryGoal}`;

  try {
    const response = await callGrok([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    // Try to parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || "Daily Insight",
        content: parsed.content || response,
        type: parsed.type || "motivation",
      };
    }

    // Fallback if not JSON
    return {
      title: "Daily Insight",
      content: response,
      type: "motivation",
    };
  } catch (error) {
    console.error("Failed to generate daily insight:", error);
    // Return a fallback insight
    return {
      title: "Stay Consistent",
      content: "Remember, sustainable weight loss is a marathon, not a sprint. Every healthy choice you make today is an investment in your future health.",
      type: "motivation",
    };
  }
}
