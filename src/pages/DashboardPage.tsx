import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { Bell, FileUp, MessageSquarePlus, PlusCircle, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isToday, 
  addMonths, 
  subMonths, 
  parseISO, 
  isSameDay,
  addDays,
  isAfter,
  isBefore 
} from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import noticeService, { Notice } from '../services/noticeService';
import fileService from '../services/fileService';
import questionService from '../services/questionService';
import clsx from 'clsx';

// Calendar Component
interface AcademicCalendarProps {
  notices: Notice[];
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
}

const AcademicCalendar: React.FC<AcademicCalendarProps> = ({ notices, currentMonth, setCurrentMonth, selectedDate, setSelectedDate }) => {
  const expiryDates = useMemo(() => {
    const dates = new Set<string>();
    notices.forEach(notice => {
      if (notice.expiryTime) {
        dates.add(format(parseISO(notice.expiryTime), 'yyyy-MM-dd'));
      }
    });
    return dates;
  }, [notices]);

  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const firstDayOfCalendar = startOfWeek(firstDayOfMonth);
  const lastDayOfCalendar = endOfWeek(lastDayOfMonth);
  const days = eachDayOfInterval({ start: firstDayOfCalendar, end: lastDayOfCalendar });
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDayClick = (day: Date) => {
    // If a day from a different month is clicked, switch to that month
    if (!isSameMonth(day, currentMonth)) {
      setCurrentMonth(day);
    }

    // Standard selection logic: toggle if same day, otherwise select.
    if (selectedDate && isSameDay(day, selectedDate)) {
      setSelectedDate(null); // Toggle off
    } else {
      setSelectedDate(day);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Academic Calendar</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} 
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-dark-text-secondary" />
          </button>
          <span className="w-32 text-center font-medium text-gray-700 dark:text-dark-text">{format(currentMonth, 'MMMM yyyy')}</span>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} 
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-dark-text-secondary" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-2">
        {weekdays.map(day => (
          <div key={day} className="text-xs font-bold text-center text-gray-500 dark:text-dark-text-secondary uppercase pb-2">{day}</div>
        ))}
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const hasExpiry = expiryDates.has(format(day, 'yyyy-MM-dd'));
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isPastDate = day < today;

          return (
            <div key={day.toString()} className="flex justify-center items-center">
              <div className="relative w-9 h-9">
                <button
                  onClick={() => handleDayClick(day)}
                  className={clsx(
                    'w-full h-full flex items-center justify-center rounded-full transition-colors duration-200 cursor-pointer',
                    {
                      // Selection state (highest priority)
                      'bg-cuet-primary-700 text-white font-bold shadow-md': isSelected,
                      
                      // Today state (when not selected)
                      'bg-cuet-primary-100 dark:bg-cuet-primary-900/50': !isSelected && isTodayDate,
                      
                      // Hover state (when not selected)
                      'hover:bg-gray-200 dark:hover:bg-dark-border': !isSelected,
                      
                      // Text color for today (when not selected)
                      'text-cuet-primary-800 dark:text-cuet-primary-300 font-medium': !isSelected && isTodayDate,
                      
                      // Default text colors
                      'text-gray-800 dark:text-dark-text': isCurrentMonth && !isTodayDate && !isSelected,
                      'text-gray-400 dark:text-gray-500': !isCurrentMonth,
                    }
                  )}
                >
                  {format(day, 'd')}
                </button>
                {/* Notice Indicator Dot */}
                {hasExpiry && isCurrentMonth && (
                  <div className={clsx(
                    'absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full',
                    {
                      'bg-red-500': isPastDate,
                      'bg-sky-500': !isPastDate,
                    }
                  )}></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// Main Page Component
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const canCreate = user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'cr';

  // Fetch all required data
  const { data: notices = [] } = useQuery<Notice[], Error>({
    queryKey: ['notices'],
    queryFn: noticeService.getAllNotices,
  });

  const { data: files = [] } = useQuery({
    queryKey: ['files'],
    queryFn: fileService.getAllFiles,
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['questions'],
    queryFn: questionService.getAllQuestions,
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Calculate notices expiring in the next week
  const eventsNextWeek = useMemo(() => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    return notices.filter(notice => {
      if (!notice.expiryTime) return false;
      const expiryDate = parseISO(notice.expiryTime);
      return isAfter(expiryDate, today) && isBefore(expiryDate, nextWeek);
    }).length;
  }, [notices]);

  const noticesForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return notices.filter(notice => 
      notice.expiryTime && isSameDay(parseISO(notice.expiryTime), selectedDate)
    );
  }, [selectedDate, notices]);

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
          <StatCard 
            title="Events Next Week" 
            value={eventsNextWeek.toString()} 
            icon={Bell} 
            color="blue" 
          />
          <StatCard 
            title="Total Files" 
            value={files.length.toString()} 
            icon={FileUp} 
            color="green" 
          />
          <StatCard 
            title="Open Questions" 
            value={questions.length.toString()} 
            icon={MessageSquarePlus} 
            color="yellow" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Academic Calendar */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-surface rounded-xl shadow-md p-6 flex flex-col">
            <AcademicCalendar 
              notices={notices}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
            {selectedDate && (
              <div className="mt-6 border-t border-gray-200 dark:border-dark-border pt-4 flex-grow">
                <h3 className="font-semibold text-gray-700 dark:text-dark-text mb-2">
                  Events on {format(selectedDate, 'MMMM d, yyyy')}
                </h3>
                {noticesForSelectedDate.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {noticesForSelectedDate.map(notice => (
                      <Link 
                        to={`/notices/${notice.noticeId}`} 
                        key={notice.noticeId}
                        className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                      >
                        <p className="font-medium text-cuet-primary-800 dark:text-cuet-primary-400">{notice.title}</p>
                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">by {notice.createdBy.name}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 flex flex-col items-center justify-center">
                    <div className="inline-block bg-gray-100 dark:bg-dark-border p-4 rounded-full">
                      <CalendarDays className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-gray-500 dark:text-dark-text-secondary">
                      No events or tasks for this day.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {canCreate && (
                <ActionButton to="/notices/create" icon={PlusCircle} text="Create New Notice" />
              )}
              {canCreate && (
                <ActionButton to="/files" icon={FileUp} text="Upload a File" />
              )}
              {/* <ActionButton to="/notices" icon={PlusCircle} text="Add a Notice" /> */}

              <ActionButton to="/q-a" icon={MessageSquarePlus} text="Ask a Question" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: React.ElementType, color: 'blue' | 'green' | 'yellow' }) => {
  const colors: { [key in 'blue' | 'green' | 'yellow']: string } = {
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
