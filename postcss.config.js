module.exports = {
  plugins: {
	'@tailwindcss/postcss': {},
    'postcss-preset-env': {
      stage: 2, // 允許解析包括 lab(), oklch() 在內的現代 CSS 特性
      features: {
        'color-functional-notation': true,
        'lab-function': true, // 強制將 lab() 函數轉換為標準通用色碼
        'oklab-function': true   // 新增：強制將 oklab() 函數轉換為標準通用色碼
      }
    },
    //tailwindcss: {},
    autoprefixer: {},
  },
};