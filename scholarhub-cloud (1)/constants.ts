
export const ADMIN_EMAIL = 'sparshimon@gmail.com';
export const ADMIN_PASSWORD = 'sparsh0708';

export const DEFAULT_FOLDERS = [
  '8th B Papers',
  '9th A Papers',
  'General Resources',
  'Exams'
];

export const MOCK_PAPERS = [
  {
    id: '1',
    title: 'Algebra Quiz Solutions',
    folder: '8th B Papers',
    fileName: 'algebra.pdf',
    fileType: 'application/pdf',
    fileData: '',
    uploader: 'sparshimon@gmail.com',
    uploadedAt: new Date().toISOString(),
    storageNode: 'sparshimon@gmail.com',
    syncStatus: 'synced'
  },
  {
    id: '2',
    title: 'Chemistry Lab Report',
    folder: '9th A Papers',
    fileName: 'chem_lab.png',
    fileType: 'image/png',
    fileData: 'https://picsum.photos/400/300',
    uploader: 'student@scholarhub.com',
    uploadedAt: new Date().toISOString(),
    storageNode: 'sparshimon@gmail.com',
    syncStatus: 'synced'
  }
];
