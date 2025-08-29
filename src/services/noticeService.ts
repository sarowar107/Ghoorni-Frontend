import api from './api';

export interface Notice {
  noticeId: number;
  title: string;
  content: string;
  createdAt: string;
  isPublic: boolean;
  expiryTime?: string;
  department?: string;
  batch?: string;
  createdBy: {
    userId: string;
    name: string;
    role: string;
    deptName?: string;
    batch?: string;
  };
}

export interface NoticeCreateRequest {
  title: string;
  content: string;
  isPublic?: boolean;
  expiryTime?: string;
  department?: string;
  batch?: string;
}

const noticeService = {
  // Get all notices
  getAllNotices: async (): Promise<Notice[]> => {
    const response = await api.get('/notices');
    return response.data;
  },

  // Get notice by ID
  getNoticeById: async (id: string): Promise<Notice> => {
    const response = await api.get(`/notices/${id}`);
    return response.data;
  },

  // Create new notice
  createNotice: async (notice: NoticeCreateRequest) => {
    const response = await api.post('/notices/create', notice);
    return response.data;
  },

  // Delete notice
  deleteNotice: async (id: string) => {
    const response = await api.delete(`/notices/${id}`);
    return response.data;
  },
};

export default noticeService;
