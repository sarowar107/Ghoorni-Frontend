import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import noticeService from '../services/noticeService';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, User, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';

const NoticePage: React.FC = () => {
  const { noticeId } = useParams<{ noticeId: string }>();

  const { data: notice, isLoading, error } = useQuery({
    queryKey: ['notice', noticeId],
    queryFn: () => noticeService.getNoticeById(noticeId!),
    enabled: !!noticeId,
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error || !notice) {
    return <div className="flex justify-center items-center h-screen">Error loading notice or notice not found.</div>;
  }

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
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-dark-text-secondary mb-6">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{notice.createdBy.name} ({notice.createdBy.role})</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{format(new Date(notice.createdAt), 'PPP')}</span>
              </div>
              {notice.isPublic && (
                <div className="flex items-center gap-2">
                  <Tag size={16} />
                  <span>Public</span>
                </div>
              )}
            </div>

            <div 
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />

            {notice.expiryTime && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-border">
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                  This notice will expire on: {format(new Date(notice.expiryTime), 'PPP p')}
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
