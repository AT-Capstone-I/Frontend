import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 브라우저용 Supabase 클라이언트 (implicit flow 사용 - PKCE 문제 방지)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'implicit',
    detectSessionInUrl: true,
    persistSession: true,
  },
});

// 현재 로그인된 사용자 정보 가져오기
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('사용자 정보 조회 실패:', error);
    return null;
  }
  return user;
}

// 사용자 정보 타입
export interface UserProfile {
  id: string;
  email: string | undefined;
  name: string | undefined;
  avatarUrl: string | undefined;
}

// 사용자 프로필 정보 추출
export function extractUserProfile(user: any): UserProfile | null {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.email?.split('@')[0],
    avatarUrl: user.user_metadata?.avatar_url,
  };
}
