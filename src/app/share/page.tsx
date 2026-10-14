'use client';

import React, { useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SharedCardContent() {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const themeParam = searchParams.get('t') || '聖誕快樂';
  const bgParam = searchParams.get('b') || '';
  const yearParam = searchParams.get('y') || new Date().getFullYear().toString();
  const musicParam = searchParams.get('m') || 'sacred-1';

  const theme = decodeURIComponent(themeParam);
  const bgUrl = bgParam ? decodeURIComponent(bgParam) : '';
  const musicUrl = `/audio/${musicParam}.mp3`;

  const handleOpenCard = () => {
    setIsOpen(!isOpen);
    if (audioRef.current) {
      if (!isOpen) {
        audioRef.current.play().catch(err => console.log("音樂播放被瀏覽器攔截:", err));
      } else {
        audioRef.current.pause();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden text-white font-sans">
      <audio ref={audioRef} src={musicUrl} loop preload="auto" />

      <div className="text-center mb-8 animate-pulse">
        <p className="text-amber-500 font-bold tracking-widest text-xs uppercase">You Received A Christmas Card</p>
        <h1 className="text-xl font-bold mt-1 text-slate-100">您收到了一份聖誕祝福，點擊卡片開啟</h1>
      </div>

      <div 
        onClick={handleOpenCard}
        className="relative w-full max-w-[380px] aspect-[1/1.414] cursor-pointer shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]"
        style={{ perspective: '1500px' }}
      >
        <div 
          className="w-full h-full relative transition-transform duration-700 ease-in-out"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: isOpen ? 'rotateY(-140deg)' : 'rotateY(0deg)',
            transformOrigin: 'left center'
          }}
        >
          {/* 封面 */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center rounded-xl p-6 flex flex-col justify-between items-center"
            style={{ 
              backgroundImage: `url('${bgUrl}')`,
              backfaceVisibility: 'hidden',
              zIndex: 20
            }}
          >
            <div className="text-xs text-amber-500 font-bold px-2 py-1 rounded" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
              MERRY CHRISTMAS
            </div>
            
            <div className="text-center p-4 rounded text-white w-full border border-white/10" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}>
              <h2 className="text-xl font-bold tracking-widest leading-snug">{theme}</h2>
              <p className="text-xs mt-2 opacity-80">- {yearParam} 聖誕特刊 -</p>
            </div>
            
            <div className="bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-full shadow-lg">
              👆 點擊拆開電子卡
            </div>
          </div>

          {/* 翻開後的左內頁 */}
          <div 
            className="absolute inset-0 w-full h-full bg-stone-100 text-slate-800 rounded-xl p-6 flex flex-col justify-center items-center text-center border border-gray-300"
            style={{ 
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden'
            }}
          >
            <p className="text-sm italic text-gray-600 leading-relaxed px-4">
              「因今天在大衛的城裡，為你們生了救主，就是主基督。」<br/>
              <span className="text-xs font-bold text-amber-600 block mt-2">—— 路加福音 2:11</span>
            </p>
          </div>
        </div>

        {/* 固定的右內頁 */}
        <div className="absolute inset-0 w-full h-full bg-stone-50 text-slate-900 rounded-xl p-6 flex flex-col justify-between border border-gray-200 -z-10 shadow-inner">
          <div className="flex flex-col items-center pt-4">
            <img src="/images/church-logo.png" alt="Church Logo" className="w-10 h-10 object-contain opacity-80" />
            <div className="font-bold text-base tracking-wider text-slate-800 mt-1">九龍城潮語浸信會</div>
            <div className="w-6 h-0.5 bg-amber-500 my-1"></div>
          </div>

          <div className="text-center px-2">
            <h3 className="font-bold text-s text-slate-700 mb-1">主內友好：</h3>
            <p className="text-[13px] leading-relaxed text-slate-600">
              值此佳節，謹代表本會全體同工及弟兄姊妹，向您致以最誠摯的基督祝福。願主耶穌基督的恩惠、上帝的慈愛、聖靈的感動，常與你們眾人同在！
            </p>
          </div>

          <div className="text-center text-[10px] text-gray-400 pb-1">
            © {yearParam} 九龍城潮語浸信會
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="mt-8 flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          🎵 聖誕背景音樂播放中...
        </div>
      )}
    </div>
  );
}

// 🛠️ 必須使用 Suspense 封裝以符合 Next.js App Router 規範
export default function SharedCardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">載入聖誕卡中...</div>}>
      <SharedCardContent />
    </Suspense>
  );
}