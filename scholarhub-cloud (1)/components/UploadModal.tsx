
import React, { useState } from 'react';
import { Paper } from '../types';
import { getOrCreateFolder, uploadToDrive } from '../services/driveService';

interface UploadModalProps {
  folders: string[];
  uploaderEmail: string;
  accessToken: string;
  onClose: () => void;
  onUpload: (paper: Paper) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ folders, uploaderEmail, accessToken, onClose, onUpload }) => {
  const [title, setTitle] = useState('');
  const [folderName, setFolderName] = useState(folders[0] || 'General Resources');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || isUploading) return;

    setIsUploading(true);
    setStatusMessage('Scanning cloud node...');

    try {
      // 1. Get or Create the folder in Google Drive
      const parentFolderId = await getOrCreateFolder(accessToken, folderName);
      setStatusMessage('Handshaking with Drive...');

      // 2. Upload file
      const driveFile = await uploadToDrive(accessToken, file, parentFolderId);
      setStatusMessage('Finalizing sync...');

      // 3. Return paper metadata
      onUpload({
        id: Math.random().toString(36).substr(2, 9),
        title,
        folder: folderName,
        fileName: file.name,
        fileType: file.type,
        fileData: driveFile.webViewLink || '', // Use cloud link
        uploader: uploaderEmail,
        uploadedAt: new Date().toISOString(),
        storageNode: uploaderEmail,
        cloudId: driveFile.id,
        syncStatus: 'synced'
      });
    } catch (error: any) {
      console.error("Uplink Error:", error);
      alert(`Critical error: ${error.message}`);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-800 animate-in fade-in zoom-in duration-200">
        <div className="p-8 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center rounded-t-[2.5rem]">
          <h2 className="text-2xl font-black text-white tracking-tight">Real Cloud Uplink</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">&times;</button>
        </div>

        <form onSubmit={handleUpload} className="p-8 space-y-6">
          {!isUploading ? (
            <>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Resource Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Physics 101" className="w-full px-6 py-4 rounded-2xl bg-slate-950 border-2 border-slate-800 text-white outline-none focus:border-blue-600" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Vault Folder</label>
                <select value={folderName} onChange={(e) => setFolderName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-950 border-2 border-slate-800 text-white outline-none">
                  {folders.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Source Binary</label>
                <input type="file" required onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white" />
              </div>

              <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-900/40 uppercase tracking-widest">Transmit to Drive</button>
            </>
          ) : (
            <div className="py-20 flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-lg font-black text-white tracking-tight">{statusMessage}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
