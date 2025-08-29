import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import noticeService from '../services/noticeService';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, User, Calendar, Tag, Clock, AlertCircle, Loader, Building, Users } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';

const NoticePage: React.FC = () => {
  const { noticeId } = useParams<{ noticeId: string }>();

  const { data: notice, isLoading, isError, error } = useQuery({
    queryKey: ['notice', noticeId],
    queryFn: () => noticeService.getNoticeById(parseInt(noticeId!, 10)),
    enabled: !!noticeId,
  });

  if (isLoading) {
    return <div className="flex flex-col justify-center items-center h-screen text-center"><Loader size={48} className="animate-spin mb-4" />Loading notice...</div>;
  }

  if (isError || !notice) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error</h2>
        <p className="text-gray-600 dark:text-dark-text-secondary">
          {error ? (error as Error).message : 'The notice could not be found.'}
        </p>
        <Link to="/notices" className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-cuet-primary-900 text-white rounded-lg hover:bg-cuet-primary-800">
          <ArrowLeft size={16} /> Back to Notices
        </Link>
      </div>
    );
  }

  const expiryDate = notice.expiryTime ? parseISO(notice.expiryTime) : null;
  const hasExpired = expiryDate ? isPast(expiryDate) : false;

  return (
    <>
      <Helmet>
        <title>{notice.title} | ghoorni</title>
      </Helmet>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
        <Link 
          to="/notices" 
          className="inline-flex items-center gap-2 text-cuet-primary-900 dark:text-cuet-primary-500 hover:underline mb-6"
        >
          <ArrowLeft size={20} />
          Back to all notices
        </Link>

        <article className="bg-white dark:bg-dark-surface rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{notice.title}</h1>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-600 dark:text-dark-text-secondary mb-6 border-b dark:border-dark-border pb-6">
              <div className="flex items-center gap-2" title="Author"><User size={16} /><span>{notice.createdBy.name} ({notice.createdBy.role})</span></div>
              <div className="flex items-center gap-2" title="Published Date"><Calendar size={16} /><span>{format(parseISO(notice.createdAt), 'PPP')}</span></div>
              {notice.isPublic && <div className="flex items-center gap-2 text-green-600 dark:text-green-400" title="Visibility"><Tag size={16} /><span>Public</span></div>}
              {notice.department && <div className="flex items-center gap-2" title="Target Department"><Building size={16} /><span>{notice.department}</span></div>}
              {notice.batch && <div className="flex items-center gap-2" title="Target Batch"><Users size={16} /><span>Batch '{notice.batch}</span></div>}
            </div>

            <div 
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />

            {expiryDate && (
              <div className={`mt-8 pt-6 border-t border-gray-200 dark:border-dark-border flex items-center gap-3 ${hasExpired ? 'text-red-600 dark:text-red-500' : 'text-gray-600 dark:text-dark-text-secondary'}`}>
                <Clock size={20} />
                <p className="text-sm font-medium">
                  {hasExpired ? 'This notice expired on:' : 'This notice will expire on:'} {format(expiryDate, 'PPP p')}
                </p>
              </div>
            )}
          </div>
        </article>
      </div>
    </>
  );
};

export default NoticePage;
