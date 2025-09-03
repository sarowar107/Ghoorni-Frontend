import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import questionService, { QuestionCreateRequest } from '../../services/questionService';
import { useAuth } from '../../contexts/AuthContext';

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionAsked: () => void;
}

const DEPARTMENTS = ['CSE', 'EEE', 'ME', 'CE', 'Arch', 'URP', 'MIE', 'PME', 'ETE', 'BME', 'ALL'];
const BATCHES = ['19', '20', '21', '22', '23', '24', '1'];

const DEPT_OPTIONS = DEPARTMENTS.map(dept => ({ value: dept, label: dept }));
const BATCH_OPTIONS = BATCHES.map(b => ({ value: b, label: b === '1' ? 'ALL' : b }));

const AskQuestionModal: React.FC<AskQuestionModalProps> = ({ isOpen, onClose, onQuestionAsked }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [toDept, setToDept] = useState('');
  const [toBatch, setToBatch] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectStyles = "w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface focus:ring-2 focus:ring-cuet-primary-500 focus:outline-none text-gray-900 dark:text-dark-text";
  const inputStyles = "w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-border/50 focus:ring-2 focus:ring-cuet-primary-500 focus:outline-none";

  React.useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setTitle('');
      setDescription('');
      setError(null);
      setIsSubmitting(false);
      
      // Set default values based on user role
      if (user?.role === 'admin') {
        setToDept('ALL');
        setToBatch('1');
      } else if (user?.role === 'teacher') {
        setToDept(user.deptName || '');
        setToBatch('');
      } else if (user?.role === 'cr' || user?.role === 'student') {
        setToDept(user.deptName || '');
        setToBatch(user.batch || '');
      }
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and description cannot be empty.');
      return;
    }
    if (!user) {
      setError('You must be logged in to ask a question.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let effectiveToDept = toDept;
      let effectiveToBatch = toBatch;

      if (user?.role === 'teacher') {
        effectiveToDept = user.deptName;
        if (!effectiveToBatch) {
          setError('Please select a target batch.');
          setIsSubmitting(false);
          return;
        }
      } else if (user?.role === 'cr' || user?.role === 'student') {
        effectiveToDept = user.deptName || '';
        effectiveToBatch = user.batch || '';
      } else if (user?.role === 'admin') {
        effectiveToDept = effectiveToDept || 'ALL';
        effectiveToBatch = effectiveToBatch || '1';
      }

      const questionData: QuestionCreateRequest = {
        title,
        description,
        toDept: effectiveToDept,
        toBatch: effectiveToBatch,
        isPublic: user?.role === 'admin' ? isPublic : false
      };
      await questionService.createQuestion(questionData);
      setTitle('');
      setDescription('');
      onQuestionAsked(); // This will close the modal and refresh the list
    } catch (err: any) {
      console.error('Failed to create question:', err);
      
      if (err?.response?.status === 403 && err?.response?.data?.includes('Email verification required')) {
        setError('Email verification required to ask questions. Please verify your email first.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in-fast" onClick={onClose}>
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-95 animate-slide-up-fast" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Ask a Public Question</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border">
            <X size={24} className="text-gray-600 dark:text-dark-text-secondary" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="question-title" className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
              Title
            </label>
            <input
              id="question-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., How to setup a Vite project with React?"
              className={inputStyles}
              required
            />
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">Be specific and imagine you’re asking a question to another person.</p>
          </div>
          <div>
            <label htmlFor="question-description" className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
              Description
            </label>
            <textarea
              id="question-description"
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Include all the information someone would need to answer your question."
              className="w-full p-3 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-border/50 focus:ring-2 focus:ring-cuet-primary-500 focus:outline-none"
              required
            />
          </div>

          {user?.role === 'teacher' && (
            <div>
              <label htmlFor="toBatchTeacher" className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Target Batch</label>
              <select
                id="toBatchTeacher"
                value={toBatch}
                onChange={(e) => setToBatch(e.target.value)}
                className={selectStyles}
                required
              >
                <option value="" disabled>Select a batch</option>
                {BATCH_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          )}

          {user?.role === 'cr' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                Target Department & Batch
              </label>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary bg-gray-50 dark:bg-dark-border/50 px-4 py-2 rounded-lg">
                This question will be visible to {user.deptName} department, batch {user.batch}.
              </p>
            </div>
          )}

          {user?.role === 'admin' && (
            <>
              <div>
                <label htmlFor="toDeptAdmin" className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Target Department</label>
                <select
                  id="toDeptAdmin"
                  value={toDept}
                  onChange={(e) => setToDept(e.target.value)}
                  className={selectStyles}
                  required
                >
                  {DEPT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="toBatchAdmin" className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Target Batch</label>
                <select
                  id="toBatchAdmin"
                  value={toBatch}
                  onChange={(e) => setToBatch(e.target.value)}
                  className={selectStyles}
                  required
                >
                  {BATCH_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="isPublic"
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 text-cuet-primary-600 focus:ring-cuet-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-900 dark:text-dark-text">
                  Make Public (Visible to all users)
                </label>
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end items-center gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-dark-text bg-gray-100 dark:bg-dark-border rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border/80 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-5 py-2 bg-cuet-primary-900 text-white font-semibold rounded-lg shadow-md hover:bg-cuet-primary-800 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Post Question
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskQuestionModal;
