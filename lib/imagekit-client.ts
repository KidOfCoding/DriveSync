'use client';

export function getImageKitAuthParams(): { token: string; signature: string; expire: number } {
  // This should be called from an API route for security
  // For now, we'll use a client-side approach with public key only
  return {
    token: '',
    signature: '',
    expire: 0,
  };
}

export async function uploadImageClient(file: File, folder: string = 'rides'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '');

  try {
    const response = await fetch('/api/imagekit/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw error;
  }
}

