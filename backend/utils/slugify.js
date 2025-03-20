/**
 * 文字列をURLスラッグに変換する関数
 * 日本語にも対応したスラッグ生成
 * 
 * @param {string} text - スラッグに変換するテキスト
 * @returns {string} - 生成されたスラッグ
 */
const slugify = (text) => {
  // 元の文字列を小文字に変換
  let slug = String(text).toLowerCase();
  
  // 日本語と英数字以外の文字をハイフンに置換
  // まず、日本語文字と英数字を一時的なマーカーに置換
  slug = slug
    // 日本語（ひらがな、カタカナ、漢字）
    .replace(/[----]/g, char => {
      return `___JP${char.codePointAt(0)}___`;
    })
    // 英数字
    .replace(/[a-z0-9]/g, char => {
      return `___EN${char}___`;
    });
  
  // 特殊文字をハイフンに置換
  slug = slug.replace(/[^___A-Za-z0-9\-]/g, '-');
  
  // マーカーを元の文字に戻す
  // 日本語はそのままURLエンコードする
  slug = slug
    .replace(/___JP(\d+)___/g, (match, codePoint) => {
      return encodeURIComponent(String.fromCodePoint(parseInt(codePoint, 10)));
    })
    .replace(/___EN([a-z0-9])___/g, '$1');
  
  // 連続するハイフンを単一のハイフンに置換
  slug = slug.replace(/-+/g, '-');
  
  // 先頭と末尾のハイフンを削除
  slug = slug.replace(/^-+|-+$/g, '');
  
  // スラッグが空の場合は、ランダムな文字列を生成
  if (!slug) {
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `article-${randomStr}`;
  }
  
  return slug;
};

module.exports = slugify;
