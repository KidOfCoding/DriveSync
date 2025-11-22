import ImageKit from 'imagekit';

export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
});

export async function uploadImage(file: File, folder: string = 'rides'): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const result = await imagekit.upload({
      file: base64,
      fileName: file.name,
      folder: folder,
      useUniqueFileName: true,
    });

    return result.url;
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw error;
  }
}

export function getImageKitUrl(path: string, transformations?: any): string {
  return imagekit.url({
    src: path,
    transformation: transformations || [],
  });
}

