import { tts } from './huggingface';

// 在 Next.js 中需要处理浏览器兼容性
const isBrowser = typeof window !== 'undefined';

export const generateAudio = async (inputWord: string) => {
  const word = inputWord.trim();
  if (!word) {
    if (isBrowser) {
      alert('请输入单词');
    }
    return;
  }

  // 显示加载状态
  if (isBrowser) {
    // 可以在这里添加自定义的加载提示
    console.log('生成音频中...');
  }

  try {
    const arrayBuffer = await tts(inputWord);
    await handleAudioData(arrayBuffer);
  } catch (error) {
    console.error('生成音频失败:', error);
    if (isBrowser) {
      alert('生成音频失败，请重试');
    }
  } finally {
    // 隐藏加载状态
    if (isBrowser) {
      console.log('生成完成');
    }
  }
};

// 处理音频数据
const handleAudioData = async (arrayBuffer: ArrayBuffer) => {
  if (!isBrowser) return;

  try {
    // 将 ArrayBuffer 转换为 base64
    const base64 = arrayBufferToBase64(arrayBuffer);
    // 创建音频源
    const audioSrc = `data:audio/wav;base64,${base64}`;
    await playBase64Audio(audioSrc);
  } catch (error) {
    console.error('处理音频数据失败:', error);
    throw error;
  }
};

// ArrayBuffer 转 base64 (浏览器环境)
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  if (!isBrowser) return '';
  
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// 播放音频
const playBase64Audio = (base64Audio: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isBrowser) {
      reject(new Error('不在浏览器环境中'));
      return;
    }

    const audio = new Audio(base64Audio);
    
    audio.autoplay = true;
    
    audio.addEventListener('play', () => {
      console.log('开始播放base64音频');
    });
    
    audio.addEventListener('loadeddata', () => {
      console.log('音频数据加载完成');
    });
    
    audio.addEventListener('ended', () => {
      console.log('音频播放结束');
      resolve();
    });
    
    audio.addEventListener('error', (e) => {
      console.error('播放失败', e);
      reject(new Error(`播放失败: ${e}`));
      
      // 尝试其他方式处理
      tryAlternativePlay(base64Audio).then(resolve).catch(reject);
    });
    
    // 如果自动播放被阻止，需要用户交互
    audio.play().catch((error) => {
      console.log('自动播放被阻止，需要用户交互:', error);
      reject(error);
    });
  });
};

// 备用播放方案
const tryAlternativePlay = (base64Audio: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isBrowser) {
      reject(new Error('不在浏览器环境中'));
      return;
    }

    try {
      // 创建新的音频上下文
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audio = new Audio(base64Audio);
      
      audio.addEventListener('canplaythrough', () => {
        audio.play().then(() => {
          console.log('备用播放方案成功');
          resolve();
        }).catch(reject);
      });
      
      audio.addEventListener('error', () => {
        reject(new Error('备用播放方案也失败了'));
      });
      
      // 设置超时
      setTimeout(() => {
        reject(new Error('备用播放超时'));
      }, 5000);
      
    } catch (error) {
      reject(error);
    }
  });
};


export const trimText = (text: string): string => {
  return text.replace(/\./g, '').replace(/,/g, '').toLowerCase().trim();
};

// 工具函数：下载音频
export const downloadAudio = async (inputWord: string, filename?: string): Promise<void> => {
  try {
    const arrayBuffer = await tts(inputWord);
    if (!isBrowser) return;

    const base64 = arrayBufferToBase64(arrayBuffer);
    const audioSrc = `data:audio/wav;base64,${base64}`;
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = audioSrc;
    link.download = filename || `${inputWord}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('下载音频失败:', error);
    throw error;
  }
};

// 工具函数：检查浏览器音频支持
export const checkAudioSupport = (): boolean => {
  if (!isBrowser) return false;
  
  const audio = new Audio();
  const canPlayWav = audio.canPlayType('audio/wav');
  const hasAudioContext = !!(window.AudioContext || (window as any).webkitAudioContext);
  
  return !!(canPlayWav && hasAudioContext);
};