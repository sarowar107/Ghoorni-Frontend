import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Info } from 'lucide-react';
import CGPAChart from './CGPAChart';

interface CGPAResultsProps {
  cgpa: number;
  totalCredits: number;
  totalGradePoints: number;
  hasChanges: boolean;
}

const CGPAResults: React.FC<CGPAResultsProps> = ({ cgpa, totalCredits, totalGradePoints, hasChanges }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-6 space-y-6 h-full"
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
        <BrainCircuit size={22} />
        Your Results
      </h2>
      
      <div className="relative flex items-center justify-center h-40">
        <CGPAChart cgpa={cgpa} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm text-gray-500 dark:text-dark-text-secondary">Current CGPA</span>
          <span className="text-5xl font-bold text-gray-800 dark:text-white tracking-tight">
            {cgpa.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Total Credits</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalCredits.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Total Points</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalGradePoints.toFixed(2)}</p>
        </div>
      </div>
      
      {hasChanges && (
        <div className="flex items-center gap-3 p-3 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-600 dark:text-sky-400">
          <Info size={20} />
          <p className="text-sm font-medium">You are in simulation mode.</p>
        </div>
      )}
    </motion.div>
  );
};

export default CGPAResults;
