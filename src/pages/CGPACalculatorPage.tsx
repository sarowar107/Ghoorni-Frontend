import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, PlayCircle } from 'lucide-react';

import { Course, parseCourseData } from '../utils/cgpaParser';
import { GRADE_OPTIONS } from '../constants/grades';
import DataInput from '../components/cgpa/DataInput';
import CourseEditor from '../components/cgpa/CourseEditor';
import TargetCalculator from '../components/cgpa/TargetCalculator';
import CGPAResults from '../components/cgpa/CGPAResults';
import SemesterBreakdown from '../components/cgpa/SemesterBreakdown';
import HowToUseModal from '../components/cgpa/HowToUseModal';

const CGPACalculatorPage: React.FC = () => {
  const [rawText, setRawText] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isHowToUseModalOpen, setIsHowToUseModalOpen] = useState(false);

  const handleParseData = () => {
    try {
      setError(null);
      const parsedCourses = parseCourseData(rawText);
      if (parsedCourses.length === 0) {
        setError("No valid course data found. Please check the format.");
        return;
      }
      setCourses(parsedCourses);
    } catch (err) {
      setError("Failed to parse data. Ensure it's tab-separated and includes required columns.");
      setCourses([]);
    }
  };

  const handleGradeChange = (courseId: string, newGrade: string) => {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course.id === courseId ? { ...course, grade: newGrade } : course
      )
    );
  };

  const handleResetGrade = (courseId: string) => {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course.id === courseId ? { ...course, grade: course.originalGrade } : course
      )
    );
  };

  const { totalCredits, totalGradePoints, cgpa } = useMemo(() => {
    let totalCredits = 0;
    let totalGradePoints = 0;

    courses.forEach(course => {
      const gradeInfo = GRADE_OPTIONS.find(g => g.grade === course.grade);
      if (gradeInfo && course.credit > 0) {
        totalCredits += course.credit;
        totalGradePoints += course.credit * gradeInfo.point;
      }
    });

    const cgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    return { totalCredits, totalGradePoints, cgpa };
  }, [courses]);

  const hasChanges = useMemo(() => {
    return courses.some(c => c.grade !== c.originalGrade);
  }, [courses]);

  return (
    <>
      <Helmet>
        <title>CGPA Calculator | ghoorni</title>
      </Helmet>
      <HowToUseModal isOpen={isHowToUseModalOpen} onClose={() => setIsHowToUseModalOpen(false)} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">CGPA Calculator</h1>
            <p className="mt-2 text-gray-600 dark:text-dark-text-secondary">
              Analyze, simulate, and plan your academic performance.
            </p>
          </div>
          <motion.button
            onClick={() => setIsHowToUseModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-cuet-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-cuet-primary-700 transition-all duration-300"
          >
            <PlayCircle size={20} />
            How to Use
          </motion.button>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 dark:text-red-400">
            <AlertTriangle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Row 1: Data Input & CGPA Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <DataInput
            rawText={rawText}
            setRawText={setRawText}
            onParse={handleParseData}
          />
          {courses.length > 0 && (
            <CGPAResults
              cgpa={cgpa}
              totalCredits={totalCredits}
              totalGradePoints={totalGradePoints}
              hasChanges={hasChanges}
            />
          )}
        </div>

        {courses.length > 0 ? (
          <>
            {/* Row 2: Course Editor & Semester Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-3">
                <CourseEditor
                  courses={courses}
                  onGradeChange={handleGradeChange}
                  onResetGrade={handleResetGrade}
                />
              </div>
              <div className="lg:col-span-2">
                <SemesterBreakdown courses={courses} />
              </div>
            </div>

            {/* Row 3: Target Calculator */}
            <TargetCalculator
              currentCGPA={cgpa}
              completedCredits={totalCredits}
              courses={courses}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-dark-surface rounded-xl shadow-md p-8 text-center mt-8">
            <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">Your Analysis Will Appear Here</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
              Paste your data from the university portal and click "Calculate" to get started.
            </p>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default CGPACalculatorPage;
