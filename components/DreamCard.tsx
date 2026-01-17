
import React, { useState } from 'react';
import { DreamEntry, ChatMessage } from '../types';
import { chatWithGemini } from '../services/geminiService';

interface DreamCardProps {
  entry: DreamEntry;
}

const DreamCard: React.FC<DreamCardProps> = ({ entry }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const newUserMsg: ChatMessage = { role: 'user', text: chatInput };
    setMessages(prev => [...prev, newUserMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await chatWithGemini(entry.transcription, messages, chatInput);
      setMessages(prev => [...prev, { role: 'model', text: response || "I'm contemplating that symbol..." }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to the psyche. Try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="dream-card rounded-3xl overflow-hidden mb-12 shadow-2xl transition-all duration-500 hover:border-white/20">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Left: Image & Transcription */}
        <div className="p-8 border-b md:border-b-0 md:border-r border-white/5">
          <div className="relative group overflow-hidden rounded-2xl mb-6 bg-slate-900 aspect-square">
            {entry.imageUrl ? (
              <img 
                src={entry.imageUrl} 
                alt="Surrealist Dream Representation" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-700">
                <i className="fa-solid fa-image text-4xl mb-2"></i>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest text-indigo-300">
              {entry.imageSize} Surreal Canvas
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-quote-left"></i>
              Dream Transcription
            </h3>
            <p className="text-slate-300 leading-relaxed italic text-lg">
              "{entry.transcription}"
            </p>
            <div className="text-xs text-slate-500">
              Captured {new Date(entry.timestamp).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Right: Analysis */}
        <div className="p-8 bg-black/20 flex flex-col">
          {entry.analysis ? (
            <div className="flex-1 space-y-8">
              <section>
                <h3 className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3">Emotional Resonance</h3>
                <p className="text-xl font-medium text-slate-100">{entry.analysis.emotionalTheme}</p>
              </section>

              <section>
                <h3 className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3">Active Archetypes</h3>
                <div className="flex flex-wrap gap-2">
                  {entry.analysis.archetypes.map((arch, i) => (
                    <div key={i} className="group relative">
                      <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-sm text-indigo-200 cursor-help">
                        {arch.name}
                      </span>
                      <div className="absolute bottom-full mb-2 left-0 w-48 p-3 bg-indigo-950 border border-indigo-500/40 rounded-xl shadow-2xl text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {arch.description}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3">Jungian Interpretation</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {entry.analysis.jungianInsight}
                </p>
              </section>

              <section>
                <h3 className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3">Symbolic Lexicon</h3>
                <div className="grid grid-cols-1 gap-4">
                  {entry.analysis.symbolism.map((sym, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-1">
                        <span className="text-xs text-indigo-400">{i + 1}</span>
                      </div>
                      <div>
                        <span className="text-slate-100 font-semibold">{sym.symbol}:</span>
                        <span className="text-slate-400 text-sm ml-2">{sym.meaning}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-500">Analysis pending...</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/5">
            <button 
              onClick={() => setChatOpen(!chatOpen)}
              className="w-full py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-600/40 text-indigo-200 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <i className={`fa-solid ${chatOpen ? 'fa-times' : 'fa-comment-dots'}`}></i>
              {chatOpen ? 'Close Symbol Dialogue' : 'Inquire about Symbols'}
            </button>
          </div>
        </div>
      </div>

      {/* Symbol Chat Interface */}
      {chatOpen && (
        <div className="border-t border-white/5 bg-black/40 h-96 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 mt-12 px-8">
                <i className="fa-solid fa-compass text-3xl mb-4 opacity-20"></i>
                <p>Ask about specific details, colors, or feelings from your dream to uncover deeper layers.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white/5 text-slate-300 rounded-bl-none border border-white/10'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-3 rounded-2xl rounded-bl-none border border-white/10 space-x-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full inline-block animate-bounce" style={{animationDelay: '0ms'}}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full inline-block animate-bounce" style={{animationDelay: '150ms'}}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full inline-block animate-bounce" style={{animationDelay: '300ms'}}></span>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-slate-900/50 flex gap-2">
            <input 
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="What does the red key signify?"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={isTyping}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            >
              <i className="fa-solid fa-paper-plane text-sm"></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DreamCard;
