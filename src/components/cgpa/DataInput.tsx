import React from 'react';
import { motion } from 'framer-motion';
import { Play, ClipboardPaste } from 'lucide-react';

interface DataInputProps {
  rawText: string;
  setRawText: (text: string) => void;
  onParse: () => void;
}

const DataInput: React.FC<DataInputProps> = ({ rawText, setRawText, onParse }) => {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRawText(text);
    } catch (error) {
      console.error('Failed to read clipboard contents: ', error);
      // You might want to show a toast notification here
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">1. Input Your Data</h2>
      <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-4">
        Copy the course results table from your university portal and paste it here.
      </p>
      <div className="relative">
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Course Code	Course Credit	Level-Term	Sessional	Result..."
          className="w-full h-48 p-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-cuet-primary-500 focus:border-cuet-primary-500 transition-colors text-sm"
        />
        <button
          onClick={handlePaste}
          className="absolute top-2 right-2 p-2 text-gray-500 hover:text-cuet-primary-700 dark:hover:text-cuet-primary-400 bg-white/50 dark:bg-dark-surface/50 backdrop-blur-sm rounded-md transition-colors"
          title="Paste from clipboard"
        >
          <ClipboardPaste size={18} />
        </button>
      </div>
      <button
        onClick={onParse}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-cuet-primary-800 text-white font-semibold py-3 px-4 rounded-lg hover:bg-cuet-primary-900 transition-all duration-200 shadow-lg hover:shadow-cuet-primary-800/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cuet-primary-500"
      >
        <Play size={18} />
        Calculate CGPA
      </button>
    </motion.div>
  );
};

export default DataInput;
