'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useDropzone } from 'react-dropzone';

// クライアントサイドのみでMarkdownエディターを読み込む
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface RichTextEditorProps {
  initialValue?: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function RichTextEditor({
  initialValue = '',
  onChange,
  onImageUpload
}: RichTextEditorProps) {
  const [value, setValue] = useState(initialValue);
  const [uploading, setUploading] = useState(false);

  const handleChange = (newValue: string | undefined) => {
    const updated = newValue || '';
    setValue(updated);
    onChange(updated);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    disabled: !onImageUpload || uploading,
    onDrop: async (acceptedFiles) => {
      if (!onImageUpload || acceptedFiles.length === 0) return;

      setUploading(true);
      try {
        const file = acceptedFiles[0];
        const imageUrl = await onImageUpload(file);
        const imageMarkdown = `![${file.name}](${imageUrl})`;
        
        // カーソル位置に画像を挿入
        setValue((prev) => {
          return prev + '\n' + imageMarkdown + '\n';
        });
        onChange(value + '\n' + imageMarkdown + '\n');
      } catch (error) {
        console.error('画像のアップロードに失敗しました:', error);
        // TODO: エラー通知の実装
      } finally {
        setUploading(false);
      }
    }
  });

  return (
    <div className="space-y-4">
      <MDEditor
        value={value}
        onChange={handleChange}
        preview="edit"
        height={400}
        className="w-full"
      />

      {onImageUpload && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer
            ${uploading ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <p className="text-gray-500">アップロード中...</p>
          ) : (
            <p className="text-gray-500">
              ドラッグ＆ドロップで画像をアップロード
              <br />
              <span className="text-sm">
                またはクリックして画像を選択
              </span>
            </p>
          )}
        </div>
      )}

      <div className="prose max-w-none mt-4">
        <h3>マークダウンの書き方</h3>
        <ul className="text-sm text-gray-600">
          <li># 見出し1</li>
          <li>## 見出し2</li>
          <li>**太字**</li>
          <li>*斜体*</li>
          <li>[リンク](URL)</li>
          <li>- リスト</li>
          <li>1. 番号付きリスト</li>
          <li>`コード`</li>
        </ul>
      </div>
    </div>
  );
}