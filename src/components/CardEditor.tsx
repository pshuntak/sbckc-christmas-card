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
  
  const MUSIC_OPTIONS = [
    { id: 'sacred-1', name: '聖善夜 (管風琴版)' },
    { id: 'sacred-2', name: '聽啊天使高聲唱 (銅管版)' },
    { id: 'peaceful-1', name: '平安夜 (鋼琴獨奏)' },
    { id: 'peaceful-2', name: '聖誕歌 (水晶音樂)' },
    { id: 'jazz-1', name: '普世歡騰 (爵士版)' },
  ];
  
  // 🛠️ 音樂選擇狀態 (預設第一首)
  const [selectedMusic, setSelectedMusic] = useState<string>(MUSIC_OPTIONS[0].id);
  const [generatedLink, setGeneratedLink] = useState<string>('');

  // 🛠️ 生成動態電子卡連結 (串接 m 參數)
  const handleGenerateOnlineCard = () => {
    try {
      const baseUrl = `${window.location.origin}/share`;
      const encodedTheme = encodeURIComponent(theme);
      const encodedBg = encodeURIComponent(selectedBgUrl);
      
      // 串接參數：t=主題, b=底圖, y=年份, m=音樂代號
      const shareUrl = `${baseUrl}?t=${encodedTheme}&b=${encodedBg}&y=${year}&m=${selectedMusic}`;
      
      setGeneratedLink(shareUrl);
      navigator.clipboard.writeText(shareUrl);
      alert('動態電子卡連結已生成並複製！');
    } catch (err) {
      alert('產生連結失敗');
    }
  };

  // 🛠️ 專業級印刷 PDF 導出：自動輸出 A4 橫向（外頁第 1 頁，內頁第 2 頁）
  const handleExportPDF = async () => {
    const cardElement = cardRef.current;
    if (!cardElement) {
      alert('找不到卡片節點，無法導出');
      return;
    }
  
    try {
      console.log('正在產生印刷級 A4 雙頁 PDF...');

      // 1. 記錄使用者目前停留在哪一個預覽視圖
      const originalView = currentView;

      // 2. 初始化橫向 A4 PDF (297mm x 210mm)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();   // 297mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 210mm

      // === 第一步：切換並擷取「外頁」（封底 + 封面）===
      setCurrentView('OUTSIDE');
      await new Promise(resolve => setTimeout(resolve, 300)); // 等待 DOM 渲染完成

      const canvasOutside = await html2canvas(cardElement, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });

      const imgDataOutside = canvasOutside.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgDataOutside, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      // === 第二步：切換並擷取「內頁」（左內頁 + 右內頁）===
      setCurrentView('INSIDE');
      await new Promise(resolve => setTimeout(resolve, 300)); // 等待 DOM 渲染完成

      const canvasInside = await html2canvas(cardElement, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });

      const imgDataInside = canvasInside.toDataURL('image/jpeg', 1.0);
      
      // 新增 PDF 第二頁並寫入內頁畫面
      pdf.addPage();
      pdf.addImage(imgDataInside, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      // === 第三步：還原使用者原本的畫面視圖 ===
      setCurrentView(originalView);

      // 下載 PDF
      pdf.save(`教會聖誕卡_印刷版_${year}.pdf`);
      console.log('印刷級雙頁 PDF 導出成功！');

    } catch (error) {
      console.error('PDF 產生失敗，錯誤原因:', error);
      alert('PDF 導出過程中發生錯誤。');
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-slate-900 p-6 rounded-lg border border-slate-800">
      {/* 頂部控制列 */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="space-y-3">
          <div className="flex gap-2">
            <button  
              className={`px-4 py-2 rounded font-medium ${currentView === 'OUTSIDE' ? 'bg-amber-500 text-black' : 'bg-slate-700 text-white'}`}
              onClick={() => setCurrentView('OUTSIDE')}
            >
              外頁預覽
            </button>
            <button  
              className={`px-4 py-2 rounded font-medium ${currentView === 'INSIDE' ? 'bg-amber-500 text-black' : 'bg-slate-700 text-white'}`}
              onClick={() => setCurrentView('INSIDE')}
            >
              內頁預覽
            </button>
          </div>

          {/* 音樂選擇下拉選單 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-bold">選擇背景音樂風格：</label>
            <select 
              value={selectedMusic}
              onChange={(e) => setSelectedMusic(e.target.value)}
              className="bg-slate-800 text-white text-sm px-3 py-2 rounded border border-slate-700 outline-none focus:border-amber-500"
            >
              {MUSIC_OPTIONS.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handleGenerateOnlineCard} className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded font-bold shadow-lg transition-all">
            🔗 生成分享連結
          </button>
          <button onClick={handleExportPDF} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded font-bold shadow-lg transition-all">
            下載印刷 PDF
          </button>
        </div>
      </div>

      {generatedLink && (
        <div className="bg-slate-950 p-3 rounded border border-amber-500/30 flex justify-between items-center text-xs">
          <span className="text-slate-400 truncate mr-4">連結: <code className="text-amber-400">{generatedLink}</code></span>
          <button onClick={() => { navigator.clipboard.writeText(generatedLink); alert('已複製'); }} className="bg-slate-800 text-white px-3 py-1 rounded shrink-0">複製</button>
        </div>
      )}

      {/* 模擬 A4 畫布區塊 */}
      <div ref={cardRef} className="relative w-full aspect-[1.414/1] bg-white rounded shadow-2xl overflow-hidden text-black">
        {currentView === 'OUTSIDE' ? (
          <div className="w-full h-full flex">
            {/* 左半部：封底 */}
            <div className="w-1/2 h-full bg-slate-50 border-r border-dashed border-gray-300 p-8 flex flex-col justify-between items-center text-center">
              <div className="text-xs text-gray-400"> </div>
              <div className="flex flex-col items-center gap-3">
                <img src="/images/church-logo.png" alt="Church Logo" className="w-16 h-16 object-contain" />
                <div className="font-bold text-xl tracking-wide text-slate-800">九龍城潮語浸信會</div>
                <div className="w-8 h-0.5 bg-amber-500 my-1"></div>
              </div>
              <div className="space-y-1 text-xs text-gray-600 font-medium">
                <p>地址：九龍城衙前圍道55A</p>
                <p>電話：(852) 2339-0220 | 傳真：(852) 2336-6064</p>
                <p>電郵：info@sbckc.org.hk</p>
                <p className="text-[10px] text-gray-400 mt-4">© {year} 九龍城潮語浸信會 版權所有</p>
              </div>
            </div>
            
            {/* 右半部：封面 */}
            <div 
              className="w-1/2 h-full bg-cover bg-center p-8 flex flex-col justify-between items-center relative"
              style={{ backgroundImage: `url('${selectedBgUrl}')` }}
            >
              <div className="text-xs text-amber-500 font-bold px-2 py-1 rounded" style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}></div>		
              <div className="text-center p-4 rounded text-white" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(4px)' }}>
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
                「因今天在大衛的城裡，為你們生了救主，就是主基督。」<br/>
                <span className="text-xs font-bold text-amber-600 block mt-2">—— 路加福音 2:11</span>
              </p>
            </div>
            {/* 右內頁 */}
            <div className="w-1/2 h-full p-8 flex flex-col justify-between bg-stone-50">
              <div></div>
              <div className="text-center px-4">
                <h3 className="font-bold text-lg mb-4 text-slate-800">主內友好教會：</h3>
                <p className="text-sm leading-relaxed text-slate-600">值此佳節，謹代表本會全體同工及弟兄姊妹，向 貴會致以最誠摯的基督祝福。願主耶穌基督的恩惠、上帝的慈愛、聖靈的感動，常與你們眾人同在！</p>
              </div>
              <div className="text-right text-xs text-gray-400"> </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}