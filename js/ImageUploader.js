// ImageUploader.js
class ImageUploader {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.previewUrl = null;
    this.uploadedFile = null;
    this.init();
  }

  init() {
    const template = `
      <div class="image-uploader">
        <div class="upload-area" id="upload-area">
          <input type="file" id="image-input" accept="image/*" />
          <div class="upload-placeholder" id="upload-placeholder">
            <div class="upload-icon">
              <i class="fas fa-cloud-upload-alt"></i>
            </div>
            <p>アイキャッチ画像をドラッグ&ドロップするか、クリックして選択</p>
          </div>
          <div class="preview-container" id="preview-container" style="display: none;">
            <img id="image-preview" alt="プレビュー" class="image-preview" />
            <button class="remove-btn" id="remove-btn">削除</button>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = template;
    
    // 要素の取得
    this.uploadArea = document.getElementById('upload-area');
    this.imageInput = document.getElementById('image-input');
    this.placeholder = document.getElementById('upload-placeholder');
    this.previewContainer = document.getElementById('preview-container');
    this.imagePreview = document.getElementById('image-preview');
    this.removeBtn = document.getElementById('remove-btn');
    
    // イベントリスナーの設定
    this.setupEventListeners();
  }

  setupEventListeners() {
    // ドラッグ&ドロップ
    this.uploadArea.addEventListener('dragenter', this.handleDrag.bind(this));
    this.uploadArea.addEventListener('dragover', this.handleDrag.bind(this));
    this.uploadArea.addEventListener('dragleave', this.handleDrag.bind(this));
    this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
    
    // ファイル選択
    this.imageInput.addEventListener('change', this.handleFileSelect.bind(this));
    
    // 削除ボタン
    this.removeBtn.addEventListener('click', this.resetImage.bind(this));
    
    // プレースホルダーのクリックでファイル選択を開く
    this.placeholder.addEventListener('click', () => {
      this.imageInput.click();
    });
  }

  handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      this.uploadArea.classList.add('active');
    } else if (e.type === "dragleave") {
      this.uploadArea.classList.remove('active');
    }
  }
  
  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.uploadArea.classList.remove('active');
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      this.handleFile(e.dataTransfer.files[0]);
    }
  }
  
  handleFileSelect(e) {
    if (e.target.files && e.target.files[0]) {
      this.handleFile(e.target.files[0]);
    }
  }
  
  handleFile(file) {
    // 画像ファイルのみを許可
    if (!file.type.match('image.*')) {
      alert('画像ファイルを選択してください');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target.result;
      this.imagePreview.src = this.previewUrl;
      this.placeholder.style.display = 'none';
      this.previewContainer.style.display = 'block';
      this.uploadedFile = file;
      
      // ファイルアップロード完了イベントの発火
      const event = new CustomEvent('image-uploaded', { 
        detail: { file: this.uploadedFile }
      });
      this.container.dispatchEvent(event);
    };
    reader.readAsDataURL(file);
  }
  
  resetImage() {
    this.previewUrl = null;
    this.uploadedFile = null;
    this.imagePreview.src = '';
    this.placeholder.style.display = 'block';
    this.previewContainer.style.display = 'none';
    this.imageInput.value = '';
    
    // 画像リセットイベントの発火
    const event = new CustomEvent('image-reset');
    this.container.dispatchEvent(event);
  }
  
  getFile() {
    return this.uploadedFile;
  }
}

// エクスポート
window.ImageUploader = ImageUploader;
