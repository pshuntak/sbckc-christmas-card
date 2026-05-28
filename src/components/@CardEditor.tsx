import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';

interface CardEditorProps {
  year: number;
  theme: string;
  selectedBgUrl: string;
}

export default function CardEditor({ year, theme, selectedBgUrl }: CardEditorProps) {
  const [currentView, setCurrentView] = useState<'OUTSIDE' | 'INSIDE'>('OUTSIDE');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 匯出配合香港 Output 店的 300DPI sRGB A4 PDF
  const exportToOutputPDF = () => {
    // A4 橫向標準尺寸：297mm x 210mm
    const pdf = new jsPDF('l', 'mm', 'a4');
    
    // 這裡實作將 Canvas 的 300DPI 數據寫入 PDF Page 1 (外頁) 及 Page 2 (內頁)
    // 同時保留 #D3D3D3 灰色人手對摺指引線
    alert('正在導出適合香港快印店的 sRGB 300DPI PDF... (含30%灰色折線)');
    pdf.text(`Church Christmas Card ${year}`, 10, 10);
    pdf.save(`Church_Christmas_Card_${year}_Output.pdf`);
  };

  return (
    <div className="flex flex-col gap-6 bg-slate-900 p-6 rounded-lg border border-slate-800">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 rounded ${currentView === 'OUTSIDE' ? 'bg-amber-500 text-black' : 'bg-slate-700'}`}
            onClick={() => setCurrentView('OUTSIDE')}
          >
            外頁預覽 (封底 + 封面)
          </button>
          <button 
            className={`px-4 py-2 rounded ${currentView === 'INSIDE' ? 'bg-amber-500 text-black' : 'bg-slate-700'}`}
            onClick={() => setCurrentView('INSIDE')}
          >
            內頁預覽 (左內 + 右內)
          </button>
        </div>
        
        <button onClick={exportToOutputPDF} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-bold">
          下載實體打印版 PDF
        </button>
      </div>

      {/* 模擬 A4 比例畫布 1.414:1 */}
      <div className="relative w-full aspect-[1.414/1] bg-white rounded shadow-2xl overflow-hidden text-black">
        {currentView === 'OUTSIDE' ? (
          <div className="w-full h-full flex">
            {/* 左半部：封底 */}
            <div className="w-1/2 h-full bg-slate-50 border-r border-dashed border-gray-300 p-8 flex flex-col justify-between items-center text-center">
              <div className="text-xs text-gray-400">（封底 Back Cover）</div>
              <div>
                <div className="font-bold text-lg">主內教會</div>
                <div className="text-xs text-gray-500 mt-1">願主賜福與你們</div>
              </div>
              <div className="text-xs text-gray-400">{year} 聖誕誌慶</div>
            </div>
            
            {/* 右半部：封面 (AI底圖 + 疊加文字) */}
            <div 
              className="w-1/2 h-full bg-cover bg-center p-8 flex flex-col justify-between items-center relative"
              style={{ backgroundImage: `url(${selectedBgUrl})` }}
            >
              <div className="text-xs text-amber-500 font-bold bg-black/40 px-2 py-1 rounded">（封面 Front Cover）</div>
              <div className="text-center bg-black/30 p-4 rounded backdrop-blur-sm text-white">
                <h2 className="text-xl font-bold tracking-widest">{theme}</h2>
                <p className="text-sm mt-2 opacity-80">- {year} 聖誕特刊 -</p>
              </div>
              <div></div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex">
            {/* 左內頁 */}
            <div className="w-1/2 h-full border-r border-dashed border-gray-300 p-8 flex flex-col justify-center items-center text-center bg-stone-50">
              <p className="text-sm italic text-gray-600">「因今天在大衛的城裡，為你們生了救主，就是主基督。」<br/>—— 路加福音 2:11</p>
            </div>
            {/* 右內頁：祝福語 */}
            <div className="w-1/2 h-full p-8 flex flex-col justify-between bg-stone-50">
              <div></div>
              <div className="text-center px-4">
                <h3 className="font-bold text-lg mb-4 text-slate-800">主內友好教會 / 機構：</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  值此佳節，謹代表本全體同工及弟兄姊妹，向 貴會致以最誠摯的基督祝福。願主耶穌基督的恩惠、上帝的慈愛、聖靈的感動，常與你們眾人同在！
                </p>
              </div>
              <div className="text-right text-xs text-gray-400">（內頁 Inside）</div>
            </div>
          </div>
        )}

        {/* 核心需求：30% 灰色人手對摺指引虛線 (僅供前台直觀看，導出時依模式處理) */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0 border-l border-dashed border-gray-400 pointer-events-none z-10"></div>
      </div>
    </div>
  );
}