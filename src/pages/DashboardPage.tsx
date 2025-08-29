import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Bell, FileUp, MessageSquarePlus, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

// Mock Data
const recentNotices = [
  { id: 1, title: 'Mid-term Examination Schedule for L-1/T-2', author: 'Dr. John Doe', date: new Date('2025-09-15T10:00:00Z') },
  { id: 2, title: 'Campus Placement Drive by TechCorp', author: 'Placement Cell', date: new Date('2025-09-14T14:30:00Z') },
  { id: 3, title: 'Holiday Notice for University Foundation Day', author: 'Registrar Office', date: new Date('2025-09-12T09:00:00Z') },
];

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const canCreate = user?.role === 'ADMIN' || user?.role === 'TEACHER' || user?.role === 'CR';

  return (
    <>
      <Helmet>
        <title>Dashboard | ghoorni</title>
      </Helmet>
      <div className="animate-fade-in space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-dark-text-secondary">
            Here's your overview for today. Stay updated and connected.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="New Notices Today" value="5" icon={Bell} color="blue" />
          <StatCard title="Unread Files" value="12" icon={FileUp} color="green" />
          <StatCard title="Open Questions" value="3" icon={MessageSquarePlus} color="yellow" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Notices */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-surface rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Notices</h2>
              <Link to="/notices" className="flex items-center text-sm font-medium text-cuet-primary-800 dark:text-cuet-primary-400 hover:underline">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentNotices.map(notice => (
                <div key={notice.id} className="p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors duration-200">
                  <p className="font-semibold text-gray-800 dark:text-dark-text">{notice.title}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
                    <span>by {notice.author}</span>
                    <span>{format(notice.date, 'MMM d, yyyy')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {canCreate && (
                <ActionButton to="/notices" icon={PlusCircle} text="Create New Notice" />
              )}
              <ActionButton to="/files" icon={FileUp} text="Upload a File" />
              <ActionButton to="/q-a" icon={MessageSquarePlus} text="Ask a Question" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: React.ElementType, color: string }) => {
  const colors = {
    blue: 'from-blue-500 to-cuet-primary-700',
    green: 'from-emerald-500 to-green-700',
    yellow: 'from-amber-500 to-orange-700',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white p-6 rounded-xl shadow-lg`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-4xl font-bold">{value}</p>
        </div>
        <Icon className="h-8 w-8 opacity-70" />
      </div>
    </div>
  );
};

const ActionButton = ({ to, icon: Icon, text }: { to: string, icon: React.ElementType, text: string }) => (
  <Link to={to} className="w-full flex items-center p-3 bg-gray-100 dark:bg-dark-border rounded-lg hover:bg-cuet-primary-100 dark:hover:bg-cuet-primary-900/50 transition-colors duration-200">
    <Icon className="h-5 w-5 mr-3 text-cuet-primary-800 dark:text-cuet-primary-400" />
    <span className="font-medium text-gray-700 dark:text-dark-text">{text}</span>
  </Link>
);

export default DashboardPage;
