import React, { useRef, useState, useEffect } from 'react';
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
  
  // ??? 終極防禦：建立一個專門儲存「清洗後、無有害色彩 Profile」的安全圖片 State
  const [safeBgUrl, setSafeBgUrl] = useState<string>('');

  // ??? 監聽傳入的網址，一進來就立刻在背景徹底「解毒」轉成 sRGB 的 Base64 碼
  useEffect(() => {
    if (!selectedBgUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous'; 
    img.src = selectedBgUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        // 強制解碼成最普通、相容性 100% 的 JPEG 格式 Base64，?底抹除 oklab 檔案頭
        setSafeBgUrl(canvas.toDataURL('image/jpeg', 0.95));
      } else {
        setSafeBgUrl(selectedBgUrl);
      }
    };
    img.onerror = () => {
      setSafeBgUrl(selectedBgUrl); 
    };
  }, [selectedBgUrl]);

  const handleExportPDF = async () => {
    const cardElement = cardRef.current;
    if (!cardElement) {
      alert('找不到卡片節點，無法導出');
      return;
    }
  
    try {
      console.log('--- 🚀 開始全自動 CSS 漏洞審查 ---');
      
      // 1. 強制遍歷 cardRef 內部的所有子節點
      const allElements = cardElement.querySelectorAll('*');
      let hasErrorCss = false;

      allElements.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        // 取得瀏覽器實際計算後的最終樣式 (Computed Style)
        const computedStyle = window.getComputedStyle(htmlEl);
        
        // 掃描最容易出現色彩函數的屬性
        const propertiesToCheck = [
          'backgroundColor', 'color', 'borderColor', 
          'backgroundImage', 'boxShadow', 'borderRealColor'
        ];

        propertiesToCheck.forEach(prop => {
          const value = computedStyle[prop as any];
          if (value && (value.includes('oklab') || value.includes('lab('))) {
            hasErrorCss = true;
            console.error(`❌ [💥 抓到漏洞節點!]`);
            console.error(`標籤: <${htmlEl.tagName.toLowerCase()}>`);
            console.error(`Class 名稱: "${htmlEl.className}"`);
            console.error(`錯誤屬性: ${prop}`);
            console.error(`錯誤數值: "${value}"`);
            console.error(`-----------------------------------`);
          }
        });
      });

      if (hasErrorCss) {
        alert('審查腳本已成功抓到 oklab 污染源！請按 F12 打開瀏覽器 Console 查看紅色錯誤日誌。');
        return; // 攔截中斷，不觸發 html2canvas 免得噴出模糊的錯誤
      }

      console.log('--- ✅ CSS 審查通過，未發現 oklab 污染，開始生成 PDF ---');
  
      // 2. 如果審查通過，才執行原本的 html2canvas
      const canvas = await html2canvas(cardElement, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });
  
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();   
      const ratio = canvas.width / canvas.height;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfWidth / ratio, undefined, 'FAST');
      pdf.save(`教會聖誕卡_${new Date().getFullYear()}.pdf`);
      console.log('PDF 導出成功！');

    } catch (error) {
      console.error('PDF 產生失敗，錯誤原因:', error);
    }
  };

  // 如果安全的圖片還沒轉換完成，顯示簡單的載入狀態，防止 html2canvas 搶先抓取空白
  const activeBg = safeBgUrl || selectedBgUrl;

  return (
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

      <div ref={cardRef} className="relative w-full aspect-[1.414/1] bg-white rounded shadow-2xl overflow-hidden text-black">
        {currentView === 'OUTSIDE' ? (
          <div className="w-full h-full flex">
            {/* 左半部：封底 */}
            <div className="w-1/2 h-full bg-slate-50 border-r border-dashed border-gray-300 p-8 flex flex-col justify-between items-center text-center">
              <div className="text-xs text-gray-400">（封底 Back Cover）</div>
              
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
            
              <div className="space-y-1 text-xs text-gray-600 font-medium">
                <p>地址：九龍城衙前圍道55A</p>
                <p>電話：(852) 2339-0220 | 傳真：(852) 2336-6064</p>
                <p>電郵：info@sbckc.org.hk</p>
                <p className="text-[10px] text-gray-400 mt-4">c {year} 九龍城潮語浸信會 版權所有</p>
              </div>
            </div>
            
            {/* 右半部：封面 */}
            {/* ??? 核心修正：不論行數如何變動，這裡一律改用清洗安全後的 activeBg */}
            <div 
              className="w-1/2 h-full bg-cover bg-center p-8 flex flex-col justify-between items-center relative"
              style={{ backgroundImage: `url('${activeBg}')` }}
            >
              <div 
			    className="text-xs text-amber-500 font-bold px-2 py-1 rounded"
				style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
			  >
				 （封面 Front Cover）
			  </div>
              <div 
			    className="text-center p-4 rounded backdrop-blur-sm text-white"
			    style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
			  >
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
            {/* 右內頁 */}
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

        <div className="absolute top-0 bottom-0 left-1/2 w-0 border-l border-dashed border-gray-400 pointer-events-none z-10"></div>
      </div>
    </div>
  );
}