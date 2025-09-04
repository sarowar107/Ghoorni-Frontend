import React, { useRef } from 'react';
import { Maximize, X } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FileData } from '../../services/fileService';
import fileService from '../../services/fileService';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileData | null;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, onClose, file }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  if (!file) return null;

  // Use Google Drive view link if available, otherwise fallback to download link
  const fileUrl = file.driveViewLink || fileService.getDownloadLink(file.id);

  const isImage = file.fileType.startsWith('image/');
  const isPlainText = file.fileType.startsWith('text/');
  const hasGoogleDriveLink = !!file.driveViewLink;

  // If we have a Google Drive view link, use it directly for embedding
  // Otherwise, use the Google Docs viewer for non-directly embeddable files
  const canBeEmbeddedDirectly = isImage || isPlainText || hasGoogleDriveLink;
  const previewUrl = hasGoogleDriveLink 
    ? fileUrl.replace('/view', '/preview') // Convert view link to preview link for embedding
    : canBeEmbeddedDirectly 
      ? fileUrl 
      : `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;

  const handleFullScreen = () => {
    if (!previewRef.current) return;

    if (!document.fullscreenElement) {
      previewRef.current.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl h-[85vh] flex flex-col transform overflow-hidden rounded-2xl bg-white dark:bg-dark-surface text-left align-middle shadow-xl transition-all">
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border flex-shrink-0">
                  <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {file.fileName}
                  </Dialog.Title>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFullScreen}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                      title="Toggle Fullscreen"
                    >
                      <Maximize size={20} />
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                      title="Close"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </header>
                <div ref={previewRef} className="flex-grow bg-gray-100 dark:bg-black">
                  <iframe
                    src={previewUrl}
                    title={file.fileName}
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default FilePreviewModal;
