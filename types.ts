
export interface Archetype {
  name: string;
  description: string;
}

export interface PsychologicalAnalysis {
  emotionalTheme: string;
  archetypes: Archetype[];
  jungianInsight: string;
  symbolism: { symbol: string; meaning: string }[];
}

export interface DreamEntry {
  id: string;
  timestamp: number;
  transcription: string;
  imageUrl?: string;
  analysis?: PsychologicalAnalysis;
  imageSize: '1K' | '2K' | '4K';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ImageSize = '1K' | '2K' | '4K';
