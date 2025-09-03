import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { NoticeCreateRequest } from '../../services/noticeService';
import { useAuth } from '../../contexts/AuthContext';

interface CreateNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoticeCreate: (notice: NoticeCreateRequest) => Promise<void>;
}

const DEPARTMENTS = ['CSE', 'EEE', 'ME', 'CE', 'Arch', 'URP', 'MIE', 'PME', 'ETE', 'BME', 'ALL'];
const BATCHES = ['19', '20', '21', '22', '23', '24', '1']; // 1 means ALL batches

const DEPT_OPTIONS = DEPARTMENTS.map(dept => ({ value: dept, label: dept }));
const BATCH_OPTIONS = BATCHES.map(b => ({ value: b, label: b === '1' ? 'ALL' : b }));

const CreateNoticeModal: React.FC<CreateNoticeModalProps> = ({ isOpen, onClose, onNoticeCreate }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [toDept, setToDept] = useState('');
  const [toBatch, setToBatch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectStyles = "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-dark-border focus:outline-none focus:ring-cuet-primary-500 focus:border-cuet-primary-500 sm:text-sm rounded-md bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text";
  const inputStyles = "mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-cuet-primary-500 focus:border-cuet-primary-500 sm:text-sm";

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setTitle('');
      setContent('');
      setExpiryTime('');
      setIsPublic(false);
      
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

  const validateForm = (): boolean => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill out both title and content fields.');
      return false;
    }

    if (user?.role === 'admin') {
      if (!toDept) {
        alert('Please select a target department.');
        return false;
      }
      if (!toBatch) {
        alert('Please select a target batch.');
        return false;
      }
    } else if (user?.role === 'teacher' && !toBatch) {
      alert('Please select a target batch.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    // Set default values based on user role
    let effectiveToDept = toDept;
    let effectiveToBatch = toBatch;

    if (user?.role === 'teacher') {
      effectiveToDept = user.deptName;
      if (!effectiveToBatch) {
        alert('Please select a batch');
        return;
      }
    } else if (user?.role === 'cr' || user?.role === 'student') {
      effectiveToDept = user.deptName;
      effectiveToBatch = user.batch || '';
    } else if (user?.role === 'admin') {
      effectiveToDept = effectiveToDept || 'ALL';
      effectiveToBatch = effectiveToBatch || '1';  // 1 means ALL batches
    }

    setIsLoading(true);

    const noticeData: NoticeCreateRequest = {
      title: title.trim(),
      content: content.trim(),
      expiryTime: expiryTime ? new Date(expiryTime).toISOString() : undefined,
      isPublic: user?.role === 'admin' ? isPublic : undefined,
      toDept: effectiveToDept,
      toBatch: effectiveToBatch,
    };

    try {
      await onNoticeCreate(noticeData);
      
      // Reset form and close modal on success
      setTitle('');
      setContent('');
      setExpiryTime('');
      setIsPublic(false);
      setToDept('');
      setToBatch('');
      onClose();
    } catch (error) {
      console.error('Error creating notice:', error);
      // The parent component will handle showing an error message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Notice">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={inputStyles}
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
            Content
          </label>
          <textarea
            id="content"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className={inputStyles}
          />
        </div>
        <div>
          <label htmlFor="expiryTime" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
            Expiry Time (Optional)
          </label>
          <input
            type="datetime-local"
            id="expiryTime"
            value={expiryTime}
            onChange={(e) => setExpiryTime(e.target.value)}
            className={`${inputStyles} dark:[color-scheme:dark]`}
          />
        </div>

        {user?.role === 'teacher' && (
          <div>
            <label htmlFor="toBatchTeacher" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Target Batch</label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
              Target Department & Batch
            </label>
            <p className="mt-1 text-sm text-gray-600 dark:text-dark-text-secondary bg-gray-50 dark:bg-dark-border/50 px-3 py-2 rounded-md">
              This notice will be visible to {user.deptName} department, batch {user.batch}.
            </p>
          </div>
        )}

        {user?.role === 'admin' && (
          <>
            <div>
              <label htmlFor="toDeptAdmin" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Target Department</label>
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
              <label htmlFor="toBatchAdmin" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Target Batch</label>
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
            <div className="flex items-center mt-4">
              <input
                id="isPublic"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-cuet-primary-600 focus:ring-cuet-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900 dark:text-dark-text">
                Make Public (Visible to all users)
              </label>
            </div>
          </>
        )}

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text bg-gray-100 dark:bg-dark-border rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border/80"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-cuet-primary-900 rounded-lg hover:bg-cuet-primary-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? 'Creating...' : 'Create Notice'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateNoticeModal;
