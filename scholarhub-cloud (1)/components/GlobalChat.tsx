
import React, { useState, useRef, useEffect } from 'react';
import { User, PublicMessage } from '../types';

interface GlobalChatProps {
  currentUser: User;
  messages: PublicMessage[];
  onSendMessage: (text: string) => void;
}

const GlobalChat: React.FC<GlobalChatProps> = ({ currentUser, messages, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-220px)] bg-slate-900 rounded-[1.5rem] md:rounded-[3rem] shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 md:p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter">Community Node</h2>
          <p className="text-blue-500 font-bold text-[8px] md:text-[10px] uppercase tracking-[0.2em] mt-1">Live Discussion Feed</p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 custom-scrollbar bg-slate-950"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-20">
             <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-800 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mb-4">
               <svg className="w-8 h-8 md:w-10 md:h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
               </svg>
             </div>
             <p className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-500">Silence in the Node</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderEmail === currentUser.email;
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
              >
                <div className={`flex items-end gap-2 md:gap-3 max-w-[90%] md:max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-[0.75rem] md:rounded-[1.25rem] flex-shrink-0 flex items-center justify-center font-black text-[10px] md:text-xs text-white shadow-lg ${msg.role === 'admin' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                    {msg.senderName[0].toUpperCase()}
                  </div>
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1.5">
                       <span className={`text-[9px] md:text-[10px] font-black ${msg.role === 'admin' ? 'text-indigo-400' : 'text-slate-400'}`}>{msg.senderName}</span>
                       <span className="text-[7px] md:text-[8px] font-bold text-slate-600 uppercase">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`px-4 md:px-6 py-2.5 md:py-4 rounded-[1rem] md:rounded-[1.5rem] text-xs md:text-sm font-medium shadow-xl ${
                      isMe 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 md:p-8 border-t border-slate-800 bg-slate-900">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Signal the community..."
            className="w-full pl-5 pr-20 md:pl-8 md:pr-24 py-3.5 md:py-6 bg-slate-950 border-2 border-slate-800 rounded-[1.25rem] md:rounded-[2rem] focus:bg-slate-800 focus:border-blue-600 outline-none transition-all text-[13px] md:text-sm font-bold text-white placeholder-slate-600"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 md:px-8 py-2 md:py-3.5 bg-blue-600 text-white rounded-xl md:rounded-2xl shadow-xl shadow-blue-900/40 hover:bg-blue-500 active:scale-95 disabled:opacity-30 transition-all font-black text-[10px] md:text-xs uppercase tracking-widest"
          >
            Signal
          </button>
        </form>
      </div>
    </div>
  );
};

export default GlobalChat;
