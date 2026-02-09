
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Paper, Role, PublicMessage } from './types';
import { ADMIN_EMAIL, DEFAULT_FOLDERS, MOCK_PAPERS } from './constants';
import Auth from './components/Auth';
import PaperCard from './components/PaperCard';
import UploadModal from './components/UploadModal';
import GlobalChat from './components/GlobalChat';
import ChatBot from './components/ChatBot';
import { deleteFromDrive } from './services/driveService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [folders, setFolders] = useState<string[]>(DEFAULT_FOLDERS);
  const [globalMessages, setGlobalMessages] = useState<PublicMessage[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'library' | 'community' | 'settings'>('library');
  const [settingsTab, setSettingsTab] = useState<'profile' | 'drive'>('profile');
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Drive Integration State
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const savedPapers = localStorage.getItem('scholarhub_papers');
    const savedFolders = localStorage.getItem('scholarhub_folders');
    const savedUser = localStorage.getItem('scholarhub_user');
    const savedMessages = localStorage.getItem('scholarhub_global_messages');
    
    if (savedPapers) setPapers(JSON.parse(savedPapers));
    else setPapers(MOCK_PAPERS as Paper[]);

    if (savedFolders) setFolders(JSON.parse(savedFolders));
    if (savedMessages) setGlobalMessages(JSON.parse(savedMessages));
    if (savedUser) setUser(JSON.parse(savedUser));
    
    setTimeout(() => setIsLoadingSession(false), 500);
  }, []);

  useEffect(() => {
    localStorage.setItem('scholarhub_papers', JSON.stringify(papers));
    localStorage.setItem('scholarhub_folders', JSON.stringify(folders));
    localStorage.setItem('scholarhub_global_messages', JSON.stringify(globalMessages));
    if (user) localStorage.setItem('scholarhub_user', JSON.stringify(user));
  }, [papers, folders, globalMessages, user]);

  const handleLogin = (userData: User) => setUser(userData);
  const handleLogout = () => {
    setUser(null);
    setAccessToken(null);
    setIsDriveConnected(false);
    setCurrentView('library');
  };

  const handleAddFolder = () => {
    const name = prompt("Enter new Vault Folder name:");
    if (name && !folders.includes(name)) {
      setFolders(prev => [...prev, name]);
    }
  };

  const handleDeletePaper = async (id: string) => {
    if (user?.role !== 'admin') return alert("Unauthorized.");
    const paper = papers.find(p => p.id === id);
    if (paper && confirm(`Purge "${paper.title}"?`)) {
      try {
        if (accessToken && paper.cloudId) await deleteFromDrive(accessToken, paper.cloudId);
        setPapers(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        alert("Sync Error.");
      }
    }
  };

  const handleUpdatePaper = (updatedPaper: Paper) => {
    setPapers(prev => prev.map(p => p.id === updatedPaper.id ? updatedPaper : p));
  };

  const handleSendMessage = (text: string) => {
    if (!user) return;
    const newMessage: PublicMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderEmail: user.email,
      senderName: user.displayName || user.email.split('@')[0],
      text,
      timestamp: new Date().toISOString(),
      role: user.role
    };
    setGlobalMessages(prev => [...prev, newMessage]);
  };

  const handleGoogleDriveLogin = useCallback(() => {
    // @ts-ignore
    if (typeof google === 'undefined') return alert("Google Identity Services node missing.");
    
    const clientId = process.env.GOOGLE_CLIENT_ID || '967332215682-scholarhub.apps.googleusercontent.com';
    
    setIsConnectingDrive(true);
    try {
      // @ts-ignore
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly',
        callback: (resp: any) => {
          setIsConnectingDrive(false);
          if (resp.access_token) {
            setAccessToken(resp.access_token);
            setIsDriveConnected(true);
          } else if (resp.error) {
            console.error("Auth Response Error:", resp);
            alert(`Auth Error: ${resp.error_description || resp.error}`);
          }
        },
      });
      client.requestAccessToken();
    } catch (err) { 
      console.error("Auth Setup Error:", err);
      setIsConnectingDrive(false); 
    }
  }, []);

  const filteredPapers = useMemo(() => {
    return papers.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder = selectedFolder === 'All' || p.folder === selectedFolder;
      return matchesSearch && matchesFolder;
    });
  }, [papers, searchQuery, selectedFolder]);

  const stats = useMemo(() => ({
    total: papers.length,
    synced: papers.filter(p => p.syncStatus === 'synced').length,
    folders: folders.length
  }), [papers, folders]);

  if (isLoadingSession) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-1">ScholarHub Cloud</p>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Establishing Secure Uplink...</p>
        </div>
      </div>
    </div>
  );

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      <div className="bg-slate-900 border-b border-slate-800 py-1.5 text-center sticky top-0 z-[60] w-full px-4 flex items-center justify-center gap-4">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Node Syncing: {stats.synced}/{stats.total} Objects</span>
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className={`fixed md:sticky top-0 left-0 z-[80] md:z-50 w-72 h-full bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${user.role === 'admin' ? 'bg-indigo-600' : 'bg-blue-600'} shadow-lg`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <span className="text-xl font-black tracking-tighter">ScholarHub</span>
            </div>

            <nav className="space-y-1">
              {['library', 'community', 'settings'].map(view => (
                <button key={view} onClick={() => setCurrentView(view as any)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${currentView === view ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>
                  <span className="font-bold text-xs uppercase tracking-widest">{view}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 px-8 py-4 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Vault Folders</h2>
              {user.role === 'admin' && <button onClick={handleAddFolder} className="text-blue-500 hover:text-white">+</button>}
            </div>
            <div className="space-y-1">
              <button onClick={() => setSelectedFolder('All')} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${selectedFolder === 'All' ? 'text-blue-400' : 'text-slate-600 hover:text-slate-400'}`}># All Archives</button>
              {folders.map(f => (
                <button key={f} onClick={() => setSelectedFolder(f)} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${selectedFolder === f ? 'text-blue-400' : 'text-slate-600 hover:text-slate-400'}`}># {f}</button>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-slate-800">
            <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white">{user.displayName?.[0] || 'S'}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white truncate">{user.displayName || 'Scholar'}</p>
                <button onClick={handleLogout} className="text-[9px] font-bold text-red-500 uppercase">Disconnect</button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950">
          <header className="h-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 px-12 flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Query archives..." className="w-full bg-slate-900 border-2 border-transparent focus:border-blue-600 rounded-2xl px-6 py-3 text-sm font-bold text-white outline-none transition-all" />
            </div>
            <button onClick={() => { if (!isDriveConnected) { setCurrentView('settings'); setSettingsTab('drive'); return alert("Connect Drive Node first."); } setIsUploadModalOpen(true); }} className="px-8 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-500 shadow-xl shadow-blue-900/40 active:scale-95 transition-all">Upload Node</button>
          </header>

          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
            {currentView === 'library' && (
              <div className="max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-12">
                   <div>
                      <h1 className="text-5xl font-black text-white tracking-tighter mb-2">{selectedFolder}</h1>
                      <div className="flex gap-4">
                         <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">{stats.total} Objects</span>
                         <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">{stats.folders} Folders</span>
                      </div>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredPapers.map(p => <PaperCard key={p.id} paper={p} role={user.role} onDelete={handleDeletePaper} onUpdatePaper={handleUpdatePaper} />)}
                </div>
              </div>
            )}
            {currentView === 'community' && <GlobalChat currentUser={user} messages={globalMessages} onSendMessage={handleSendMessage} />}
            {currentView === 'settings' && (
              <div className="max-w-2xl mx-auto py-12">
                 <h1 className="text-4xl font-black text-white tracking-tighter mb-12">Node Settings</h1>
                 <div className="space-y-8">
                    <section className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800">
                       <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Cloud Uplink</h3>
                       <div className="flex items-center justify-between p-6 bg-slate-950 rounded-2xl border border-slate-800">
                          <div className="flex items-center gap-4">
                             <div className={`w-3 h-3 rounded-full ${isDriveConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                             <span className="text-sm font-bold text-white">{isDriveConnected ? 'Google Drive Active' : 'Disconnected'}</span>
                          </div>
                          <button onClick={isDriveConnected ? () => setIsDriveConnected(false) : handleGoogleDriveLogin} className="px-6 py-2 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest">{isDriveConnected ? 'Disconnect' : 'Connect'}</button>
                       </div>
                    </section>
                 </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <ChatBot />
      {isUploadModalOpen && accessToken && <UploadModal folders={folders} uploaderEmail={user.email} accessToken={accessToken} onClose={() => setIsUploadModalOpen(false)} onUpload={p => { setPapers(prev => [p, ...prev]); setIsUploadModalOpen(false); }} />}
    </div>
  );
};

export default App;
