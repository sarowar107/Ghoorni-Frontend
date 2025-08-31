export const GRADE_MAP: { [key: string]: number } = {
  'A+': 4.00,
  'A': 3.75,
  'A-': 3.50,
  'B+': 3.25,
  'B': 3.00,
  'B-': 2.75,
  'C+': 2.50,
  'C': 2.25,
  'D': 2.00,
  'F': 0.00,
};

export const GRADE_OPTIONS = Object.entries(GRADE_MAP).map(([grade, point]) => ({
  grade,
  point,
}));
