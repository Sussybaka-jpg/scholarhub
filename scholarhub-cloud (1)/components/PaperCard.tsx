
import React, { useState } from 'react';
import { Paper, Role } from '../types';
import { summarizePaper, speakSummary } from '../services/geminiService';

interface PaperCardProps {
  paper: Paper;
  role: Role;
  onDelete: (id: string) => void;
  onUpdatePaper: (updatedPaper: Paper) => void;
}

const PaperCard: React.FC<PaperCardProps> = ({ paper, role, onDelete, onUpdatePaper }) => {
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    const res = await summarizePaper(paper.title, paper.fileType);
    onUpdatePaper({ ...paper, summary: res });
    setLoading(false);
  };

  const handleSpeak = async () => {
    if (!paper.summary) return;
    setIsPlaying(true);
    await speakSummary(paper.summary);
    setIsPlaying(false);
  };

  const handleDownload = () => {
    if (!paper.fileData) return;
    window.open(paper.fileData, '_blank');
  };

  return (
    <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden flex flex-col group hover:border-blue-600 transition-all shadow-2xl h-full">
      <div className="aspect-video bg-slate-950 relative flex items-center justify-center">
        {paper.fileType.startsWith('image/') ? (
          <img src={paper.fileData} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
        ) : (
          <div className="text-blue-500 opacity-20 group-hover:opacity-100 transition-all">
            <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          {role === 'admin' && (
            <button onClick={() => onDelete(paper.id)} className="p-3 bg-red-950/40 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
          )}
          <button onClick={handleDownload} className="p-3 bg-slate-900/80 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></button>
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <h3 className="text-xl font-black text-white mb-2 line-clamp-1">{paper.title}</h3>
        <div className="flex gap-2 mb-6">
          <span className="px-3 py-1 bg-slate-800 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">{paper.folder}</span>
          <span className="px-3 py-1 bg-blue-950/30 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest">{paper.fileType.split('/')[1]}</span>
        </div>

        {paper.summary ? (
          <div className="bg-slate-950 p-6 rounded-2xl border border-blue-900/20 mb-6 group/brief relative">
            <p className="text-[11px] text-slate-400 font-bold leading-relaxed">{paper.summary}</p>
            <button onClick={handleSpeak} disabled={isPlaying} className="absolute bottom-2 right-2 p-2 bg-blue-600/10 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
              <svg className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            </button>
          </div>
        ) : (
          <button onClick={handleSummarize} disabled={loading} className="w-full py-3 border-2 border-dashed border-slate-800 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:border-blue-600 hover:text-blue-400 transition-all mb-6">{loading ? 'Synthesizing...' : 'Generate AI Brief'}</button>
        )}

        <div className="mt-auto pt-6 border-t border-slate-800 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-black text-blue-500">{paper.uploader[0].toUpperCase()}</div>
              <span className="text-[9px] font-bold text-slate-600 uppercase truncate max-w-[100px]">{paper.uploader}</span>
           </div>
           <span className="text-[9px] font-bold text-slate-800 uppercase tracking-tighter">Synced to node</span>
        </div>
      </div>
    </div>
  );
};

export default PaperCard;
