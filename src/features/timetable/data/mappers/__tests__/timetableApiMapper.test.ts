import {buildTimetableSemesterRecord} from '../timetableApiMapper';

describe('buildTimetableSemesterRecord', () => {
  it('백엔드 시간표 응답을 상세 화면 모델로 변환한다', () => {
    const record = buildTimetableSemesterRecord({
      catalogCourses: [
        {
          id: 'catalog-course',
          semester: '2026-1',
          code: '01255',
          division: '001',
          name: '민법총칙',
          credits: 3,
          isOnline: false,
          professor: '문상혁',
          department: '법학과',
          grade: 2,
          category: '전공선택',
          location: '영401',
          note: null,
          schedule: [
            {
              dayOfWeek: 1,
              startPeriod: 3,
              endPeriod: 4,
            },
          ],
        },
      ],
      semesterId: '2026-1',
      timetable: {
        id: 'timetable-1',
        semester: '2026-1',
        courseCount: 2,
        totalCredits: 5,
        courses: [
          {
            id: 'catalog-course',
            code: '01255',
            division: '001',
            name: '민법총칙',
            professor: '문상혁',
            location: '영401',
            category: '전공선택',
            credits: 3,
            isOnline: false,
            schedule: [
              {
                dayOfWeek: 1,
                startPeriod: 3,
                endPeriod: 4,
              },
            ],
          },
          {
            id: 'manual-course',
            code: '직접 입력',
            division: null,
            name: '플랫폼세미나',
            professor: null,
            location: null,
            category: null,
            credits: 2,
            isOnline: true,
            schedule: [],
          },
        ],
        slots: [
          {
            courseId: 'catalog-course',
            courseName: '민법총칙',
            code: '01255',
            dayOfWeek: 1,
            startPeriod: 3,
            endPeriod: 4,
            professor: '문상혁',
            location: '영401',
          },
        ],
      },
      toneMap: {
        'manual-course': 'red',
      },
    });

    expect(record.id).toBe('2026-1');
    expect(record.label).toBe('2026-1학기');
    expect(record.catalogCourses[0]?.schedules[0]).toEqual({
      day: 'mon',
      startPeriod: 3,
      endPeriod: 4,
    });
    expect(record.catalogCourses[0]).toMatchObject({
      category: '전공선택',
      grade: 2,
    });
    expect(record.courses[0]).toMatchObject({
      id: 'catalog-course',
      name: '민법총칙',
      isOnline: false,
      locationLabel: '영401',
    });
    expect(record.courses[1]).toMatchObject({
      id: 'manual-course',
      name: '플랫폼세미나',
      isOnline: true,
      professor: '미정',
      schedules: [],
      toneId: 'red',
    });
  });
});
