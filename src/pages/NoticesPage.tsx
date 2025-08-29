import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { PlusCircle, Search, Filter, FileText, User, Calendar, Tag, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import CreateNoticeModal from '../components/modals/CreateNoticeModal';
import noticeService, { Notice } from '../services/noticeService';



const NoticesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [notices, setNotices] = useState<Notice[]>([]); 
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const canCreate = user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'cr';
  
  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await noticeService.getAllNotices();
      setNotices(data);
    } catch (err) {
      console.error('Error fetching notices:', err);
      setError('Failed to load notices. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateNotice = async (newNotice: { title: string; content: string }) => {
    try {
      await noticeService.createNotice(newNotice);
      // Refresh notices from server instead of just adding locally
      fetchNotices();
    } catch (err) {
      console.error('Error creating notice:', err);
      alert('Failed to create notice. Please try again.');
    }
  };

  const filteredNotices = useMemo(() => {
    return notices.filter(notice => {
      // Safely check if properties exist before using toLowerCase
      const titleMatch = notice?.title ? notice.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      const authorMatch = notice?.createdBy?.name ? notice.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      return titleMatch || authorMatch;
    });
  }, [searchTerm, notices]);

  return (
    <>
      <Helmet>
        <title>Notices | ghoorni</title>
      </Helmet>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Notice Board</h1>
            <p className="mt-1 text-gray-600 dark:text-dark-text-secondary">
              Find all official announcements and updates here.
            </p>
          </div>
          {canCreate && (
            <button 
              onClick={() => setCreateModalOpen(true)} // Open modal
              className="flex items-center justify-center gap-2 px-4 py-2 bg-cuet-primary-900 text-white font-semibold rounded-lg shadow-md hover:bg-cuet-primary-800 transition-colors duration-200"
            >
              <PlusCircle size={20} />
              Create Notice
            </button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notices by title, author, or department..."
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

        {/* Notices Grid */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="text-center py-12 col-span-full bg-white dark:bg-dark-surface rounded-lg">
              <Loader size={48} className="mx-auto text-gray-400 animate-spin" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">Loading Notices</h3>
              <p className="mt-1 text-gray-500 dark:text-dark-text-secondary">
                Please wait while we fetch the latest notices...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12 col-span-full bg-white dark:bg-dark-surface rounded-lg">
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
          ) : filteredNotices.length > 0 ? (
            filteredNotices.map(notice => (
              <NoticeCard key={notice.id || notice.noticeId} notice={notice} />
            ))
          ) : (
            <div className="text-center py-12 col-span-full bg-white dark:bg-dark-surface rounded-lg">
              <FileText size={48} className="mx-auto text-gray-400" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">No Notices Found</h3>
              <p className="mt-1 text-gray-500 dark:text-dark-text-secondary">
                {searchTerm ? `Your search for "${searchTerm}" did not return any results.` : 'There are no notices to display.'}
              </p>
            </div>
          )}
        </div>
      </div>
      <CreateNoticeModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setCreateModalOpen(false)}
        onNoticeCreate={handleCreateNotice}
      />
    </>
  );
};

const NoticeCard = ({ notice }: { notice: Notice }) => {
  // Log notice data for debugging
  console.log('Rendering notice:', notice);
  
  return (
  <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 dark:border-dark-border">
    <h2 className="text-xl font-bold text-cuet-primary-900 dark:text-cuet-primary-300 mb-2">{notice.title || 'Untitled'}</h2>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-dark-text-secondary mb-4">
      {notice.createdBy?.name ? (
        <div className="flex items-center gap-1.5">
          <User size={14} />
          <span>{notice.createdBy.name}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <User size={14} />
          <span>Unknown Author</span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <Calendar size={14} />
        <span>
          {notice.createdAt ? (
            // Try to handle different date formats
            (() => {
              try {
                return format(parseISO(notice.createdAt), 'MMMM d, yyyy');
              } catch (e) {
                console.error('Error parsing date:', notice.createdAt);
                return 'Date unavailable';
              }
            })()
          ) : 'Recent'}
        </span>
      </div>
    </div>
    <p className="text-gray-700 dark:text-dark-text leading-relaxed line-clamp-2">
      {notice.content || 'No content'}
    </p>
    <button className="mt-4 text-sm font-semibold text-cuet-primary-800 dark:text-cuet-primary-400 hover:underline">
      Read More
    </button>
  </div>
  );
};

export default NoticesPage;
