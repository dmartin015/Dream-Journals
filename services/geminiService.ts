
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { PsychologicalAnalysis, ImageSize } from '../types';

// Extend window for AI Studio helpers using a named interface to avoid declaration conflicts
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio: AIStudio;
  }
}

// Check for existing API key selection or prompt the user using AI Studio helper
export const checkAndRequestKey = async (): Promise<boolean> => {
  const hasKey = await window.aistudio.hasSelectedApiKey();
  if (!hasKey) {
    await window.aistudio.openSelectKey();
    return true; // Assume success as per instructions to avoid race conditions
  }
  return true;
};

// Transcribe audio using a multimodal-capable Gemini 3 model
export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'audio/webm', data: base64Audio } },
        { text: "Transcribe this dream narration exactly as spoken. Focus on the narrative details." }
      ]
    },
  });
  return response.text || "Transcription failed.";
};

// Analyze dream content with a structured JSON response using Type from @google/genai
export const analyzeDream = async (transcription: string): Promise<PsychologicalAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: transcription,
    config: {
      systemInstruction: "You are a world-class Jungian analyst. Analyze the following dream for emotional themes, symbols, and archetypes. Return a structured JSON response.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          emotionalTheme: { type: Type.STRING },
          archetypes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["name", "description"]
            }
          },
          jungianInsight: { type: Type.STRING },
          symbolism: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                symbol: { type: Type.STRING },
                meaning: { type: Type.STRING }
              },
              required: ["symbol", "meaning"]
            }
          }
        },
        required: ["emotionalTheme", "archetypes", "jungianInsight", "symbolism"]
      }
    }
  });

  try {
    // response.text is a property, not a method
    return JSON.parse(response.text.trim());
  } catch (e) {
    throw new Error("Failed to parse analysis response.");
  }
};

// Generate high-resolution surrealist images based on dream transcription
export const generateDreamImage = async (transcription: string, size: ImageSize): Promise<string> => {
  // Ensure we have a key for gemini-3-pro-image-preview as it requires high-quality image support
  await checkAndRequestKey();
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `A highly detailed surrealist painting representing the emotional core of this dream: "${transcription}". The style should be reminiscent of Salvador Dali and Rene Magritte, ethereal, dream-like, deeply symbolic, and visually striking.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    }
  });

  // Extract the generated image from potentially multiple parts
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image was generated.");
};

// Interactive psychoanalytic dialogue using a complex reasoning model
export const chatWithGemini = async (
  dreamContext: string, 
  history: { role: 'user' | 'model', text: string }[], 
  userInput: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `You are a helpful psychoanalytic companion helping the user explore their dream symbols. 
      Context of the dream: ${dreamContext}
      Provide brief, insightful, and curious responses based on Jungian and archetypal psychology.`,
    }
  });

  // sendMessage returns a response with a .text property
  const result = await chat.sendMessage({ message: userInput });
  return result.text;
};
