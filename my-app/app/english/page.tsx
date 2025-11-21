"use client";

import { useState, useRef, ChangeEvent } from 'react';
import { imageToText } from './huggingface';
import { generateAudio } from './common'

interface TextItem {
  id: string;
  content: string;
}

export default function OcrPage() {
  const [tempFilePath, setTempFilePath] = useState<string>('');
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chooseImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 创建临时URL预览
    const objectUrl = URL.createObjectURL(file);
    setTempFilePath(objectUrl);

    // 处理图片转文字
    await handleImageToText(file);
  };

  const handleImageToText = async (file: File) => {
    if (!file) {
      alert('请先选择图片');
      return;
    }

    setIsProcessing(true);
    try {
      const dataUrl = await blobToDataUrl(file);
      const outputText = await imageToText(dataUrl);
      
      if (outputText?.content) {
        const textArray = outputText.content
          .split('\n')
          .filter((item: any) => item.trim().length > 0)
          .map((text: string, index: number) => ({
            id: `text-${index}-${Date.now()}`,
            content: text
          }));
        setTexts(textArray);
      } else {
        setTexts([]);
        alert('未识别到文字');
      }
    } catch (error) {
      console.error('文字识别失败:', error);
      alert('文字识别失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const blobToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onAddToFavorites = () => {
    if (texts.length === 0) {
      alert('没有可收藏的文字');
      return;
    }

    const storageKey = 'my-favorite-words';
    const allWords = localStorage.getItem(storageKey);
    let allWordsArr: string[] = [];

    if (allWords) {
      try {
        allWordsArr = JSON.parse(allWords);
      } catch (error) {
        console.error('解析收藏数据失败:', error);
      }
    }

    const newWords = texts.map(item => item.content.toLowerCase().trim());
    const newAllWordArr = [...allWordsArr, ...newWords];
    const filterNewAllWordsArr = newAllWordArr.filter((item, index) => 
      newAllWordArr.indexOf(item) === index
    );

    localStorage.setStorageSync(storageKey, JSON.stringify(filterNewAllWordsArr));
    alert(`成功收藏 ${newWords.length} 个单词`);
  };

  const handleCreateAudio = (text: string) => {
    generateAudio(text);
  };

  const playAllTexts = () => {
    const fullText = texts.map(item => item.content).join(' ');
    if (fullText.trim()) {
      generateAudio(fullText.toLowerCase());
    } else {
      alert('没有可播放的文字');
    }
  };

  const goBack = () => {
  };

  return (
    <div className="ocr-page">
      <div className="header">
        <button onClick={goBack} className="back-btn">返回</button>
        <button 
          type="button" 
          onClick={chooseImage}
          disabled={isProcessing}
          className="upload-btn"
        >
          {isProcessing ? '识别中...' : '上传图片识别'}
        </button>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />

      <div className="show-image-and-texts">
        <div className="show-texts">
          {texts.map((item) => (
            <div key={item.id} className="show-text">
              <span>{item.content.toLowerCase()}</span>
              <button 
                onClick={() => handleCreateAudio(item.content.toLowerCase())}
                className="audio-btn"
                title="播放音频"
              >
                <svg 
                  viewBox="0 0 1025 1024" 
                  version="1.1" 
                  xmlns="http://www.w3.org/2000/svg"
                  width="16" 
                  height="16"
                >
                  <path 
                    d="M336.457143 336.457143m-336.457143 0a336.457143 336.457143 0 1 0 672.914286 0 336.457143 336.457143 0 1 0-672.914286 0Z" 
                    fill="#8CF6FB" 
                  />
                  <path 
                    d="M592.457143 1024c-11.702857 0-21.942857-4.388571-30.72-13.165714 0 0-333.531429-175.542857-337.92-175.542857H93.622857c-48.274286 0-87.771429-39.497143-87.771428-87.771429V296.96c0-48.274286 39.497143-87.771429 86.308571-87.771429h131.657143L561.737143 13.165714c7.314286-8.777143 19.017143-13.165714 30.72-13.165714 23.405714 0 43.885714 19.017143 43.885714 43.885714v936.228572c0 24.868571-19.017143 43.885714-43.885714 43.885714z m-29.257143-921.6L269.165714 269.165714c-13.165714 8.777143-27.794286 14.628571-42.422857 14.628572h-131.657143c-7.314286 0-14.628571 5.851429-14.628571 14.628571v452.022857c0 7.314286 5.851429 14.628571 14.628571 14.628572h130.194286c8.777143 0 17.554286 1.462857 26.331429 4.388571 11.702857 5.851429 283.794286 137.508571 313.051428 156.525714L563.2 102.4z" 
                    fill="#3C2DCB" 
                  />
                  <path 
                    d="M904.045714 792.868571c-7.314286 7.314286-16.091429 11.702857-26.331428 11.702858s-19.017143-4.388571-26.331429-10.24c-14.628571-14.628571-14.628571-36.571429 0-51.2 128.731429-128.731429 133.12-334.994286 5.851429-465.188572l-7.314286-7.314286c-14.628571-14.628571-14.628571-36.571429 0-51.2s38.034286-14.628571 52.662857 0c157.988571 153.6 160.914286 408.137143 7.314286 566.125715 0 2.925714-2.925714 4.388571-5.851429 7.314285z m-138.971428-102.4c-7.314286 7.314286-16.091429 10.24-26.331429 10.24s-19.017143-4.388571-26.331428-10.24c-14.628571-13.165714-14.628571-35.108571-1.462858-49.737142l1.462858-1.462858c70.217143-65.828571 74.605714-175.542857 8.777142-245.76l-8.777142-8.777142c-14.628571-13.165714-14.628571-35.108571-1.462858-49.737143l1.462858-1.462857c14.628571-14.628571 38.034286-14.628571 52.662857 0 98.011429 92.16 103.862857 245.76 11.702857 345.234285-4.388571 2.925714-7.314286 7.314286-11.702857 11.702857z" 
                    fill="#D098FF" 
                  />
                </svg>
              </button>
            </div>
          ))}
          {texts.length === 0 && !isProcessing && (
            <div className="empty-state">
              <p>请上传图片识别文字</p>
            </div>
          )}
        </div>

        {tempFilePath && (
          <div className="show-image">
            <img src={tempFilePath} alt="识别图片" />
          </div>
        )}
      </div>

      <div className="footer-btns">
        <button 
          type="button" 
          onClick={playAllTexts}
          disabled={texts.length === 0}
          className="btn"
        >
          听全文
        </button>
        <button 
          type="button" 
          onClick={onAddToFavorites}
          disabled={texts.length === 0}
          className="btn"
        >
          收藏所有单词
        </button>
      </div>

      <style jsx>{`
        .ocr-page {
          padding: 0 10px;
          max-width: 100vw;
          min-height: 100vh;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 0 10px;
        }

        .back-btn {
          padding: 8px 16px;
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .upload-btn {
          padding: 10px 20px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .upload-btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .show-image-and-texts {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
          max-height: 70vh;
          overflow-y: auto;
          padding: 10px;
        }

        .show-texts {
          flex: 1;
          min-width: 300px;
          max-width: 500px;
          padding: 10px;
        }

        .show-text {
          font-size: 19px;
          height: 35px;
          line-height: 35px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 10px;
          margin: 5px 0;
          background-color: #f8f9fa;
          border-radius: 4px;
          border-left: 3px solid #0070f3;
        }

        .show-text span {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .audio-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
          margin-left: 10px;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .audio-btn:hover {
          background-color: #e9ecef;
        }

        .show-image {
          flex: 1;
          min-width: 300px;
          max-width: 400px;
          display: flex;
          justify-content: center;
        }

        .show-image img {
          max-width: 100%;
          max-height: 400px;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .footer-btns {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 20px 10px;
        }

        .btn {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          background-color: #0070f3;
          color: white;
        }

        .btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
        }

        @media (max-width: 768px) {
          .show-image-and-texts {
            flex-direction: column;
          }
          
          .show-texts,
          .show-image {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}