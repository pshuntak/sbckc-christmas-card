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
  
  // ??? 修正 1：將 HTMLCanvasElement 修正為 HTMLDivElement，確保與下方的 <div> 節點類型完全匹配
  const cardRef = useRef<HTMLDivElement>(null);

  // 匯出配合香港 Output 店的 300DPI sRGB A4 PDF
  const handleExportPDF = async () => {
    const cardElement = cardRef.current;
    if (!cardElement) {
      alert('找不到卡片節點，無法導出');
      return;
    }
  
    try {
      console.log('正在產生實體印刷級 PDF...');
  
      // 利用 html2canvas 將 DOM 轉為高解析度 Canvas
      // scale: 3 放大3倍渲染，確保印刷實體卡片時文字與圖檔達到 300DPI 印刷級銳利度
      const canvas = await html2canvas(cardElement, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });
  
      // 將 Canvas 轉換為 Base64 圖片資料
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
  
      // 初始化 jsPDF 物件：'p' 縱向, 'mm' 毫米單位, 'a4' 紙張
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();   // 約 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 約 297mm
  
      // 計算比例，讓擷取到的橫向卡片畫布完美等比例填滿 A4 寬度
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / imgHeight;
      
      const printWidth = pdfWidth;
      const printHeight = pdfWidth / ratio;
  
      // 將圖片寫入 PDF 文件中 (置頂放置於 Y軸 0 的位置)
      pdf.addImage(imgData, 'JPEG', 0, 0, printWidth, printHeight, undefined, 'FAST');
  
      // 觸發下載
      pdf.save(`教會聖誕卡_${new Date().getFullYear()}.pdf`);
  
      console.log('PDF 導出成功！');
    } catch (error) {
      console.error('PDF 產生失敗，錯誤原因:', error);
      alert('PDF 導出過程中發生錯誤，請檢查主控台。');
    }
  };

  return (
    // ?? 注意：這裡保持為外層包裹 UI，真正要打包成 PDF 的是下面那張「模擬 A4 比例畫布」
    <div className="flex flex-col gap-6 bg-slate-900 p-6 rounded-lg border border-slate-800">
      <div className="flex justify-between items-center">
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
        
        <button onClick={handleExportPDF} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-bold transition-colors shadow-lg">
          下載實體打印版 PDF
        </button>
      </div>

      {/* 修正 2：把 ref={cardRef} 移到這個真正代表卡片比例 (1.414:1) 的畫布容器上 */}
      {/* 這樣 html2canvas 截圖時才不會把頂部的「導航按鈕列」一併印進 PDF 裡 */}
      <div ref={cardRef} className="relative w-full aspect-[1.414/1] bg-white rounded shadow-2xl overflow-hidden text-black">
        {currentView === 'OUTSIDE' ? (
          <div className="w-full h-full flex">
            {/* 左半部：封底 (Back Cover) */}
            <div className="w-1/2 h-full bg-slate-50 border-r border-dashed border-gray-300 p-8 flex flex-col justify-between items-center text-center">
              <div className="text-xs text-gray-400">（封底 Back Cover）</div>
              
              {/* 中間：Logo 與 教會名稱 */}
              <div className="flex flex-col items-center gap-3">
                <img 
                  src="/images/church-logo.png" 
                  alt="Church Logo" 
                  className="w-16 h-16 object-contain error-fallback"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="font-bold text-xl tracking-wide text-slate-800">
                  九龍城潮語浸信會
                </div>
                <div className="w-8 h-0.5 bg-amber-500 my-1"></div>
              </div>
            
              {/* 下方：聯絡資訊 */}
              <div className="space-y-1 text-xs text-gray-600 font-medium">
                <p>地址：九龍城衙前圍道55A</p>
                <p>電話：(852) 2339-0220 | 傳真：(852) 2336-6064</p>
                <p>電郵：info@sbckc.org.hk</p>
                <p className="text-[10px] text-gray-400 mt-4">c {year} 九龍城潮語浸信會 版權所有</p>
              </div>
            </div>
            
            {/* 右半部：封面 (AI底圖 + 疊加文字) */}
            {/* ??? 修正 3：在 url() 內側加上單引號保護，防止 CSS 因路徑特殊字元而解析失效 */}
            <div 
              className="w-1/2 h-full bg-cover bg-center p-8 flex flex-col justify-between items-center relative"
              style={{ backgroundImage: `url('${selectedBgUrl}')` }}
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
              <p className="text-sm italic text-gray-600 leading-relaxed">
                「因今天在大衛的城裡，為你們生了救主，就是主基督。」<br/>—— 路加福音 2:11
              </p>
            </div>
            {/* 右內頁：祝福語 */}
            <div className="w-1/2 h-full p-8 flex flex-col justify-between bg-stone-50">
              <div></div>
              <div className="text-center px-4">
                <h3 className="font-bold text-lg mb-4 text-slate-800">主內友好教會 / 機構：</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  值此佳節，謹代表本會全體同工及弟兄姊妹，向 貴會致以最誠摯的基督祝福。願主耶穌基督的恩惠、上帝的慈愛、聖靈的感動，常與你們眾人同在！
                </p>
              </div>
              <div className="text-right text-xs text-gray-400">（內頁 Inside）</div>
            </div>
          </div>
        )}

        {/* 核心需求：30% 灰色人手對摺指引虛線 */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0 border-l border-dashed border-gray-400 pointer-events-none z-10"></div>
      </div>
    </div>
  );
}