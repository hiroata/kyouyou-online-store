/* common.js : 共通処理 */
document.addEventListener('DOMContentLoaded', function() {
    // ログイン状態をチェックして、ユーザーがログインしていれば「新しい記事を作成する」ボタンを表示
    const createArticleBanner = document.getElementById('create-article-banner');
    const authButtons = document.getElementById('auth-buttons');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn && createArticleBanner) {
        createArticleBanner.style.display = 'block';
    }

    if (isLoggedIn && authButtons) {
        authButtons.style.display = 'none';
    }
});
