export const TIMETABLE_COURSE_COLORS = [
  '#FFB3BA',
  '#BAFFC9',
  '#BAE1FF',
  '#FFFFBA',
  '#FFDFBA',
  '#D1BAFF',
  '#FFCCCB',
  '#B4FFA5',
  '#C4E8E6',
  '#FFE5CC',
];

export const assignColor = (index: number, colorPalette: string[]): string => {
  return colorPalette[index % colorPalette.length];
};
