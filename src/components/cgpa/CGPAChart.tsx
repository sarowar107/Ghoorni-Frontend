import React from 'react';
import { motion } from 'framer-motion';

interface CGPAChartProps {
  cgpa: number;
}

const CGPAChart: React.FC<CGPAChartProps> = ({ cgpa }) => {
  // Normalize CGPA to a percentage of 4.0
  const percentage = Math.min(100, Math.max(0, (cgpa / 4.0) * 100));
  const circumference = 2 * Math.PI * 54; // 2 * pi * radius

  return (
    <svg className="w-full h-full" viewBox="0 0 120 120">
      {/* Background circle */}
      <circle
        cx="60"
        cy="60"
        r="54"
        fill="none"
        strokeWidth="12"
        className="stroke-gray-200 dark:stroke-dark-bg"
      />
      {/* Progress circle */}
      <motion.circle
        cx="60"
        cy="60"
        r="54"
        fill="none"
        strokeWidth="12"
        className="stroke-emerald-500"
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </svg>
  );
};

export default CGPAChart;
