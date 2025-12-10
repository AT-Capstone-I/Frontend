import 'styled-components';
import { theme } from './theme';

type AppTheme = typeof theme;

declare module 'styled-components' {
  // DefaultTheme을 프로젝트의 theme 타입으로 확장
  // (배포 빌드에서 theme.colors 등 타입 인식 오류 방지)
  export interface DefaultTheme extends AppTheme {}
}

// 모듈 스코프 강제
export {};

