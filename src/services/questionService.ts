import api from './api';

export interface Question {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  askedBy: {
    userId: string;
    name: string;
  };
  answers: Answer[];
}

export interface Answer {
  id: string;
  content: string;
  createdAt: string;
  answeredBy: {
    userId: string;
    name: string;
  };
}

export interface QuestionCreateRequest {
  title: string;
  content: string;
}

export interface AnswerCreateRequest {
  content: string;
  questionId: string;
}

const questionService = {
  // Get all questions
  getAllQuestions: async () => {
    const response = await api.get('/questions');
    return response.data;
  },

  // Get question by ID
  getQuestionById: async (id: string) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  // Create new question
  createQuestion: async (question: QuestionCreateRequest) => {
    const response = await api.post('/questions', question);
    return response.data;
  },

  // Delete question
  deleteQuestion: async (id: string) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },

  // Add answer to question
  addAnswer: async (answer: AnswerCreateRequest) => {
    const response = await api.post('/answers', answer);
    return response.data;
  },

  // Delete answer
  deleteAnswer: async (id: string) => {
    const response = await api.delete(`/answers/${id}`);
    return response.data;
  },
};

export default questionService;
