import { useState, useEffect, useCallback } from 'react';
import { getContentDetail, ContentDetail } from '@/app/lib/api';

interface UseContentDetailResult {
  content: ContentDetail | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useContentDetail = (contentId: string | null): UseContentDetailResult => {
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    if (!contentId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getContentDetail(contentId);
      setContent(data);
    } catch (err) {
      console.error('콘텐츠 상세 조회 에러:', err);
      setError(err instanceof Error ? err.message : '콘텐츠를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const refetch = useCallback(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    content,
    isLoading,
    error,
    refetch,
  };
};

export default useContentDetail;
