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

// ============ Storage 관련 함수 ============

export interface StoryCardUploadResult {
  success: boolean;
  publicUrl?: string;
  fileName?: string;
  error?: string;
}

/**
 * 스토리 카드 이미지를 Supabase Storage에 업로드
 * 서버사이드 API를 통해 업로드 (RLS 우회)
 * @param userId 사용자 ID
 * @param tripId 여행 ID
 * @param imageBlob 캡쳐된 이미지 Blob
 * @param layoutNumber 레이아웃 번호 (1-7)
 * @returns 업로드 결과 (publicUrl 포함)
 */
export async function uploadStoryCard(
  userId: string,
  tripId: string,
  imageBlob: Blob,
  layoutNumber: number = 1
): Promise<StoryCardUploadResult> {
  try {
    console.log('📤 스토리 카드 업로드 시작...');

    // FormData 생성
    const formData = new FormData();
    formData.append('file', imageBlob, 'story-card.png');
    formData.append('userId', userId);
    formData.append('tripId', tripId);
    formData.append('layoutNumber', layoutNumber.toString());

    // 서버 API를 통해 업로드 (RLS 우회)
    const response = await fetch('/api/upload-story', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      console.error('❌ Storage 업로드 실패:', result.error);
      return {
        success: false,
        error: result.error,
      };
    }

    console.log('✅ 스토리 카드 업로드 완료:', result.publicUrl);

    return {
      success: true,
      publicUrl: result.publicUrl,
      fileName: result.fileName,
    };
  } catch (error) {
    console.error('❌ 업로드 중 예외 발생:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

/**
 * 사용자의 스토리 카드 목록 조회
 * @param userId 사용자 ID
 * @returns 스토리 카드 파일 목록
 */
export async function getUserStoryCards(userId: string): Promise<{
  success: boolean;
  files?: Array<{
    name: string;
    publicUrl: string;
    createdAt: string;
  }>;
  error?: string;
}> {
  try {
    // 사용자 폴더의 파일 목록 조회
    const { data, error } = await supabase.storage
      .from('user-story')
      .list(userId, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('❌ 파일 목록 조회 실패:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Public URL 추가
    const filesWithUrls = (data || [])
      .filter(file => file.name.endsWith('.png'))
      .map(file => {
        const { data: urlData } = supabase.storage
          .from('user-story')
          .getPublicUrl(`${userId}/${file.name}`);

        return {
          name: file.name,
          publicUrl: urlData.publicUrl,
          createdAt: file.created_at || new Date().toISOString(),
        };
      });

    return {
      success: true,
      files: filesWithUrls,
    };
  } catch (error) {
    console.error('❌ 파일 목록 조회 중 예외:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}
