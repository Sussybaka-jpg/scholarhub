
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { createAcademicChat } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "ScholarBot intelligence active. I have access to real-time Google Research grounding. How can I assist?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatRef.current) chatRef.current = createAcademicChat();
      const response: GenerateContentResponse = await chatRef.current.sendMessage({ message: userMessage.text });
      
      let botText = response.text || "Connection lost.";
      
      // Extract Google Search links if present
      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (grounding && Array.isArray(grounding)) {
        const links = grounding.map((chunk: any) => chunk.web?.uri).filter(Boolean);
        if (links.length > 0) {
          botText += "\n\nSources Found:\n" + Array.from(new Set(links)).map(link => `• ${link}`).join('\n');
        }
      }

      setMessages(prev => [...prev, { role: 'model', text: botText, timestamp: new Date().toISOString() }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Neural uplink error.", timestamp: new Date().toISOString() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-96 h-[600px] bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
          <div className="p-8 bg-blue-600 text-white">
            <h3 className="text-xl font-black tracking-tighter">ScholarBot</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Google Search Grounding Enabled</p>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] px-5 py-3.5 rounded-[1.5rem] text-[13px] font-bold leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-900 text-slate-300 border border-slate-800 rounded-tl-none whitespace-pre-wrap'}`}>{msg.text}</div>
              </div>
            ))}
            {isLoading && <div className="p-4 bg-slate-900 rounded-2xl w-fit animate-pulse text-[10px] font-black text-blue-500">CONSULTING SOURCES...</div>}
          </div>
          <form onSubmit={handleSend} className="p-6 bg-slate-900 border-t border-slate-800">
            <div className="relative">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a research query..." className="w-full bg-slate-950 border-2 border-slate-800 focus:border-blue-600 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none transition-all" />
              <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg active:scale-90 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
          </form>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className={`w-16 h-16 rounded-[2rem] shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 ${isOpen ? 'bg-slate-950 border-2 border-slate-800 rotate-90' : 'bg-blue-600 border-2 border-blue-500'}`}>
        {isOpen ? <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
      </button>
    </div>
  );
};

export default ChatBot;
