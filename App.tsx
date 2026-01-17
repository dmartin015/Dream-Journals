
import React, { useState, useEffect } from 'react';
import RecordButton from './components/RecordButton';
import DreamCard from './components/DreamCard';
import { DreamEntry, ImageSize } from './types';
import { transcribeAudio, analyzeDream, generateDreamImage } from './services/geminiService';

const App: React.FC = () => {
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [statusMessage, setStatusMessage] = useState('');

  // Handle the sequential process of transcription, analysis, and visualization
  const handleRecordingComplete = async (base64Audio: string) => {
    setIsProcessing(true);
    setStatusMessage('Translating echoes...');
    
    try {
      // 1. Transcribe the audio recording
      const transcription = await transcribeAudio(base64Audio);
      setStatusMessage('Extracting subconscious layers...');
      
      // 2. Perform psychological analysis
      const analysis = await analyzeDream(transcription);
      setStatusMessage('Painting your inner world...');
      
      // 3. Generate the visual representation
      const imageUrl = await generateDreamImage(transcription, imageSize);
      
      const newEntry: DreamEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        transcription,
        analysis,
        imageUrl,
        imageSize
      };

      setDreams(prev => [newEntry, ...prev]);
      setStatusMessage('');
    } catch (err: any) {
      console.error(err);
      // Fix: Handle specific API error by prompting for key selection as required by guidelines
      if (err.message?.includes("Requested entity was not found")) {
        await window.aistudio.openSelectKey();
      } else {
        alert("The dream was too elusive. Please try again.");
      }
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <nav className="glass-nav sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <i className="fa-solid fa-eye text-white text-xl"></i>
          </div>
          <h1 className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-400">
            ONEIROS
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Canvas Resolution:</span>
            {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setImageSize(size)}
                className={`text-xs px-2 py-0.5 rounded-full transition-all ${
                  imageSize === size 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pt-12">
        {/* Intro view shown when no dreams exist */}
        {dreams.length === 0 && !isProcessing && (
          <div className="text-center py-20 space-y-6">
            <h2 className="text-5xl md:text-7xl font-bold leading-tight">
              Decode the <br/>
              <span className="text-indigo-400 italic">Unconscious.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Whisper your waking visions. Let AI transform your dreams into high-resolution surrealist art and psychological insight.
            </p>
          </div>
        )}

        {/* Processing State overlay */}
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-pulse">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-500/20 rounded-full"></div>
              <div className="absolute top-0 w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-xl font-medium text-indigo-300 tracking-wide uppercase italic">
              {statusMessage}
            </p>
          </div>
        )}

        {/* List of Dream entries */}
        <div className="space-y-12">
          {dreams.map(dream => (
            <DreamCard key={dream.id} entry={dream} />
          ))}
        </div>
      </main>

      {/* Floating control bar for recording and settings */}
      <div className="fixed bottom-0 left-0 right-0 p-8 flex justify-center bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/60 backdrop-blur-2xl p-6 rounded-full border border-white/10 shadow-2xl flex items-center gap-8">
          <div className="hidden md:block">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">Canvas Size</div>
            <div className="flex gap-2">
              {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setImageSize(size)}
                  className={`text-[10px] w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all ${
                    imageSize === size ? 'bg-indigo-600 text-white border-indigo-500' : 'text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-10 w-px bg-white/10 hidden md:block"></div>

          <RecordButton 
            onRecordingComplete={handleRecordingComplete} 
            isProcessing={isProcessing} 
          />
        </div>
      </div>
    </div>
  );
};

export default App;
