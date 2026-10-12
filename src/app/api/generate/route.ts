import { NextResponse } from 'next/server';
import { generateStrategicPrompt } from '@/utils/promptTemplates';

export async function POST(request: Request) {
  const { year, theme } = await request.json();
  const basePrompt = generateStrategicPrompt(year, theme);

  // 模擬呼叫 Midjourney / DALL-E 3 API 並生成 3 款不同風格/種子的底圖
  // 在實際部署中，此處換成 fetch('AI_PROVIDER_URL')
  // 替換為全新穩定、高畫質的聖誕風格底圖網址
    // 經過人工校對的真實聖誕元素圖庫網址，確保圖文相符
      // 經 AI 生成與嚴格人眼校對的本地靜態資源字典
        const mockGeneratedImages = [
          { 
            id: 1, 
            url: '/images/bg-G1.png', 
            style: '傳統神聖水彩風 (優雅聖誕紅裝飾)' 
          },
          { 
            id: 2, 
            url: '/images/bg-G2.png', 
            style: '現代幾何扁平風 (極簡深夜藍星空)' 
          },
          { 
            id: 3, 
            url: '/images/bg-G3.png', 
            style: '溫馨社區插畫風 (溫暖冬日聖誕樹)' 
            // 實際畫面：正中央掛滿黃光與頂部金星的實體聖誕樹，水彩插畫風格
          }
  ];

  return NextResponse.json({
    promptUsed: basePrompt,
    variants: mockGeneratedImages
  });
}