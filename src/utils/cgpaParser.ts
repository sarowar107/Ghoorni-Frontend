import { v4 as uuidv4 } from 'uuid';
import { GRADE_MAP } from '../constants/grades';

export interface Course {
  id: string;
  code: string;
  credit: number;
  levelTerm: string;
  sessional: boolean;
  grade: string;
  originalGrade: string;
  courseType: string;
}

export const parseCourseData = (text: string): Course[] => {
  const lines = text.trim().split('\n');
  const courses: Course[] = [];

  // Find header to map columns dynamically
  const headerLine = lines.find(line => line.toLowerCase().includes('course code') && line.toLowerCase().includes('course credit'));
  if (!headerLine) {
    // Fallback for data without headers
    return parseWithoutHeader(lines);
  }

  const headers = headerLine.split('\t').map(h => h.trim().toLowerCase());
  const codeIndex = headers.indexOf('course code');
  const creditIndex = headers.indexOf('course credit');
  const levelTermIndex = headers.indexOf('level-term');
  const sessionalIndex = headers.indexOf('sessional');
  const resultIndex = headers.indexOf('result');
  const typeIndex = headers.indexOf('course type');

  if (codeIndex === -1 || creditIndex === -1 || resultIndex === -1) {
    throw new Error("Required columns 'Course Code', 'Course Credit', or 'Result' not found.");
  }

  lines.forEach(line => {
    if (line === headerLine) return; // Skip header line

    const columns = line.split('\t');
    const grade = columns[resultIndex]?.trim().toUpperCase();
    const credit = parseFloat(columns[creditIndex]?.trim());

    if (columns.length > Math.max(codeIndex, creditIndex, resultIndex) && grade && GRADE_MAP.hasOwnProperty(grade) && !isNaN(credit)) {
      courses.push({
        id: uuidv4(),
        code: columns[codeIndex]?.trim() || 'N/A',
        credit,
        levelTerm: levelTermIndex !== -1 ? columns[levelTermIndex]?.trim() : 'N/A',
        sessional: sessionalIndex !== -1 ? columns[sessionalIndex]?.trim().toLowerCase() === 'yes' : false,
        grade,
        originalGrade: grade,
        courseType: typeIndex !== -1 ? columns[typeIndex]?.trim() : 'N/A',
      });
    }
  });

  return courses;
};

// Fallback function if no header is detected
const parseWithoutHeader = (lines: string[]): Course[] => {
    const courses: Course[] = [];
    lines.forEach(line => {
        const columns = line.split('\t');
        // Assuming format: Code, Credit, Level-Term, Sessional, Result, Type
        if (columns.length >= 5) {
            const grade = columns[4]?.trim().toUpperCase();
            const credit = parseFloat(columns[1]?.trim());

            if (grade && GRADE_MAP.hasOwnProperty(grade) && !isNaN(credit)) {
                courses.push({
                    id: uuidv4(),
                    code: columns[0]?.trim() || 'N/A',
                    credit,
                    levelTerm: columns[2]?.trim() || 'N/A',
                    sessional: columns[3]?.trim().toLowerCase() === 'yes',
                    grade,
                    originalGrade: grade,
                    courseType: columns[5]?.trim() || 'N/A',
                });
            }
        }
    });
    return courses;
}
