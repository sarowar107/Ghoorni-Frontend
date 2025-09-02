import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { UploadCloud, ChevronDown } from 'lucide-react';
import { User } from '../../contexts/AuthContext';
import { UploadMetadata } from '../../services/fileService';

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (file: File, metadata: UploadMetadata) => Promise<boolean>;
  user: User | null;
}

const DEPARTMENTS = ['CSE', 'EEE', 'ME', 'CE', 'Arch', 'URP', 'MIE', 'PME', 'ETE', 'BME', 'ALL'];
const BATCHES = ['19', '20', '21', '22', '23', '24', '1'];

const UploadFileModal: React.FC<UploadFileModalProps> = ({ isOpen, onClose, onFileUpload, user }) => {
  const [file, setFile] = useState<File | null>(null);
  const [topic, setTopic] = useState('');
  const [toDept, setToDept] = useState('');
  const [toBatch, setToBatch] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Reset form state when modal opens or user changes
    if (isOpen) {
      setFile(null);
      setTopic('');
      setToDept('');
      setToBatch('');
      setIsPublic(true);
      setErrorMsg(null);
      setIsUploading(false);
    }
  }, [isOpen, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const validateForm = (): boolean => {
    if (!file) {
      setErrorMsg('Please select a file to upload.');
      return false;
    }
    if (!topic.trim()) {
      setErrorMsg('Please provide a topic or content description.');
      return false;
    }
    if (user?.role === 'teacher' && !toBatch) {
      setErrorMsg('Please select a batch.');
      return false;
    }
    if (user?.role === 'admin') {
      if (!toDept) {
        setErrorMsg('Please select a target department.');
        return false;
      }
      if (!toBatch) {
        setErrorMsg('Please select a target batch.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    if (!validateForm() || !file || !user) return;
    
    // Set default values based on user role
    let effectiveToDept = toDept;
    let effectiveToBatch = toBatch;

    if (user.role === 'admin') {
      effectiveToDept = toDept || 'ALL';
      effectiveToBatch = toBatch || '1';
    } else if (user.role === 'teacher') {
      effectiveToDept = user.deptName || '';
      effectiveToBatch = toBatch;
    } else if (user.role === 'cr') {
      effectiveToDept = user.deptName || '';
      effectiveToBatch = user.batch || '';
    }

    const metadata: UploadMetadata = { 
      topic,
      toDept: effectiveToDept,
      toBatch: effectiveToBatch,
      isPublic: user.role === 'admin' ? isPublic : false
    };
    
    try {
      setIsUploading(true);
      const success = await onFileUpload(file, metadata);
      
      if (success) {
        onClose();
      } else {
        setErrorMsg('Failed to upload file. Please try again.');
      }
    } catch (err) {
      console.error('Error in file upload:', err);
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    if (!user) return null;

    return (
      <>
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
            Topic / Content
          </label>
          <textarea
            id="topic"
            rows={3}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-cuet-primary-500 focus:border-cuet-primary-500 sm:text-sm bg-transparent"
            placeholder="e.g., Midterm Lecture Slides, Assignment 1"
          />
        </div>

        {(user.role === 'admin' || user.role === 'teacher') && (
          <div>
            <label htmlFor="batch" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
              Batch
            </label>
            <div className="relative mt-1">
              <select
                id="toBatch"
                value={toBatch}
                onChange={(e) => setToBatch(e.target.value)}
                className="appearance-none w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-cuet-primary-500 focus:border-cuet-primary-500 sm:text-sm bg-transparent"
              >
                <option value="" disabled>Select a batch</option>
                {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {user.role === 'cr' && user.batch && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
              Batch
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-dark-text bg-gray-100 dark:bg-dark-border/50 px-3 py-2 rounded-md">{user.batch} (auto-selected)</p>
          </div>
        )}

        {user.role === 'admin' && (
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="isPublic"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="focus:ring-cuet-primary-500 h-4 w-4 text-cuet-primary-800 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="isPublic" className="font-medium text-gray-700 dark:text-dark-text-secondary">
                Make file public
              </label>
              <p className="text-gray-500 dark:text-dark-text-secondary/80">
                If unchecked, the file will only be visible to the selected batch.
              </p>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload New File">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
            File
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-dark-border border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600 dark:text-dark-text-secondary">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white dark:bg-dark-surface rounded-md font-medium text-cuet-primary-800 hover:text-cuet-primary-600 focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-dark-text-secondary/80">
                {file ? file.name : 'PNG, JPG, PDF up to 10MB'}
              </p>
            </div>
          </div>
        </div>
        
        {renderRoleSpecificFields()}

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-md text-red-600 dark:text-red-400 text-sm">
            {errorMsg}
          </div>
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
            disabled={isUploading || !file}
            className="px-4 py-2 text-sm font-medium text-white bg-cuet-primary-900 rounded-lg hover:bg-cuet-primary-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : 'Upload File'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadFileModal;
