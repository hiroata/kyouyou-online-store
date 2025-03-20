interface UploadResponse {
  url: string;
  filename: string;
}

interface UploadError extends Error {
  code?: string;
}

export async function uploadImage(file: File): Promise<string> {
  // ファイルサイズのバリデーション（5MB以下）
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('ファイルサイズは5MB以下にしてください');
  }

  // ファイルタイプのバリデーション
  if (!file.type.startsWith('image/')) {
    throw new Error('画像ファイルのみアップロード可能です');
  }

  try {
    // FormDataの作成
    const formData = new FormData();
    formData.append('file', file);

    // APIエンドポイントへのアップロード
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('画像のアップロードに失敗しました');
    }

    const data: UploadResponse = await response.json();
    return data.url;
  } catch (error) {
    const uploadError = error as UploadError;
    console.error('Upload error:', uploadError);
    throw new Error(
      uploadError.message || 'ファイルのアップロードに失敗しました'
    );
  }
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const extension = getFileExtension(originalFilename);
  return `${timestamp}-${random}.${extension}`;
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}