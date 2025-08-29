import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { format, parseISO } from 'date-fns';
import { ChevronUp, ChevronDown, MessageSquare, User, Calendar, ArrowLeft, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import questionService, { Question, AnswerCreateRequest } from '../services/questionService';



const QuestionDetailPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [newAnswer, setNewAnswer] = useState('');
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      if (!questionId) {
        navigate('/q-a');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await questionService.getQuestionById(questionId);
        setQuestion(data);
      } catch (err) {
        console.error('Error fetching question details:', err);
        setError('Failed to load question details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestionDetails();
  }, [questionId, navigate]);

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('You must be logged in to submit an answer.');
      return;
    }
    
    if (newAnswer.trim() === '') {
      alert('Please enter your answer before submitting.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const answerData: AnswerCreateRequest = {
        content: newAnswer,
        questionId: questionId || ''
      };
      
      await questionService.addAnswer(answerData);
      
      // Refresh question data to include the new answer
      if (questionId) {
        const updatedQuestion = await questionService.getQuestionById(questionId);
        setQuestion(updatedQuestion);
      }
      
      setNewAnswer('');
    } catch (err) {
      console.error('Error submitting answer:', err);
      alert('Failed to submit your answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader size={48} className="text-cuet-primary-900 animate-spin mb-4" />
        <h3 className="text-xl font-semibold">Loading question...</h3>
      </div>
    );
  }
  
  if (error || !question) {
    return (
      <div className="text-center py-10 bg-white dark:bg-dark-surface rounded-xl p-6">
        <h2 className="text-xl font-semibold text-red-600 mb-2">{error || 'Question not found'}</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-300">Unable to load the requested question.</p>
        <button 
          onClick={() => navigate('/q-a')}
          className="px-4 py-2 bg-cuet-primary-900 text-white rounded-lg hover:bg-cuet-primary-800"
        >
          Back to Questions
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{question.title} | ghoorni</title>
      </Helmet>
      <div className="animate-fade-in space-y-6">
        <Link to="/q-a" className="flex items-center gap-2 text-sm font-semibold text-cuet-primary-800 dark:text-cuet-primary-400 hover:underline">
            <ArrowLeft size={16} />
            Back to all questions
        </Link>

        {/* Question */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
            <div className="flex gap-4">
                <div className="flex flex-col items-center w-12">
                    <button><ChevronUp size={24} className="text-gray-400 hover:text-green-500" /></button>
                    <span className="text-xl font-bold text-gray-800 dark:text-white">0</span>
                    <button><ChevronDown size={24} className="text-gray-400 hover:text-red-500" /></button>
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{question.title}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-dark-text-secondary mt-2 mb-4">
                        {question.askedBy && (
                          <div className="flex items-center gap-1.5">
                              <User size={14} />
                              <span>{question.askedBy.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span>Asked on {format(parseISO(question.createdAt), 'MMMM d, yyyy')}</span>
                        </div>
                    </div>
                    <p className="text-gray-700 dark:text-dark-text leading-relaxed">{question.content}</p>
                </div>
            </div>
        </div>

        {/* Answers */}
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {question.answers?.length || 0} Answers
            </h2>
            {question.answers && question.answers.length > 0 ? (
              question.answers.map(answer => (
                <div key={answer.id} className="bg-white dark:bg-dark-surface rounded-xl p-5 border border-gray-200 dark:border-dark-border flex gap-4">
                    <div className="flex flex-col items-center w-12">
                        <button><ChevronUp size={24} className="text-gray-400 hover:text-green-500" /></button>
                        <span className="text-lg font-bold text-gray-800 dark:text-white">0</span>
                        <button><ChevronDown size={24} className="text-gray-400 hover:text-red-500" /></button>
                    </div>
                    <div className="flex-1">
                        <p className="text-gray-700 dark:text-dark-text leading-relaxed">{answer.content}</p>
                        <div className="flex items-center justify-end gap-4 text-xs text-gray-500 dark:text-dark-text-secondary mt-3 pt-3 border-t border-gray-100 dark:border-dark-border">
                            {answer.answeredBy && (
                              <span>Answered by <strong>{answer.answeredBy.name}</strong></span>
                            )}
                            <span>on {format(parseISO(answer.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                    </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-dark-surface rounded-xl p-5 text-center border border-gray-200 dark:border-dark-border">
                <p className="text-gray-600 dark:text-dark-text-secondary">
                  No answers yet. Be the first to answer this question!
                </p>
              </div>
            )}
        </div>

        {/* Your Answer Form */}
        <div className="bg-white dark:bg-dark-surface rounded-xl p-6 border border-gray-200 dark:border-dark-border">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Your Answer</h2>
            <form onSubmit={handleAnswerSubmit}>
                <textarea
                    rows={6}
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="Share your knowledge and help the community..."
                    className="w-full p-3 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-border/50 focus:ring-2 focus:ring-cuet-primary-500 focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={submitting || !user}
                    className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-cuet-primary-900 text-white font-semibold rounded-lg shadow-md hover:bg-cuet-primary-800 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Posting...
                      </>
                    ) : (
                      <>
                        <MessageSquare size={18} />
                        Post Your Answer
                      </>
                    )}
                </button>
                {!user && (
                  <p className="mt-2 text-sm text-red-600">
                    You must be <Link to="/login" className="underline">logged in</Link> to answer questions.
                  </p>
                )}
            </form>
        </div>
      </div>
    </>
  );
};

export default QuestionDetailPage;

