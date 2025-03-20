import { AES, enc } from 'crypto-js';

export interface License {
  userId: string;
  contentId: string;
  expiresAt: number;
  signature: string;
}

export interface ContentProtection {
  encryptContent: (content: string) => string;
  decryptContent: (encrypted: string, license: License) => string;
  validateAccess: (license: License) => boolean;
}

// 暗号化キーの生成
function generateKey(contentId: string, userId: string): string {
  return `${contentId}-${userId}-${process.env.NEXT_PUBLIC_DRM_SECRET}`;
}

// コンテンツの暗号化
export function encryptContent(content: string, contentId: string): string {
  if (!process.env.NEXT_PUBLIC_DRM_SECRET) {
    throw new Error('DRM secret is not configured');
  }

  // 一時的な暗号化キーを生成
  const tempKey = `${contentId}-${process.env.NEXT_PUBLIC_DRM_SECRET}-${Date.now()}`;
  return AES.encrypt(content, tempKey).toString();
}

// コンテンツの復号化
export function decryptContent(encrypted: string, license: License): string {
  if (!validateAccess(license)) {
    throw new Error('Invalid or expired license');
  }

  const key = generateKey(license.contentId, license.userId);
  try {
    const bytes = AES.decrypt(encrypted, key);
    return bytes.toString(enc.Utf8);
  } catch (error) {
    console.error('Content decryption failed:', error);
    throw new Error('コンテンツの復号化に失敗しました');
  }
}

// ライセンスの検証
export function validateAccess(license: License): boolean {
  if (!license) return false;

  // ライセンスの有効期限チェック
  if (license.expiresAt < Date.now()) {
    return false;
  }

  // 署名の検証
  try {
    const expectedSignature = generateSignature(
      license.userId,
      license.contentId,
      license.expiresAt
    );
    return license.signature === expectedSignature;
  } catch (error) {
    console.error('License validation failed:', error);
    return false;
  }
}

// ライセンスの署名生成
function generateSignature(userId: string, contentId: string, expiresAt: number): string {
  if (!process.env.NEXT_PUBLIC_DRM_SECRET) {
    throw new Error('DRM secret is not configured');
  }

  const data = `${userId}-${contentId}-${expiresAt}-${process.env.NEXT_PUBLIC_DRM_SECRET}`;
  return AES.encrypt(data, process.env.NEXT_PUBLIC_DRM_SECRET).toString();
}

// コンテンツアクセスのチェック
export async function checkContentAccess(contentId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/content/access/${contentId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.hasAccess;
  } catch (error) {
    console.error('Access check failed:', error);
    return false;
  }
}

// ライセンスの取得
export async function getLicense(contentId: string): Promise<License> {
  const response = await fetch(`/api/content/license/${contentId}`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('ライセンスの取得に失敗しました');
  }

  return response.json();
}

// コンテンツの表示制限
export function applyContentRestrictions(element: HTMLElement): void {
  // コピー防止
  element.style.userSelect = 'none';
  element.style.webkitUserSelect = 'none';
  
  // 右クリック防止
  element.addEventListener('contextmenu', (e) => e.preventDefault());
  
  // ドラッグ防止
  element.addEventListener('dragstart', (e) => e.preventDefault());

  // キーボードショートカット防止
  element.addEventListener('keydown', (e) => {
    // PrintScreen, Ctrl+P, Ctrl+Shift+I などを防止
    if (
      e.key === 'PrintScreen' ||
      (e.ctrlKey && e.key === 'p') ||
      (e.ctrlKey && e.shiftKey && e.key === 'i')
    ) {
      e.preventDefault();
    }
  });
}

// スクリーンショット検知
export function detectScreenCapture(callback: () => void): () => void {
  let isFullscreen = false;

  // フルスクリーン変更イベントの監視
  const handleFullscreenChange = () => {
    const nowFullscreen = Boolean(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    if (nowFullscreen !== isFullscreen) {
      isFullscreen = nowFullscreen;
      if (nowFullscreen) {
        callback();
      }
    }
  };

  // 各種ブラウザ向けのイベントリスナーを追加
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);

  // クリーンアップ用の関数を返す
  return () => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
  };
}