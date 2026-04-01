/**
 * 교시 정보 생성 (1-15교시)
 */
export const generatePeriods = (): number[] => {
  return Array.from({length: 15}, (_, i) => i + 1);
};

/**
 * 교시별 시간 정보
 */
export const getPeriodTimeInfo = (
  period: number,
): {startTime: string; endTime: string} => {
  const periodTimes: {[key: number]: {startTime: string; endTime: string}} = {
    1: {startTime: '09:00', endTime: '09:50'},
    2: {startTime: '09:55', endTime: '10:45'},
    3: {startTime: '10:50', endTime: '11:40'},
    4: {startTime: '11:55', endTime: '12:45'},
    5: {startTime: '12:50', endTime: '13:40'},
    6: {startTime: '13:45', endTime: '14:35'},
    7: {startTime: '14:40', endTime: '15:30'},
    8: {startTime: '15:35', endTime: '16:25'},
    9: {startTime: '16:30', endTime: '17:20'},
    10: {startTime: '17:40', endTime: '18:30'},
    11: {startTime: '18:30', endTime: '19:20'},
    12: {startTime: '19:20', endTime: '20:10'},
    13: {startTime: '20:15', endTime: '21:05'},
    14: {startTime: '21:05', endTime: '21:55'},
    15: {startTime: '21:55', endTime: '22:45'},
  };

  return periodTimes[period] || {startTime: '00:00', endTime: '00:00'};
};

/**
 * 현재 학기 계산 (1~6월: 1학기, 7~12월: 2학기)
 */
export const getCurrentSemester = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const semester = month >= 1 && month <= 6 ? 1 : 2;
  return `${year}-${semester}`;
};

/**
 * 학기 시작 월의 첫 번째 월요일 찾기
 */
const getFirstMondayOfSemester = (year: number, semester: number): Date => {
  const startMonth = semester === 1 ? 2 : 8;
  const firstDayOfMonth = new Date(year, startMonth, 1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const dayOfWeek = firstDayOfMonth.getDay();
  const daysToMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;

  const firstMonday = new Date(firstDayOfMonth);
  firstMonday.setDate(firstDayOfMonth.getDate() + daysToMonday);
  firstMonday.setHours(0, 0, 0, 0);

  return firstMonday;
};

/**
 * 현재 학사 주차 계산
 * 1학기(1~6월): 3월의 첫 번째 주차를 1주차로 계산
 * 2학기(7~12월): 9월의 첫 번째 주차를 1주차로 계산
 * academicWeek이 1보다 작으면 0 반환
 */
export const getCurrentAcademicWeek = (): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const semester = month >= 1 && month <= 6 ? 1 : 2;
  const firstMonday = getFirstMondayOfSemester(year, semester);

  if (now < firstMonday) {
    return 0;
  }

  const diffTime = now.getTime() - firstMonday.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(diffDays / 7) + 1;

  return weekNumber < 1 ? 0 : weekNumber;
};

/**
 * 학기 옵션 생성 (2025-1학기부터 현재 학기까지)
 */
export const generateSemesterOptions = (): string[] => {
  const currentSemester = getCurrentSemester();
  const [currentYear, currentSem] = currentSemester.split('-').map(Number);

  const options: string[] = [];

  for (let year = 2025; year <= currentYear; year++) {
    const endSem = year === currentYear ? currentSem : 2;

    for (let sem = 1; sem <= endSem; sem++) {
      options.push(`${year}-${sem}`);
    }
  }

  return options;
};

/**
 * 학기 표시 형식 변환 (2024-2 -> 2024년 2학기)
 */
export const formatSemesterDisplay = (semester: string): string => {
  const [year, sem] = semester.split('-');
  return `${year}년 ${sem}학기`;
};

/**
 * 현재 시간 정보 가져오기
 */
export const getCurrentTimeInfo = () => {
  const now = new Date();
  const currentTime = `${now
    .getHours()
    .toString()
    .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  for (let period = 1; period <= 15; period++) {
    const periodTime = getPeriodTimeInfo(period);
    if (
      currentTime >= periodTime.startTime &&
      currentTime <= periodTime.endTime
    ) {
      const [startHour, startMinute] = periodTime.startTime.split(':').map(Number);
      const [endHour, endMinute] = periodTime.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const progress = (currentMinutes - startMinutes) / (endMinutes - startMinutes);

      return {
        currentPeriod: period,
        progress: Math.max(0, Math.min(1, progress)),
        isInClassTime: true,
      };
    }
  }

  return {
    currentPeriod: 0,
    progress: 0,
    isInClassTime: false,
  };
};
