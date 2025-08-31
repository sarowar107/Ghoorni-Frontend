import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, ChevronDown } from 'lucide-react';
import { Course } from '../../utils/cgpaParser';
import { GRADE_OPTIONS } from '../../constants/grades';

interface SemesterBreakdownProps {
  courses: Course[];
}

const gradeColors: { [key: string]: string } = {
  'A+': 'bg-green-500',
  'A': 'bg-emerald-500',
  'A-': 'bg-teal-500',
  'B+': 'bg-cyan-500',
  'B': 'bg-sky-500',
  'B-': 'bg-blue-500',
  'C+': 'bg-indigo-500',
  'C': 'bg-violet-500',
  'D': 'bg-purple-500',
  'F': 'bg-red-500',
};

const SemesterBreakdown: React.FC<SemesterBreakdownProps> = ({ courses }) => {
  const semesterData = useMemo(() => {
    const groupedByTerm = courses.reduce((acc, course) => {
      const term = course.levelTerm || 'Uncategorized';
      if (!acc[term]) {
        acc[term] = [];
      }
      acc[term].push(course);
      return acc;
    }, {} as Record<string, Course[]>);

    return Object.entries(groupedByTerm)
      .map(([term, termCourses]) => {
        let totalCredits = 0;
        let totalPoints = 0;
        const gradeCounts: { [key: string]: number } = {};

        termCourses.forEach(course => {
          const gradeInfo = GRADE_OPTIONS.find(g => g.grade === course.grade);
          if (gradeInfo && course.credit > 0) {
            totalCredits += course.credit;
            totalPoints += course.credit * gradeInfo.point;
            gradeCounts[course.grade] = (gradeCounts[course.grade] || 0) + 1;
          }
        });

        const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
        return { term, sgpa, gradeCounts };
      })
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [courses]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-surface rounded-xl shadow-md"
    >
      <div className="p-6 border-b border-gray-200 dark:border-dark-border">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <LayoutGrid size={22} />
          Semester Breakdown
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">
          Review your performance and grade distribution per term.
        </p>
      </div>
      <div className="space-y-2 p-4 max-h-[70vh] overflow-y-auto">
        {semesterData.map(({ term, sgpa, gradeCounts }) => (
          <details key={term} className="group bg-gray-50 dark:bg-dark-bg rounded-lg">
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
              <div className="font-semibold text-gray-800 dark:text-dark-text">{term}</div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-cuet-primary-800 dark:text-cuet-primary-400 bg-cuet-primary-500/10 px-2 py-1 rounded-md">
                  SGPA: {sgpa.toFixed(2)}
                </span>
                <ChevronDown size={20} className="text-gray-500 group-open:rotate-180 transition-transform" />
              </div>
            </summary>
            <div className="p-4 border-t border-gray-200 dark:border-dark-border">
              <div className="flex flex-wrap gap-2">
                {Object.entries(gradeCounts)
                  .sort(([gradeA], [gradeB]) => {
                     const order = Object.keys(gradeColors);
                     return order.indexOf(gradeA) - order.indexOf(gradeB);
                  })
                  .map(([grade, count]) => (
                  <div key={grade} className="flex items-center gap-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-full px-3 py-1 text-xs">
                    <span className={`w-3 h-3 rounded-full ${gradeColors[grade] || 'bg-gray-400'}`}></span>
                    <span className="font-semibold text-gray-700 dark:text-dark-text">{grade}</span>
                    <span className="text-gray-500 dark:text-dark-text-secondary">x {count}</span>
                  </div>
                ))}
              </div>
            </div>
          </details>
        ))}
      </div>
    </motion.div>
  );
};

export default SemesterBreakdown;
