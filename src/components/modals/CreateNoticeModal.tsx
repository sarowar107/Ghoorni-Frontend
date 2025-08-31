import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { NoticeCreateRequest } from '../../services/noticeService';
import { useAuth } from '../../contexts/AuthContext';

interface CreateNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoticeCreate: (notice: NoticeCreateRequest) => Promise<void>;
}

const CreateNoticeModal: React.FC<CreateNoticeModalProps> = ({ isOpen, onClose, onNoticeCreate }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [department, setDepartment] = useState('');
  const [batch, setBatch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('Please fill out both title and content fields.');
      return;
    }
    
    setIsLoading(true);
    
    const noticeData: NoticeCreateRequest = {
      title: title.trim(),
      content: content.trim(),
      expiryTime: expiryTime ? new Date(expiryTime).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }) : undefined,
      isPublic: user?.role === 'admin' ? isPublic : undefined,
      department: department || undefined,
      batch: batch || undefined,
    };

    try {
      await onNoticeCreate(noticeData);
      
      // Reset form and close modal on success
      setTitle('');
      setContent('');
      setExpiryTime('');
      setIsPublic(false);
      setDepartment('');
      setBatch('');
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
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-cuet-primary-500 focus:border-cuet-primary-500 sm:text-sm"
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
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-cuet-primary-500 focus:border-cuet-primary-500 sm:text-sm"
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
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-cuet-primary-500 focus:border-cuet-primary-500 sm:text-sm"
          />
        </div>

        {user?.role === 'teacher' && (
          <div>
            <label htmlFor="batch" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
              Target Batch (e.g., 20, 21)
            </label>
            <input
              type="text"
              id="batch"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              placeholder="Leave empty for all batches in your department"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-cuet-primary-500 focus:border-cuet-primary-500 sm:text-sm"
            />
          </div>
        )}

        {user?.role === 'admin' && (
          <>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                Target Department (Optional)
              </label>
              <input
                type="text"
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., CSE, EEE, ME"
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-cuet-primary-500 focus:border-cuet-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="batch" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                Target Batch (Optional)
              </label>
              <input
                type="text"
                id="batch"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="e.g., 20, 21"
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-cuet-primary-500 focus:border-cuet-primary-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center">
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
