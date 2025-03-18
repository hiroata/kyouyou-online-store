// common.js - kyouyouサイトの共通JavaScript関数

document.addEventListener('DOMContentLoaded', function() {
    // ログインモーダル制御
    initLoginModal();
    
    // ログイン状態の初期化
    updateLoginState();
    
    // フィルターボタンのドロップダウン処理
    initFilterDropdown();
    
    // お気に入りボタンの処理
    initFavoriteButtons();
    
    // タブ切り替え機能
    initTabSwitching();
});

/**
 * ログインモーダルの初期化
 */
function initLoginModal() {
    const modal = document.getElementById("loginModal");
    const loginBtn = document.getElementById("loginBtn");
    const closeBtn = document.querySelector(".close");
    
    if (loginBtn) {
        loginBtn.addEventListener("click", function(e) {
            e.preventDefault();
            if (modal) modal.style.display = "block";
        });
    }
    
    if (closeBtn && modal) {
        closeBtn.addEventListener("click", function() {
            modal.style.display = "none";
        });
    }
    
    // モーダル外クリックで閉じる
    if (modal) {
        window.addEventListener("click", function(e) {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
    }
    
    // ログインフォーム送信処理
    const loginForm = document.querySelector('.login-form');
    if (loginForm && modal) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (email && password) {
                // デモ用の簡易ログイン処理
                localStorage.setItem('isLoggedIn', 'true');
                
                // UI更新
                updateLoginState();
                
                // モーダルを閉じる
                modal.style.display = "none";
            }
        });
    }
    
    // Twitterログインボタン
    const twitterLoginBtn = document.querySelector('.btn-twitter');
    if (twitterLoginBtn && modal) {
        twitterLoginBtn.addEventListener('click', function() {
            // 実際のTwitter認証はここに実装
            console.log('Twitter認証がクリックされました');
            
            // デモ用
            localStorage.setItem('isLoggedIn', 'true');
            updateLoginState();
            modal.style.display = "none";
        });
    }
}

/**
 * フィルタードロップダウンの初期化
 */
function initFilterDropdown() {
    const filterBtn = document.querySelector('.filter-btn');
    const filterDropdown = document.querySelector('.filter-dropdown');
    
    if (filterBtn && filterDropdown) {
        filterBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            filterDropdown.classList.toggle('show');
        });
        
        // フィルターの適用・リセットボタン
        const applyBtn = filterDropdown.querySelector('.btn-primary');
        const resetBtn = filterDropdown.querySelector('.btn-secondary');
        
        if (applyBtn) {
            applyBtn.addEventListener('click', function() {
                // フィルター適用処理（デモとしてドロップダウンを閉じるだけ）
                filterDropdown.classList.remove('show');
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                // チェックボックスをリセット
                const checkboxes = filterDropdown.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
            });
        }
        
        // ドロップダウン外クリックで閉じる
        document.addEventListener('click', function(e) {
            if (!e.target.matches('.filter-btn') && !e.target.closest('.filter-dropdown')) {
                if (filterDropdown.classList.contains('show')) {
                    filterDropdown.classList.remove('show');
                }
            }
        });
    }
}

/**
 * お気に入りボタンの初期化
 */
function initFavoriteButtons() {
    const favBtns = document.querySelectorAll('.favorite-btn');
    
    favBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('far');
                icon.classList.toggle('fas');
                
                // お気に入り状態をローカルストレージに保存（オプション）
                // この機能を拡張する場合は実装
            }
        });
    });
}

/**
 * タブ切り替え機能の初期化
 */
function initTabSwitching() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const activeTabClass = 'active';
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // すでにアクティブなら何もしない
            if (this.classList.contains(activeTabClass)) return;
            
            // アクティブなタブボタンを更新
            const activeBtn = document.querySelector(`.tab-btn.${activeTabClass}`);
            if (activeBtn) activeBtn.classList.remove(activeTabClass);
            this.classList.add(activeTabClass);
            
            // タブコンテンツを切り替え
            const tabId = this.getAttribute('data-tab');
            const activeContent = document.querySelector(`.tab-content.${activeTabClass}`);
            const newContent = document.getElementById(tabId);
            
            if (activeContent) activeContent.classList.remove(activeTabClass);
            if (newContent) newContent.classList.add(activeTabClass);
        });
    });
}

/**
 * ログイン状態によるUI更新
 */
function updateLoginState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginBtn = document.getElementById("loginBtn");
    const userProfile = document.getElementById("userProfile");
    const signupBtn = document.querySelector(".signup-btn");
    
    if (loginBtn && userProfile) {
        if (isLoggedIn) {
            // ログイン状態
            loginBtn.style.display = "none";
            userProfile.style.display = "block";
            if (signupBtn) signupBtn.style.display = "none";
        } else {
            // 未ログイン状態
            loginBtn.style.display = "block";
            userProfile.style.display = "none";
            if (signupBtn) signupBtn.style.display = "block";
        }
    }
}
