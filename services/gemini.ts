import { GoogleGenAI, Type } from "@google/genai";

// NOTE: Ideally, the API key should be handled securely on a backend.
// For this frontend-only demo, we rely on the environment variable injection.

export const generateTaskSuggestions = async (subject: string, age: string): Promise<string[]> => {
  if (!process.env.API_KEY) {
    console.warn("API Key missing");
    return ["Learn 5 new animals", "Read page 10", "Practice counting 1-20 in English"];
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Updated prompt for English Learning focus
    const prompt = `Suggest 5 concise English language learning tasks for a student. 
    Focus: ${subject} (Vocabulary, Grammar, Reading, or Speaking). 
    Age Group: ${age}. 
    Output Language: English (keep it simple).
    Examples: "Memorize 5 colors", "Read the short story", "Write 3 sentences about family".
    Return a simple JSON array of strings.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING
            }
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as string[];
    }
    return [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return ["Error connecting to AI", "Please add tasks manually"];
  }
};