'use client';

import { useState } from 'react';
import CardEditor from '@/components/CardEditor';

interface ImageVariant {
  id: number;
  url: string;
  style: string;
}

export default function HomePage() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [theme, setTheme] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [variants, setVariants] = useState<ImageVariant[]>([]);
  const [selectedBg, setSelectedBg] = useState<string>('');

  // 呼叫後端 API 生成 3-5 款背景
  const handleGenerateDesigns = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) return alert('請輸入當年的教會主題！');

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, theme }),
      });
      
      const data = await response.json();
      setVariants(data.variants);
      // 預設選取第一款
      if (data.variants && data.variants.length > 0) {
        setSelectedBg(data.variants[0].url);
      }
    } catch (error) {
      console.error('AI 生成失敗:', error);
      alert('系統繁忙，AI 生成失敗，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 標題區 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-amber-500"> 教會聖誕卡 AI 自動設計系統</h1>
          <p className="text-sm text-slate-400">輸入每年主題，自動構思並渲染符合香港 Output 店規格的實體/電子賀卡</p>
        </div>

        {/* 第一步：輸入主題表單 */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
          <form onSubmit={handleGenerateDesigns} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-32">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">年份</label>
              <input 
                type="number" 
                value={year} 
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">當年教會主題</label>
              <input 
                type="text" 
                placeholder="例如：【踐信‧傳道 侍主‧事人】" 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-slate-950 font-bold px-6 py-2 rounded transition-colors"
            >
              {isLoading ? 'AI 正在構思及設計中 (約10秒)...' : '開始自動設計'}
            </button>
          </form>
        </div>

        {/* 第二步：展示生成的款式供用戶選擇 */}
        {variants.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 左側：款式選擇面板 */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">請選擇一款 AI 生成的背景</h3>
              <div className="space-y-3">
                {variants.map((v) => (
                  <div 
                    key={v.id}
                    onClick={() => setSelectedBg(v.url)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 bg-slate-900 ${
                      selectedBg === v.url ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img src={v.url} alt={v.style} className="w-16 h-12 object-cover rounded" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">{v.style}</p>
                      <p className="text-xs text-slate-500 mt-0.5">sRGB 300DPI</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <button 
                  onClick={handleGenerateDesigns}
                  className="w-full text-xs text-center border border-dashed border-slate-700 hover:border-slate-500 text-slate-400 py-2 rounded transition-colors"
                >
                  對這幾款不滿意，重新要求 AI 設計
                </button>
              </div>
            </div>

            {/* 右側：畫布實時排版與編輯器 */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">實時排版與輸出預覽</h3>
              <CardEditor year={year} theme={theme} selectedBgUrl={selectedBg} />
            </div>

          </div>
        )}

      </div>
    </main>
  );
}