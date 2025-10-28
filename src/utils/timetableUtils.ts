import { Course, CourseSchedule, TimetableBlock, TimetableCourse } from '../types/timetable';

/**
 * 교시 정보 생성 (1-15교시)
 */
export const generatePeriods = (): number[] => {
  return Array.from({ length: 15 }, (_, i) => i + 1);
};

/**
 * 교시별 시간 정보
 */
export const getPeriodTimeInfo = (period: number): { startTime: string; endTime: string } => {
  const periodTimes: { [key: number]: { startTime: string; endTime: string } } = {
    1: { startTime: '09:00', endTime: '09:50' },
    2: { startTime: '09:55', endTime: '10:45' },
    3: { startTime: '10:50', endTime: '11:40' },
    4: { startTime: '11:55', endTime: '12:45' },
    5: { startTime: '12:50', endTime: '13:40' },
    6: { startTime: '13:45', endTime: '14:35' },
    7: { startTime: '14:40', endTime: '15:30' },
    8: { startTime: '15:35', endTime: '16:25' },
    9: { startTime: '16:30', endTime: '17:20' },
    10: { startTime: '17:40', endTime: '18:30' },
    11: { startTime: '18:30', endTime: '19:20' },
    12: { startTime: '19:20', endTime: '20:10' },
    13: { startTime: '20:15', endTime: '21:05' },
    14: { startTime: '21:05', endTime: '21:55' },
    15: { startTime: '21:55', endTime: '22:45' },
  };
  
  return periodTimes[period] || { startTime: '00:00', endTime: '00:00' };
};

/**
 * 요일 이름 가져오기
 */
export const getWeekdayName = (dayOfWeek: number): string => {
  const weekdays = ['', '월', '화', '수', '목', '금', '토', '일'];
  return weekdays[dayOfWeek] || '';
};

/**
 * 수업 목록을 시간표 블록으로 변환
 */
export const coursesToTimetableBlocks = (courses: TimetableCourse[]): TimetableBlock[] => {
  const blocks: TimetableBlock[] = [];
  
  courses.forEach(course => {
    course.schedule.forEach(schedule => {
      blocks.push({
        course,
        dayOfWeek: schedule.dayOfWeek,
        startPeriod: schedule.startPeriod,
        endPeriod: schedule.endPeriod,
        row: 0, // 초기값, 나중에 계산
      });
    });
  });
  
  return blocks;
};

/**
 * 시간표 블록들을 행별로 정렬 (겹치는 블록 처리)
 */
export const arrangeBlocksInRows = (blocks: TimetableBlock[]): TimetableBlock[] => {
  // 요일별로 그룹화
  const blocksByDay: { [day: number]: TimetableBlock[] } = {};
  
  blocks.forEach(block => {
    if (!blocksByDay[block.dayOfWeek]) {
      blocksByDay[block.dayOfWeek] = [];
    }
    blocksByDay[block.dayOfWeek].push(block);
  });
  
  // 각 요일별로 행 배치
  Object.keys(blocksByDay).forEach(dayStr => {
    const day = parseInt(dayStr);
    const dayBlocks = blocksByDay[day];
    
    // 시작 교시순으로 정렬
    dayBlocks.sort((a, b) => a.startPeriod - b.startPeriod);
    
    // 겹치는 블록들을 다른 행에 배치
    const rows: TimetableBlock[][] = [];
    
    dayBlocks.forEach(block => {
      let assignedRow = -1;
      
      // 기존 행들 중에서 겹치지 않는 행 찾기
      for (let i = 0; i < rows.length; i++) {
        const canPlace = rows[i].every(existingBlock => 
          block.endPeriod <= existingBlock.startPeriod || 
          block.startPeriod >= existingBlock.endPeriod
        );
        
        if (canPlace) {
          assignedRow = i;
          break;
        }
      }
      
      // 겹치지 않는 행이 없으면 새 행 생성
      if (assignedRow === -1) {
        assignedRow = rows.length;
        rows.push([]);
      }
      
      block.row = assignedRow;
      rows[assignedRow].push(block);
    });
  });
  
  return blocks;
};

/**
 * 오늘의 수업 가져오기
 */
export const getTodayCourses = (courses: TimetableCourse[]): TimetableCourse[] => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=일, 1=월, ..., 6=토
  
  // 일요일(0)이면 빈 배열 반환
  if (dayOfWeek === 0) return [];
  
  // 월요일(1)부터 금요일(5)까지만 처리
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    return courses.filter(course => 
      course.schedule.some(schedule => schedule.dayOfWeek === dayOfWeek)
    );
  }
  
  return [];
};

/**
 * 시간표 블록이 겹치는지 확인
 */
export const isBlockOverlapping = (block1: TimetableBlock, block2: TimetableBlock): boolean => {
  if (block1.dayOfWeek !== block2.dayOfWeek) return false;
  
  return !(block1.endPeriod <= block2.startPeriod || block1.startPeriod >= block2.endPeriod);
};

/**
 * 수업 시간 문자열 포맷팅
 */
export const formatCourseTime = (schedule: CourseSchedule): string => {
  const dayName = getWeekdayName(schedule.dayOfWeek);
  if (schedule.startPeriod === schedule.endPeriod) {
    return `${dayName}${schedule.startPeriod}`;
  } else {
    return `${dayName}${schedule.startPeriod}-${schedule.endPeriod}`;
  }
};

/**
 * 수업 정보를 문자열로 변환 (검색용)
 */
export const courseToString = (course: Course): string => {
  const scheduleText = course.schedule.map(formatCourseTime).join(', ');
  return `${course.name} ${course.professor} ${course.location} ${scheduleText}`.toLowerCase();
};

/**
 * 두 수업의 시간이 겹치는지 확인
 */
export const isCourseOverlapping = (course1: Course, course2: Course): boolean => {
  return course1.schedule.some(schedule1 => 
    course2.schedule.some(schedule2 => 
      schedule1.dayOfWeek === schedule2.dayOfWeek &&
      schedule1.endPeriod >= schedule2.startPeriod && schedule1.startPeriod <= schedule2.endPeriod
    )
  );
};

/**
 * 새 수업과 겹치는 기존 수업들을 찾기
 */
export const findOverlappingCourses = (newCourse: Course, existingCourses: Course[]): Course[] => {
  return existingCourses.filter(existingCourse => 
    isCourseOverlapping(newCourse, existingCourse)
  );
};

/**
 * 현재 학기 계산 (1~6월: 1학기, 7~12월: 2학기)
 */
export const getCurrentSemester = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 0-11을 1-12로 변환
  
  const semester = month >= 1 && month <= 6 ? 1 : 2;
  return `${year}-${semester}`;
};

/**
 * 학기 옵션 생성 (2025-1학기부터 현재 학기까지)
 */
export const generateSemesterOptions = (): string[] => {
  const currentSemester = getCurrentSemester();
  const [currentYear, currentSem] = currentSemester.split('-').map(Number);
  
  const options: string[] = [];
  
  // 2025-1학기부터 현재 학기까지 생성
  for (let year = 2025; year <= currentYear; year++) {
    const startSem = year === 2025 ? 1 : 1;
    const endSem = year === currentYear ? currentSem : 2;
    
    for (let sem = startSem; sem <= endSem; sem++) {
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
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // 모든 교시를 확인하여 현재 시간이 속하는 교시 찾기
  for (let period = 1; period <= 15; period++) {
    const periodTime = getPeriodTimeInfo(period);
    if (currentTime >= periodTime.startTime && currentTime <= periodTime.endTime) {
      // 교시 내에서의 진행률 계산
      const startMinutes = parseInt(periodTime.startTime.split(':')[0]) * 60 + parseInt(periodTime.startTime.split(':')[1]);
      const endMinutes = parseInt(periodTime.endTime.split(':')[0]) * 60 + parseInt(periodTime.endTime.split(':')[1]);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const progress = (currentMinutes - startMinutes) / (endMinutes - startMinutes);
      
      return {
        currentPeriod: period,
        progress: Math.max(0, Math.min(1, progress)),
        isInClassTime: true
      };
    }
  }
  
  return {
    currentPeriod: 0,
    progress: 0,
    isInClassTime: false
  };
};