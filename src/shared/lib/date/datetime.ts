// SKTaxi: ISO 문자열(yyyy-mm-ddThh:mm:ssZ...)을 "오전/오후 hh:mm" 포맷으로 변환
export function formatKoreanAmPmTime(isoString?: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const isPM = hours >= 12;
  const period = isPM ? '오후' : '오전';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const mm = minutes < 10 ? `0${minutes}` : String(minutes);
  return `${period} ${hours}:${mm}`;
}


