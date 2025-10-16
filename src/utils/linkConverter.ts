

const bbsToSubviewMap: Record<string, string> = {
  "97": "342",   // 새소식
  "96": "343",   // 학사
  "116": "901",  // 학생
  "95": "344",   // 장학/등록/학자금
  "94": "345",   // 입학
  "93": "346",   // 취업/진로개발/창업
  "90": "347",   // 공모/행사
  "89": "348",   // 교육/글로벌
  "87": "349",   // 일반
  "86": "350",   // 입찰구매정보
  "84": "351",   // 사회봉사센터
  "83": "352",   // 장애학생지원센터
  "82": "353",   // 생활관
  "80": "354",   // 비교과
};

export function convertToSubviewURL(link: string): string {
  const match = link.match(/bbs\/skukr\/(\d+)\/(\d+)\/artclView\.do/);
  if (!match) return link;

  const [_, bbsId, articleId] = match;
  const subviewId = bbsToSubviewMap[bbsId];
  if (!subviewId) return link;

  const rawPath = `/bbs/skukr/${bbsId}/${articleId}/artclView.do?isViewMine=false&bbsClSeq=&srchWrd=&page=1&password=`;
  const encodedPath = encodeURIComponent(rawPath);
  const fullEncoded = btoa(`fnct1|@@|${encodedPath}`);

  return `https://www.sungkyul.ac.kr/skukr/${subviewId}/subview.do?enc=${fullEncoded}`;
}