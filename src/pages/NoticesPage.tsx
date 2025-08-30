import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { PlusCircle, Search, FileText, User, Calendar, Clock, AlertCircle, Loader, RefreshCw, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO, isPast, formatDistanceToNowStrict } from 'date-fns';
import CreateNoticeModal from '../components/modals/CreateNoticeModal';
import noticeService, { Notice, NoticeCreateRequest } from '../services/noticeService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

const NoticesPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [showExpired, setShowExpired] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const canCreate = user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'cr';

  const { data: notices = [], isLoading, isError, error } = useQuery<Notice[], Error>({
    queryKey: ['notices'],
    queryFn: noticeService.getAllNotices,
  });

  const createNoticeMutation = useMutation({
    mutationFn: (newNotice: NoticeCreateRequest) => noticeService.createNotice(newNotice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });

  const deleteNoticeMutation = useMutation({
    mutationFn: (noticeId: number) => noticeService.deleteNotice(noticeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });

  const handleCreateNotice = async (newNotice: NoticeCreateRequest) => {
    try {
      await createNoticeMutation.mutateAsync(newNotice);
    } catch (err) {
      console.error('Error creating notice:', err);
      alert('Failed to create notice. Please try again.');
    }
  };

  const sortedAndFilteredNotices = useMemo(() => {
    const filtered = notices.filter(notice => {
      const titleMatch = notice.title.toLowerCase().includes(searchTerm.toLowerCase());
      const authorMatch = notice.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase());
      return titleMatch || authorMatch;
    });

    const now = new Date();
    const activeNotices = filtered.filter(n => !n.expiryTime || !isPast(parseISO(n.expiryTime)));
    const expiredNotices = filtered.filter(n => n.expiryTime && isPast(parseISO(n.expiryTime)));

    // Sort active notices: with expiry first (soonest to expire), then no expiry (newest first)
    activeNotices.sort((a, b) => {
      if (a.expiryTime && b.expiryTime) {
        return parseISO(a.expiryTime).getTime() - parseISO(b.expiryTime).getTime();
      }
      if (a.expiryTime) return -1;
      if (b.expiryTime) return 1;
      return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
    });

    // Sort expired notices: most recently expired first
    expiredNotices.sort((a, b) => parseISO(b.expiryTime!).getTime() - parseISO(a.expiryTime!).getTime());

    return showExpired ? [...activeNotices, ...expiredNotices] : activeNotices;
  }, [searchTerm, notices, showExpired]);

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
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-cuet-primary-900 text-white font-semibold rounded-lg shadow-md hover:bg-cuet-primary-800 transition-colors duration-200"
            >
              <PlusCircle size={20} />
              Create Notice
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface focus:ring-2 focus:ring-cuet-primary-500 focus:outline-none"
            />
          </div>
          <button 
            onClick={() => setShowExpired(!showExpired)}
            className={`flex items-center justify-center gap-2 px-4 py-2 font-medium rounded-lg border transition-colors w-full md:w-auto ${
              showExpired 
                ? 'bg-cuet-primary-100 dark:bg-cuet-primary-900/40 border-cuet-primary-500 text-cuet-primary-800 dark:text-cuet-primary-300' 
                : 'bg-white dark:bg-dark-surface border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border'
            }`}
          >
            {showExpired ? 'Hide Expired' : 'Show Expired'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <div className="text-center py-12 col-span-full"><Loader size={48} className="mx-auto text-gray-400 animate-spin" /></div>
          ) : isError ? (
            <div className="text-center py-12 col-span-full bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
              <AlertCircle size={48} className="mx-auto text-red-500" />
              <h3 className="mt-4 text-xl font-semibold text-red-800 dark:text-red-300">Failed to load notices</h3>
              <p className="mt-1 text-red-600 dark:text-red-400">{error.message}</p>
              <button onClick={() => queryClient.refetchQueries({ queryKey: ['notices'] })} className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                <RefreshCw size={16} /> Try Again
              </button>
            </div>
          ) : sortedAndFilteredNotices.length > 0 ? (
            sortedAndFilteredNotices.map(notice => (
              <NoticeCard key={notice.noticeId} notice={notice} />
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
  const expiryDate = notice.expiryTime ? parseISO(notice.expiryTime) : null;
  const hasExpired = expiryDate ? isPast(expiryDate) : false;

  const getTimeStatus = () => {
    if (!expiryDate) {
      return { text: 'No Expiry', color: 'text-gray-500 dark:text-gray-400' };
    }
    if (hasExpired) {
      return { text: `Expired ${formatDistanceToNowStrict(expiryDate)} ago`, color: 'text-red-600 dark:text-red-500' };
    }
    return { text: `Expires in ${formatDistanceToNowStrict(expiryDate)}`, color: 'text-green-600 dark:text-green-500' };
  };

  const timeStatus = getTimeStatus();

  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const deleteNoticeMutation = useMutation({
    mutationFn: (id: number) => noticeService.deleteNotice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await deleteNoticeMutation.mutateAsync(notice.noticeId);
      } catch (err) {
        console.error('Failed to delete notice:', err);
        alert('Failed to delete notice. Please try again.');
      }
    }
  };

  const canDelete = user?.role === 'admin' || user?.userId === notice.createdBy.userId;

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 dark:border-dark-border group">
      <Link to={`/notices/${notice.noticeId}`} className="block">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-xl font-bold text-cuet-primary-900 dark:text-cuet-primary-300 mb-2 group-hover:underline">{notice.title}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-dark-text-secondary mb-4">
              <div className="flex items-center gap-1.5"><User size={14} /><span>{notice.createdBy.name}</span></div>
              <div className="flex items-center gap-1.5"><Calendar size={14} /><span>{format(parseISO(notice.createdAt), 'MMM d, yyyy')}</span></div>
            </div>
          </div>
          <div className={`flex items-center gap-2 text-sm font-medium shrink-0 ${timeStatus.color}`}>
            <Clock size={14} />
            <span>{timeStatus.text}</span>
          </div>
        </div>
        <p className="text-gray-700 dark:text-dark-text leading-relaxed line-clamp-2">{notice.content}</p>
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm font-semibold text-cuet-primary-800 dark:text-cuet-primary-400 group-hover:underline">
            Read More &rarr;
          </div>
          {canDelete && (
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-4"
              title="Delete notice"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </Link>
    </div>
  );
};

export default NoticesPage;
