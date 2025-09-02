import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Send, UserCircle, Loader, AlertTriangle, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import questionService, { Question, Answer } from '../services/questionService';
import { useAuth } from '../contexts/AuthContext';

interface AnswerCardProps {
  answer: Answer;
  onDelete: (answerId: number) => void;
}

const QuestionDetailPage: React.FC = () => {
  const { questionId = '' } = useParams<{ questionId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchQuestionDetails = useCallback(async () => {
    if (!questionId) return;
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
  }, [questionId]);

  useEffect(() => {
    fetchQuestionDetails();
  }, [fetchQuestionDetails]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !questionId || !newAnswer.trim()) return;

    try {
      setIsSubmitting(true);
      const answerData = {
        questionId: questionId,
        content: newAnswer.trim()
      };
      await questionService.submitAnswer(answerData);
      setNewAnswer('');
      // Refresh question to get the new answer
      await fetchQuestionDetails();
    } catch (err: any) {
      console.error('Error submitting answer:', err);
      
      // Check if it's an email verification error
      if (err?.response?.status === 403 && err?.response?.data?.includes('Email verification required')) {
        alert('Email verification required to answer questions. Please verify your email first.');
      } else {
        alert('Failed to submit answer. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!question || !window.confirm('Are you sure you want to delete this question?')) return;

    try {
      setIsDeleting(true);
      await questionService.deleteQuestion(parseInt(question.questionId));
      navigate('/qa');
    } catch (err) {
      console.error('Error deleting question:', err);
      alert('Failed to delete question. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAnswer = async (answerId: number) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return;

    try {
      await questionService.deleteAnswer(answerId);
      // Refresh question to update the answers list
      await fetchQuestionDetails();
    } catch (err) {
      console.error('Error deleting answer:', err);
      alert('Failed to delete answer. Please try again.');
    }
  };

  const canDeleteQuestion = user?.role === 'admin' || user?.userId === question?.askedBy.userId;

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading... | Q & A</title>
        </Helmet>
        <div className="flex justify-center items-center h-64">
          <Loader size={48} className="text-cuet-primary-700 animate-spin" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Error | Q & A</title>
        </Helmet>
        <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertTriangle size={48} className="mx-auto text-red-500" />
          <h3 className="mt-4 text-xl font-semibold text-red-800 dark:text-red-300">An Error Occurred</h3>
          <p className="mt-1 text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchQuestionDetails}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </>
    );
  }

  if (!question) {
    return (
      <>
        <Helmet>
          <title>Question Not Found | Q & A</title>
        </Helmet>
        <div className="text-center py-12">Question not found.</div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Answers | Q & A`}</title>
      </Helmet>
      <div className="animate-fade-in space-y-8">
        <Link to="/q-a" className="flex items-center gap-2 text-cuet-primary-800 dark:text-cuet-primary-300 hover:underline">
          <ArrowLeft size={20} />
          Back to all questions
        </Link>

        {/* Question Details */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{question.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-dark-text-secondary mt-2">
            <span>Asked by <strong>{question.askedBy?.name || 'Unknown'}</strong></span>
            <span>on {question.createdAt ? format(parseISO(question.createdAt), 'MMM d, yyyy') : 'Unknown date'}</span>
          </div>
          <hr className="my-4 border-gray-200 dark:border-dark-border" />
          <p className="text-gray-700 dark:text-dark-text whitespace-pre-wrap">{question.description || 'No description provided'}</p>
        </div>

        {/* Answers Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{question.answers?.length || 0} Answer(s)</h2>
          {question.answers && question.answers.length > 0 ? (
            question.answers.map(answer => <AnswerCard key={answer.ansId} answer={answer} onDelete={handleDeleteAnswer} />)
          ) : (
            <p className="text-gray-600 dark:text-dark-text-secondary">There are no answers to this question yet.</p>
          )}
        </div>

        {/* Submit Answer Form */}
        {user ? (
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer} className="mt-4 space-y-4">
              <textarea
                rows={6}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Write your answer here..."
                className="w-full p-3 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-border/50 focus:ring-2 focus:ring-cuet-primary-500 focus:outline-none"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newAnswer.trim()}
                  className="flex items-center justify-center gap-2 px-5 py-2 bg-cuet-primary-900 text-white font-semibold rounded-lg shadow-md hover:bg-cuet-primary-800 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Post Your Answer'}
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 dark:bg-dark-border/50 rounded-lg">
            <p className="text-gray-700 dark:text-dark-text">
              You must be <Link to="/login" className="text-cuet-primary-800 dark:text-cuet-primary-300 font-semibold hover:underline">logged in</Link> to post an answer.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

const AnswerCard = ({ answer, onDelete }: AnswerCardProps) => {
  const { user } = useAuth();
  const canDeleteAnswer = user?.role === 'admin' || user?.userId === answer.answeredBy.userId;

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl p-5 border border-gray-200 dark:border-dark-border relative">
      <p className="text-gray-700 dark:text-dark-text whitespace-pre-wrap">{answer?.content || 'No content'}</p>
      <div className="flex items-center justify-between gap-4 text-sm text-gray-500 dark:text-dark-text-secondary mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <UserCircle size={20} />
            <span><strong>{answer?.answeredBy?.name || 'Unknown'}</strong></span>
          </div>
          <span>answered on {answer?.createdAt ? format(parseISO(answer.createdAt), 'MMM d, yyyy') : 'Unknown date'}</span>
        </div>
        {canDeleteAnswer && (
          <button
            onClick={() => onDelete(parseInt(answer.ansId))}
            className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Delete answer"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionDetailPage;
