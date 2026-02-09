
export interface DriveFile {
  id: string;
  name: string;
  webViewLink?: string;
  webContentLink?: string;
}

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_API_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

/**
 * Searches for a folder by name or creates it if it doesn't exist.
 */
export async function getOrCreateFolder(accessToken: string, folderName: string): Promise<string> {
  const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const response = await fetch(`${DRIVE_API_URL}?q=${encodeURIComponent(query)}&fields=files(id, name)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Create folder
  const createResponse = await fetch(DRIVE_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });
  
  const folderData = await createResponse.json();
  return folderData.id;
}

/**
 * Uploads a file to a specific folder in Google Drive.
 */
export async function uploadToDrive(accessToken: string, file: File, parentFolderId: string): Promise<DriveFile> {
  const metadata = {
    name: file.name,
    parents: [parentFolderId]
  };

  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', file);

  const response = await fetch(UPLOAD_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: formData
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to upload to Google Drive');
  }

  const driveFile = await response.json();
  
  // Get extra fields like webViewLink
  const fieldsResponse = await fetch(`${DRIVE_API_URL}/${driveFile.id}?fields=id,name,webViewLink,webContentLink`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  return await fieldsResponse.json();
}

/**
 * Deletes a file from Google Drive.
 */
export async function deleteFromDrive(accessToken: string, fileId: string): Promise<void> {
  const response = await fetch(`${DRIVE_API_URL}/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok && response.status !== 404) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to delete from Google Drive');
  }
}
