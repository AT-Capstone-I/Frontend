export const theme = {
  colors: {
    // Greyscale
    greyscale1200: '#111111',
    greyscale1100: '#111112',
    greyscale1000: '#2B2A2C',
    greyscale900: '#444246',
    greyscale800: '#5E5B61',
    greyscale700: '#77747B',
    greyscale600: '#918E94',
    greyscale500: '#AAA8AD',
    greyscale400: '#C4C2C6',
    greyscale300: '#E1E1E4',
    greyscale200: '#F2F1F2',
    greyscale000: '#FFFFFF',

    // Primary
    primary500: '#4F9DE8',
    primary400: '#66B2FE',

    // Semantic (기존 호환성)
    primary: '#4F9DE8',
    secondary: '#66B2FE',
    accent: '#4F9DE8',
    textPrimary: '#111112',
    textSecondary: '#444246',
    textMuted: '#5E5B61',
    textCaption: '#77747B',
    background: '#FFFFFF',
    cardBackground: '#FFFFFF',
    navBackground: '#FFFFFF',
    border: '#E1E1E4',
    placeholderBg: '#F2F1F2',
  },
  typography: {
    // Font Family
    logo: "'KOHIBaeum', sans-serif",
    body: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    nav: "'Plus Jakarta Sans', 'Noto Sans KR', sans-serif",

    // Font Sizes
    title1: '20px',
    title2: '18px',
    title3: '16px',
    body1: '15px',
    body2: '14px',
    caption: '13px',
    small: '12px',

    // Line Heights
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.5,

    // Letter Spacing
    tightSpacing: '-0.12px',
    normalSpacing: '-0.042px',
    wideSpacing: '-0.3px',
  },
  spacing: {
    pagePadding: '20px',
    sectionGap: '12px',
    cardGap: '13px',
    borderRadius: '12px',
  },
  breakpoints: {
    mobile: '430px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
  },
};

export type Theme = typeof theme;

