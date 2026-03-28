import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTICE_RECENT_SEARCHES_STORAGE_KEY = '@skuri/notice/recent-searches';
const MAX_RECENT_NOTICE_SEARCHES = 10;

const normalizeKeyword = (value: string) => value.trim();

const dedupeKeywords = (keywords: string[]) => {
  const nextKeywords: string[] = [];

  keywords.forEach(keyword => {
    const normalizedKeyword = normalizeKeyword(keyword);
    if (!normalizedKeyword || nextKeywords.includes(normalizedKeyword)) {
      return;
    }

    nextKeywords.push(normalizedKeyword);
  });

  return nextKeywords.slice(0, MAX_RECENT_NOTICE_SEARCHES);
};

const persistRecentNoticeSearches = async (keywords: string[]) => {
  const normalizedKeywords = dedupeKeywords(keywords);

  try {
    if (normalizedKeywords.length === 0) {
      await AsyncStorage.removeItem(NOTICE_RECENT_SEARCHES_STORAGE_KEY);
      return [];
    }

    await AsyncStorage.setItem(
      NOTICE_RECENT_SEARCHES_STORAGE_KEY,
      JSON.stringify(normalizedKeywords),
    );
    return normalizedKeywords;
  } catch (error) {
    console.warn('최근 공지 검색어 저장 실패:', error);
    return normalizedKeywords;
  }
};

export const loadRecentNoticeSearches = async (): Promise<string[]> => {
  try {
    const stored = await AsyncStorage.getItem(NOTICE_RECENT_SEARCHES_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? dedupeKeywords(parsed) : [];
  } catch (error) {
    console.warn('최근 공지 검색어 로드 실패:', error);
    return [];
  }
};

export const pushRecentNoticeSearch = async (
  keyword: string,
): Promise<string[]> => {
  const normalizedKeyword = normalizeKeyword(keyword);
  if (!normalizedKeyword) {
    return loadRecentNoticeSearches();
  }

  const currentKeywords = await loadRecentNoticeSearches();
  return persistRecentNoticeSearches([
    normalizedKeyword,
    ...currentKeywords.filter(item => item !== normalizedKeyword),
  ]);
};

export const removeRecentNoticeSearch = async (
  keyword: string,
): Promise<string[]> => {
  const normalizedKeyword = normalizeKeyword(keyword);
  const currentKeywords = await loadRecentNoticeSearches();

  return persistRecentNoticeSearches(
    currentKeywords.filter(item => item !== normalizedKeyword),
  );
};

export const clearRecentNoticeSearches = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(NOTICE_RECENT_SEARCHES_STORAGE_KEY);
  } catch (error) {
    console.warn('최근 공지 검색어 삭제 실패:', error);
  }
};
