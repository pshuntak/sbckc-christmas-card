import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CardEditorProps {
  year: number;
  theme: string;
  selectedBgUrl: string;
}

export default function CardEditor({ year, theme, selectedBgUrl }: CardEditorProps) {
  const [currentView, setCurrentView] = useState<'OUTSIDE' | 'INSIDE'>('OUTSIDE');
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 🛠️ 電子版新增狀態：儲存產生的連結網址
  const [generatedLink, setGeneratedLink] = useState<string>('');

  // 🛠️ 電子版核心函數：將參數編碼，打包成分享網址並自動複製
  const handleGenerateOnlineCard = () => {
    try {
      const baseUrl = `${window.location.origin}/share`;
      const encodedTheme = encodeURIComponent(theme);
      const encodedBg = encodeURIComponent(selectedBgUrl);
      
      // 串接網址參數：t = theme, b = background, y = year
      const shareUrl = `${baseUrl}?t=${encodedTheme}&b=${encodedBg}&y=${year}`;
      
      setGeneratedLink(shareUrl);
      
      // 自動複製到使用者的電腦/手機剪貼簿
      navigator.clipboard.writeText(shareUrl);
      alert('動態電子聖誕卡生成成功！連結已自動複製到您的剪貼簿，可以直接發送給接收人。');
    } catch (err) {
      alert('產生電子版連結時發生錯誤');
    }
  };

  const handleExportPDF = async () => {
    const cardElement = cardRef.current;
    if (!cardElement) return;
    try {
      console.log('正在產生實體印刷級 PDF...');
      const canvas = await html2canvas(cardElement, { scale: 3, useCORS: true, allowTaint: false, logging: false });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();   
      const ratio = canvas.width / canvas.height;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfWidth / ratio, undefined, 'FAST');
      pdf.save(`教會聖誕卡_${new Date().getFullYear()}.pdf`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-slate-900 p-6 rounded-lg border border-slate-800">
      {/* 頂部控制列 */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2">
          <button  
            className={`px-4 py-2 rounded font-medium transition-colors ${currentView === 'OUTSIDE' ? 'bg-amber-500 text-black' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
            onClick={() => setCurrentView('OUTSIDE')}
          >
            外頁預覽 (封底 + 封面)
          </button>
          <button  
            className={`px-4 py-2 rounded font-medium transition-colors ${currentView === 'INSIDE' ? 'bg-amber-500 text-black' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
            onClick={() => setCurrentView('INSIDE')}
          >
            內頁預覽 (左內 + 右內)
          </button>
        </div>
        
        {/* 右側：並列實體版與電子版功能 */}
        <div className="flex gap-3">
          {/* 🛠️ 新增：電子版產生按鈕 */}
          <button 
            onClick={handleGenerateOnlineCard} 
            className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded font-bold transition-colors shadow-lg"
          >
            🔗 產生動態電子卡連結
          </button>

          <button 
            onClick={handleExportPDF} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded font-bold transition-colors shadow-lg"
          >
            下載實體打印版 PDF
          </button>
        </div>
      </div>

      {/* 🛠️ 新增：產生成功後顯示網址欄位，方便複製 */}
      {generatedLink && (
        <div className="bg-slate-950 p-3 rounded border border-amber-500/30 flex justify-between items-center text-xs">
          <span className="text-slate-400">分享連結: <code className="text-amber-400 font-mono ml-1 break-all">{generatedLink}</code></span>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(generatedLink);
              alert('連結已複製！');
            }}
            className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-white ml-2 shrink-0"
          >
            複製
          </button>
        </div>
      )}

      {/* 模擬 A4 畫布區塊 (保持你原本實體版的完整 HTML DOM 結構即可) */}
      <div ref={cardRef} className="relative w-full aspect-[1.414/1] bg-white rounded shadow-2xl overflow-hidden text-black">
        {currentView === 'OUTSIDE' ? (
          <div className="w-full h-full flex">
            {/* 左半部：封底 */}
            <div className="w-1/2 h-full bg-slate-50 border-r border-dashed border-gray-300 p-8 flex flex-col justify-between items-center text-center">
              <div className="text-xs text-gray-400">（封底 Back Cover）</div>
              <div className="flex flex-col items-center gap-3">
                <img src="/images/church-logo.png" alt="Church Logo" className="w-16 h-16 object-contain" />
                <div className="font-bold text-xl tracking-wide text-slate-800">九龍城潮語浸信會</div>
                <div className="w-8 h-0.5 bg-amber-500 my-1"></div>
              </div>
              <div className="space-y-1 text-xs text-gray-600 font-medium">
                <p>地址：九龍城衙前圍道55A</p>
                <p>電話：(852) 2339-0220</p>
              </div>
            </div>
            
            {/* 右半部：封面 */}
            <div 
              className="w-1/2 h-full bg-cover bg-center p-8 flex flex-col justify-between items-center relative"
              style={{ backgroundImage: `url('${selectedBgUrl}')` }}
            >
              <div className="text-xs text-amber-500 font-bold px-2 py-1 rounded" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>（封面 Front Cover）</div>
              <div className="text-center p-4 rounded text-white" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(4px)' }}>
                <h2 className="text-xl font-bold tracking-widest">{theme}</h2>
                <p className="text-sm mt-2 opacity-80">- {year} 聖誕特刊 -</p>
              </div>
              <div></div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex">
            <div className="w-1/2 h-full border-r border-dashed border-gray-300 p-8 flex flex-col justify-center items-center text-center bg-stone-50">
              <p className="text-sm italic text-gray-600 leading-relaxed">「因今天在大衛的城裡，為你們生了救主...」</p>
            </div>
            <div className="w-1/2 h-full p-8 flex flex-col justify-between bg-stone-50">
              <div></div>
              <div className="text-center px-4">
                <h3 className="font-bold text-lg mb-4 text-slate-800">主內友好：</h3>
                <p className="text-sm leading-relaxed text-slate-600">值此佳節，謹代表本會全體同工...</p>
              </div>
              <div className="text-right text-xs text-gray-400">（內頁 Inside）</div>
            </div>
          </div>
        )}
        <div className="absolute top-0 bottom-0 left-1/2 w-0 border-l border-dashed border-gray-400 pointer-events-none z-10"></div>
      </div>
    </div>
  );
}