
export type Role = 'admin' | 'student';

export interface User {
  email: string;
  role: Role;
  displayName?: string;
  lastIp?: string;
}

export interface Paper {
  id: string;
  title: string;
  folder: string;
  fileName: string;
  fileType: string;
  fileData: string; // Base64 representation for prototype storage
  uploader: string;
  uploadedAt: string;
  summary?: string;
  storageNode: string; // Destination drive (e.g. sparshimon@gmail.com)
  cloudId?: string;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface PublicMessage {
  id: string;
  senderEmail: string;
  senderName: string;
  text: string;
  timestamp: string;
  role: Role;
}
