import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, AlertCircle, Info } from 'lucide-react';
import { Course } from '../../utils/cgpaParser';

interface TargetCalculatorProps {
  currentCGPA: number;
  completedCredits: number;
  courses: Course[];
}

const TOTAL_SEMESTERS = 8;

const TargetCalculator: React.FC<TargetCalculatorProps> = ({ currentCGPA, completedCredits, courses }) => {
  const [targetCGPA, setTargetCGPA] = useState('');

  const completedSemesters = useMemo(() => {
    const uniqueTerms = new Set(courses.map(c => c.levelTerm));
    return uniqueTerms.size;
  }, [courses]);

  const remainingSemesters = Math.max(0, TOTAL_SEMESTERS - completedSemesters);

  const estimatedRemainingCredits = useMemo(() => {
    if (completedSemesters === 0 || remainingSemesters === 0) return 0;
    const avgCreditsPerSemester = completedCredits / completedSemesters;
    return avgCreditsPerSemester * remainingSemesters;
  }, [completedCredits, completedSemesters, remainingSemesters]);

  const { requiredGPA, isValid } = useMemo(() => {
    const target = parseFloat(targetCGPA);
    const remainingCredits = estimatedRemainingCredits;

    if (isNaN(target) || remainingCredits <= 0 || target <= 0) {
      return { requiredGPA: 0, isValid: false };
    }

    const requiredTotalPoints = target * (completedCredits + remainingCredits);
    const currentTotalPoints = currentCGPA * completedCredits;
    const requiredFuturePoints = requiredTotalPoints - currentTotalPoints;
    const gpa = requiredFuturePoints / remainingCredits;

    return { requiredGPA: gpa, isValid: true };
  }, [targetCGPA, estimatedRemainingCredits, currentCGPA, completedCredits]);

  return (
    <motion.div
      className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Target size={22} />
            Target CGPA
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">
            Calculate the GPA you need in your remaining semesters.
          </p>
        </div>
        {remainingSemesters > 0 && (
          <div className="mt-3 md:mt-0 text-sm text-center bg-gray-100 dark:bg-dark-bg px-4 py-2 rounded-lg">
            You have <strong className="text-cuet-primary-800 dark:text-cuet-primary-400">{completedSemesters} of {TOTAL_SEMESTERS}</strong> semesters completed.
          </div>
        )}
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div className="md:col-span-2">
          <label htmlFor="target-cgpa" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Your Target CGPA</label>
          <input
            type="number"
            id="target-cgpa"
            value={targetCGPA}
            onChange={(e) => setTargetCGPA(e.target.value)}
            placeholder="e.g., 3.75"
            className="w-full p-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-cuet-primary-500 focus:border-cuet-primary-500 transition-colors"
          />
        </div>

        {isValid && (
          <div className="md:col-span-1 text-center p-4 bg-gray-50 dark:bg-dark-bg rounded-lg">
            <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Required GPA</p>
            <p className={`text-4xl font-bold my-1 ${requiredGPA > 4.0 || requiredGPA < 0 ? 'text-red-500' : 'text-cuet-primary-800 dark:text-cuet-primary-400'}`}>
              {requiredGPA.toFixed(2)}
            </p>
            {(requiredGPA > 4.0 || requiredGPA < 0) && (
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-red-500 dark:text-red-400">
                <AlertCircle size={14} />
                <span>Target is {requiredGPA > 4.0 ? 'unachievable' : 'invalid'}.</span>
              </div>
            )}
          </div>
        )}
      </div>
      {estimatedRemainingCredits > 0 && (
        <div className="mt-4 flex items-center gap-2 p-3 text-xs text-gray-500 dark:text-dark-text-secondary bg-gray-50 dark:bg-dark-bg rounded-lg">
          <Info size={14} />
          <span>
            Calculation is based on an estimated <strong className="text-gray-700 dark:text-dark-text">{estimatedRemainingCredits.toFixed(2)} credits</strong> over the remaining <strong className="text-gray-700 dark:text-dark-text">{remainingSemesters} semesters</strong>.
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default TargetCalculator;
