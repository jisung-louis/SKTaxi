const ACADEMIC_SCHEDULE_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
];

export const assignAcademicScheduleColor = (index: number): string => {
  return ACADEMIC_SCHEDULE_COLORS[index % ACADEMIC_SCHEDULE_COLORS.length];
};

export { ACADEMIC_SCHEDULE_COLORS };
