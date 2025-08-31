import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, RefreshCcw, ChevronsUpDown } from 'lucide-react';
import { Course } from '../../utils/cgpaParser';
import { GRADE_OPTIONS } from '../../constants/grades';

interface CourseEditorProps {
  courses: Course[];
  onGradeChange: (courseId: string, newGrade: string) => void;
  onResetGrade: (courseId: string) => void;
}

const CourseEditor: React.FC<CourseEditorProps> = ({ courses, onGradeChange, onResetGrade }) => {
  const groupedCourses = useMemo(() => {
    return courses.reduce((acc, course) => {
      const term = course.levelTerm || 'Uncategorized';
      if (!acc[term]) {
        acc[term] = [];
      }
      acc[term].push(course);
      return acc;
    }, {} as Record<string, Course[]>);
  }, [courses]);

  const sortedTerms = Object.keys(groupedCourses).sort();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-surface rounded-xl shadow-md"
    >
      <div className="p-6 border-b border-gray-200 dark:border-dark-border">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <BookOpen size={22} />
          Course & Grade Editor
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">
          This is your "What If" simulator. Change grades to see how your CGPA is affected.
        </p>
      </div>
      <div className="max-h-[70vh] overflow-y-auto">
        {sortedTerms.map(term => (
          <div key={term} className="border-b border-gray-200 dark:border-dark-border last:border-b-0">
            <h3 className="p-4 bg-gray-50 dark:bg-dark-border/50 text-sm font-semibold text-gray-700 dark:text-dark-text sticky top-0 z-10 backdrop-blur-sm">
              {term}
            </h3>
            <div className="divide-y divide-gray-100 dark:divide-dark-border">
              {groupedCourses[term].map(course => (
                <CourseRow
                  key={course.id}
                  course={course}
                  onGradeChange={onGradeChange}
                  onResetGrade={onResetGrade}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const CourseRow: React.FC<{ course: Course, onGradeChange: Function, onResetGrade: Function }> = ({ course, onGradeChange, onResetGrade }) => {
  const isModified = course.grade !== course.originalGrade;
  return (
    <div className={`grid grid-cols-12 gap-4 items-center p-4 text-sm ${isModified ? 'bg-sky-500/10' : ''}`}>
      <div className="col-span-5 md:col-span-6">
        <p className="font-medium text-gray-800 dark:text-dark-text">{course.code}</p>
        <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
          {course.credit.toFixed(2)} Credits {course.sessional && '· Sessional'}
        </p>
      </div>
      <div className="col-span-7 md:col-span-6 flex items-center justify-end gap-2">
        <div className="relative">
          <select
            value={course.grade}
            onChange={(e) => onGradeChange(course.id, e.target.value)}
            className="appearance-none w-28 text-center bg-gray-100 dark:bg-dark-border border border-transparent rounded-md py-2 px-3 font-semibold focus:outline-none focus:ring-2 focus:ring-cuet-primary-500 transition-colors"
          >
            {GRADE_OPTIONS.map(opt => (
              <option key={opt.grade} value={opt.grade}>{opt.grade}</option>
            ))}
          </select>
          <ChevronsUpDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {isModified && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => onResetGrade(course.id)}
            className="p-2 text-gray-500 hover:text-cuet-primary-700 dark:hover:text-cuet-primary-400 rounded-md transition-colors"
            title="Reset grade"
          >
            <RefreshCcw size={16} />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default CourseEditor;
