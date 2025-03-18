/* ImageUploader.js : 画像アップロード機能の実装（ドラッグ＆ドロップ + プレビュー） */
class ImageUploader {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.file = null;
        this.init();
    }

    init() {
        this.element.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.element.classList.add('dragover');
        });

        this.element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.element.classList.remove('dragover');
        });

        this.element.addEventListener('drop', (e) => {
            e.preventDefault();
            this.element.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                this.handleFile(e.dataTransfer.files[0]);
            }
        });

        this.element.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    this.handleFile(e.target.files[0]);
                }
            };
            input.click();
        });
    }

    handleFile(file) {
        this.file = file;
        this.element.innerHTML = '';
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        this.element.appendChild(img);
    }

    getFile() {
        return this.file;
    }
}
