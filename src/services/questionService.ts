import api from './api';

export interface Question {
  questionId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  askedBy: {
    userId: string;
    name: string;
    email: string;
    deptName: string;
    batch: string;
    role: string;
  };
  answers: Answer[];
}

export interface Answer {
  ansId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  answeredBy: {
    userId: string;
    name: string;
    email: string;
    deptName: string;
    batch: string;
    role: string;
  };
}

export interface QuestionCreateRequest {
  title: string;
  description: string;
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

  // Get question by ID and its answers
  getQuestionById: async (questionId: string) => {
    try {
      const response = await api.get(`/questions/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching question:', error);
      throw error;
    }
  },

  // Create new question
  createQuestion: async (question: QuestionCreateRequest) => {
    const response = await api.post('/questions/ask', question);
    return response.data;
  },

  // Add answer to a question
  addAnswer: async (answer: AnswerCreateRequest) => {
    const response = await api.post('/answers/submit', answer);
    return response.data;
  },
};

export default questionService;
