import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FileUp, Search, Filter, File, HardDrive, Download, Loader, Trash2, Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import UploadFileModal from '../components/modals/UploadFileModal';
import FilePreviewModal from '../components/modals/FilePreviewModal';
import fileService, { FileData, UploadMetadata } from '../services/fileService';
import { useAuth } from '../contexts/AuthContext';

const FilesPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState<FileData[]>([]);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<FileData | null>(null);
  
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fileService.getAllFiles();
        setFiles(data);
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Failed to load files. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFiles();
  }, []);

  const handleUpload = async (file: File, metadata: UploadMetadata): Promise<boolean> => {
    try {
      await fileService.uploadFile(file, metadata);
      const data = await fileService.getAllFiles();
      setFiles(data);
      setUploadModalOpen(false);
      return true;
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload file. Please try again.');
      return false;
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await fileService.deleteFile(fileId);
      const data = await fileService.getAllFiles();
      setFiles(data);
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Failed to delete file. Please try again.');
    }
  };

  const handlePreview = (file: FileData) => {
    setSelectedFileForPreview(file);
  };

  const filteredFiles = useMemo(() => {
    return files.filter(file => 
      (file.fileName && file.fileName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (file.uploadedBy?.name && file.uploadedBy.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (file.topic && file.topic.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, files]);

  const canUpload = isAuthenticated && user && ['admin', 'teacher', 'cr'].includes(user.role);

  return (
    <>
      <Helmet>
        <title>Files | ghoorni</title>
      </Helmet>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">File Repository</h1>
            <p className="mt-1 text-gray-600 dark:text-dark-text-secondary">
              Access course materials, notes, and other shared documents.
            </p>
          </div>
          {canUpload && (
            <button 
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-cuet-primary-900 text-white font-semibold rounded-lg shadow-md hover:bg-cuet-primary-800 transition-colors duration-200"
            >
              <FileUp size={20} />
              Upload File
            </button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search files by name, topic, or uploader..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface focus:ring-2 focus:ring-cuet-primary-500 focus:outline-none"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
            <Filter size={18} />
            Filters
          </button>
        </div>

        {/* Files Table */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm overflow-x-auto border border-gray-200 dark:border-dark-border">
          {loading ? (
            <div className="text-center py-12">
              <Loader size={48} className="mx-auto text-gray-400 animate-spin" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">Loading Files</h3>
              <p className="mt-1 text-gray-500 dark:text-dark-text-secondary">
                Please wait while we fetch your files...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-center">
                <h3 className="text-xl font-semibold">Error</h3>
                <p className="mt-2">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-cuet-primary-900 text-white rounded-lg hover:bg-cuet-primary-800"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredFiles.length > 0 ? (
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-gray-50 dark:bg-dark-border/50">
                <tr>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-dark-text-secondary">File Name</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-dark-text-secondary hidden md:table-cell">Uploader</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-dark-text-secondary hidden lg:table-cell">Date</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-dark-text-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {filteredFiles.map(file => (
                  <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors">
                    <td className="p-4 font-medium text-gray-800 dark:text-dark-text">
                      <div className="flex items-center gap-3">
                        <FileIcon type={file.fileType} />
                        <div className="flex flex-col">
                          <span>{file.fileName || 'Unknown file'}</span>
                          {file.topic && <span className="text-xs text-gray-500 dark:text-dark-text-secondary">Topic: {file.topic}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-dark-text-secondary hidden md:table-cell">
                      {file.uploadedBy?.name || 'Unknown'}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-dark-text-secondary hidden lg:table-cell">
                      {file.uploadedAt ? format(parseISO(file.uploadedAt), 'MMM d, yyyy') : 'Unknown date'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handlePreview(file)}
                          className="flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          title="Preview file"
                        >
                          <Eye size={16} />
                        </button>
                        <a 
                          href={fileService.getDownloadLink(file.id)}
                          download={file.fileName || `file-${file.id}`}
                          className="flex items-center justify-center p-2 bg-cuet-primary-100 dark:bg-cuet-primary-900/50 text-cuet-primary-800 dark:text-cuet-primary-300 rounded-md hover:bg-cuet-primary-200 dark:hover:bg-cuet-primary-900/80 transition-colors"
                          title="Download file"
                        >
                          <Download size={16} />
                        </a>
                        {(user?.role === 'admin' || user?.userId === file.uploadedBy?.userId) && (
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="flex items-center justify-center p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Delete file"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <HardDrive size={48} className="mx-auto text-gray-400" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">No Files Found</h3>
              <p className="mt-1 text-gray-500 dark:text-dark-text-secondary">
                {searchTerm ? `Your search for "${searchTerm}" did not return any results.` : 'There are no files to display.'}
              </p>
            </div>
          )}
        </div>
      </div>
      <UploadFileModal 
        isOpen={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onFileUpload={handleUpload}
        user={user}
      />
      <FilePreviewModal 
        isOpen={!!selectedFileForPreview}
        onClose={() => setSelectedFileForPreview(null)}
        file={selectedFileForPreview}
      />
    </>
  );
};

const FileIcon = ({ type }: { type: string | undefined }) => {
  const colors: { [key: string]: string } = {
    pdf: 'text-red-500',
    docx: 'text-blue-500',
    doc: 'text-blue-500',
    xlsx: 'text-green-500',
    xls: 'text-green-500',
    pptx: 'text-orange-500',
    ppt: 'text-orange-500',
    zip: 'text-yellow-500',
    rar: 'text-yellow-500',
    jpg: 'text-purple-500',
    jpeg: 'text-purple-500',
    png: 'text-purple-500',
    txt: 'text-gray-500',
    default: 'text-gray-500',
  };
  
  const fileExtension = type ? (type.split('/').pop()?.toLowerCase() || 'default') : 'default';
  return <File size={24} className={colors[fileExtension] || colors.default} />;
};

export default FilesPage;
