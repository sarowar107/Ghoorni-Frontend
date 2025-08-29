import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { MessageSquarePlus, Search, MessageSquare, Loader } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import questionService, { Question } from '../services/questionService';



const QAPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await questionService.getAllQuestions();
        setQuestions(data);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q =>
      q.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, questions]);

  return (
    <>
      <Helmet>
        <title>Q & A | ghoorni</title>
      </Helmet>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Q & A Forum</h1>
            <p className="mt-1 text-gray-600 dark:text-dark-text-secondary">
              Ask questions, share knowledge, and learn from the community.
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-cuet-primary-900 text-white font-semibold rounded-lg shadow-md hover:bg-cuet-primary-800 transition-colors duration-200">
            <MessageSquarePlus size={20} />
            Ask a Question
          </button>
        </div>

        {/* Search and Tabs */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions by title or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface focus:ring-2 focus:ring-cuet-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-lg">
              <Loader size={48} className="mx-auto text-gray-400 animate-spin" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">Loading Questions</h3>
              <p className="mt-1 text-gray-500 dark:text-dark-text-secondary">Please wait...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-lg">
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
          ) : filteredQuestions.length > 0 ? (
            filteredQuestions.map(q => <QuestionCard key={q.id} question={q} />)
          ) : (
            <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-lg">
              <MessageSquare size={48} className="mx-auto text-gray-400" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">No Questions Found</h3>
              <p className="mt-1 text-gray-500 dark:text-dark-text-secondary">
                {searchTerm ? `Your search for "${searchTerm}" did not return any results.` : 'Be the first to ask a question!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const QuestionCard = ({ question }: { question: Question }) => (
  <Link to={`/q-a/${question.id}`} className="block">
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5 border border-gray-200 dark:border-dark-border">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex sm:flex-col items-center sm:justify-center gap-2 sm:gap-0 text-center p-2 rounded-lg bg-gray-50 dark:bg-dark-border w-full sm:w-24">
          <span className="font-bold text-xl text-cuet-primary-900 dark:text-cuet-primary-300">0</span>
          <span className="text-sm text-gray-600 dark:text-dark-text-secondary">votes</span>
          <div className="border-t border-gray-200 dark:border-dark-text-secondary/50 my-1 w-full"></div>
          <span className="font-bold text-xl text-cuet-primary-900 dark:text-cuet-primary-300">
            {question.answers ? question.answers.length : 0}
          </span>
          <span className="text-sm text-gray-600 dark:text-dark-text-secondary">answers</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-cuet-primary-800 dark:group-hover:text-cuet-primary-400 transition-colors">
            {question.title}
          </h2>
          <div className="flex items-center justify-end gap-2 text-xs text-gray-500 dark:text-dark-text-secondary mt-3 pt-3 border-t border-gray-100 dark:border-dark-border">
            <span>asked by <strong>{question.askedBy?.name || 'Unknown'}</strong> on {format(parseISO(question.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>
    </div>
  </Link>
);

export default QAPage;
