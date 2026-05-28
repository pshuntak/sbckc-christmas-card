// 關鍵字對應字典
const themeDictionary: Record<string, string> = {
  '信': 'faith, walking on a light-filled path, trust',
  '傳': 'sharing gospel, spreading love, warm light shining outward',
  '侍': 'serving Lord, humble hands, cross silhouette, sacred altar',
  '事': 'serving community, people holding hands, unity, helping each other',
  '愛': 'unconditional love, warm hearts, glowing light',
  '光': 'divine light, star of Bethlehem, breaking darkness'
};

export function generateStrategicPrompt(year: number, theme: string): string {
  // 提取主題中的核心字，並轉為視覺意象
  let visualElements = "";
  for (const char of theme) {
    if (themeDictionary[char]) {
      visualElements += themeDictionary[char] + ", ";
    }
  }

  // 組裝最終外國 AI 理解的 Prompt
  return `A premium, sacred Christmas card background template, watercolor and ink style. ${visualElements} Featuring beautiful elements of Christmas like a subtle Star of Bethlehem and warm glowing tones. Elegant deep blue and holiday gold color palette. --no text, typography, words, branding-- Minimalist composition with a clean, empty negative space in the upper-center area reserved for custom text overlay. High resolution, sRGB color space suitable for high-quality digital printing.`;
}