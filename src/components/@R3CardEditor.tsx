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
  
  // 🛠️ 新增狀態：音樂選擇 (預設第一首)
  const [selectedMusic, setSelectedMusic] = useState<string>(MUSIC_OPTIONS[0].id);
  const [generatedLink, setGeneratedLink] = useState<string>('');

  // 🛠️ 修改：生成連結時加入 m 參數
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

  const handleExportPDF = async () => {
    const cardElement = cardRef.current;
    if (!cardElement) return;
    try {
      const canvas = await html2canvas(cardElement, { scale: 3, useCORS: true, allowTaint: false });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 210 / (canvas.width / canvas.height));
      pdf.save(`聖誕卡_${year}.pdf`);
    } catch (error) { console.error(error); }
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

          {/* 🛠️ 音樂選擇下拉選單 */}
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

      {/* 畫布內容 (省略與之前一致的 DOM 結構) */}
      <div ref={cardRef} className="relative w-full aspect-[1.414/1] bg-white rounded shadow-2xl overflow-hidden text-black">
         {currentView === 'OUTSIDE' ? (
          <div className="w-full h-full flex">
            {/* 左半部：封底 */}
            <div className="w-1/2 h-full bg-slate-50 border-r border-dashed border-gray-300 p-8 flex flex-col justify-between items-center text-center">
              {/*<div className="text-xs text-gray-400">（封底 Back Cover）</div> */}
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
				<p className="text-[10px] text-gray-400 mt-4">c {year} 九龍城潮語浸信會 版權所有</p>
              </div>
            </div>
            
            {/* 右半部：封面 */}
            <div 
              className="w-1/2 h-full bg-cover bg-center p-8 flex flex-col justify-between items-center relative"
              style={{ backgroundImage: `url('${selectedBgUrl}')` }}
            >
              {/*<div className="text-xs text-amber-500 font-bold px-2 py-1 rounded" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>封面 Front Cover）</div> */}
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
            <div className="w-1/2 h-full border-r border-dashed border-gray-300 p-8 flex flex-col justify-center items-center text-center bg-stone-50">
              <p className="text-sm italic text-gray-600 leading-relaxed">
			  「因今天在大衛的城裡，為你們生了救主，就是主基督。」<br/>
			  <span className="text-xs font-bold text-amber-600 block mt-2">—— 路加福音 2:11</span>
			  </p>
            </div>
            <div className="w-1/2 h-full p-8 flex flex-col justify-between bg-stone-50">
              <div></div>
              <div className="text-center px-4">
                <h3 className="font-bold text-lg mb-4 text-slate-800">主內友好教會：</h3>
                <p className="text-sm leading-relaxed text-slate-600">值此佳節，謹代表本會全體同工及弟兄姊妹，向 貴會致以最誠摯的基督祝福。願主耶穌基督的恩惠、上帝的慈愛、聖靈的感動，常與你們眾人同在！</p>
              </div>
              {/*<div className="text-right text-xs text-gray-400">（內頁 Inside）</div> */}
              <div className="text-right text-xs text-gray-400"> </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}