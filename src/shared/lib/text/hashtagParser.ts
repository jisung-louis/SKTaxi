export interface TextPart {
  type: 'text' | 'hashtag';
  content: string;
  tag?: string; // hashtag인 경우에만 존재
}

export const parseHashtags = (text: string): TextPart[] => {
  const hashtagRegex = /#[\w가-힣]+/g;
  const parts: TextPart[] = [];
  let lastIndex = 0;
  
  text.replace(hashtagRegex, (match, index) => {
    // 일반 텍스트 추가
    if (index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, index)
      });
    }
    
    // 해시태그 추가
    parts.push({
      type: 'hashtag',
      content: match,
      tag: match.slice(1) // # 제거
    });
    
    lastIndex = index + match.length;
    return match;
  });
  
  // 마지막 텍스트 추가
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex)
    });
  }
  
  return parts;
};
