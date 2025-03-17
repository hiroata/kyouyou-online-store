// js/common.js
const TipsApp = {
  // 認証関連
  auth: {
    // ログイン状態の確認
    isLoggedIn() {
      return localStorage.getItem('isLoggedIn') === 'true';
    },
    
    // 現在のユーザー名を取得
    getUsername() {
      return localStorage.getItem('username');
    },
    
    // ログイン処理
    login(username, rememberMe = false) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', username);
    },
    
    // ログアウト処理
    logout() {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      window.location.href = 'index.html';
    }
  },
  
  // UI関連
  ui: {
    // ヘッダーのログイン状態を更新
    updateAuthUI() {
      const authButtons = document.getElementById('auth-buttons');
      const createArticleBanner = document.getElementById('create-article-banner');
      
      if (authButtons) {
        if (TipsApp.auth.isLoggedIn()) {
          const username = TipsApp.auth.getUsername();
          authButtons.innerHTML = `
            <div class="user-dropdown">
              <span class="user-name">${username}</span>
              <button class="logout-btn" onclick="TipsApp.auth.logout()">ログアウト</button>
            </div>
          `;
          
          // 記事作成バナーを表示
          if (createArticleBanner) {
            createArticleBanner.style.display = 'block';
          }
        } else {
          authButtons.innerHTML = `
            <a href="login.html" class="btn-login">ログイン</a>
            <a href="register.html" class="btn-register">新規登録</a>
          `;
          
          // 記事作成バナーを非表示
          if (createArticleBanner) {
            createArticleBanner.style.display = 'none';
          }
        }
      }
    },
    
    // お気に入りボタンの初期化
    initFavoriteButtons() {
      const favoriteButtons = document.querySelectorAll('.favorite-button');
      favoriteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          // ログインしていない場合はログインページへ
          if (!TipsApp.auth.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
          }
          
          // お気に入り状態を切り替え
          const icon = this.querySelector('i');
          if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            this.classList.add('active');
          } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            this.classList.remove('active');
          }
        });
      });
    }
  },
  
  // ページの初期化
  init() {
    // 共通初期化処理
    this.ui.updateAuthUI();
    
    // ページ固有の初期化処理
    if (document.querySelector('.article-grid')) {
      this.ui.initFavoriteButtons();
    }
  }
};

// DOMの読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
  TipsApp.init();
});
