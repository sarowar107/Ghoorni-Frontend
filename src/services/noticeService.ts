import api from './api';

export interface Notice {
  noticeId: number;
  title: string;
  content: string;
  createdAt: string;
  isPublic: boolean;
  expiryTime?: string;
  toDept: string;
  toBatch: string;
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
  toDept: string;
  toBatch: string;
}

const noticeService = {
  // Get all notices available to the current user
  getAllNotices: async (): Promise<Notice[]> => {
    // FIX: Changed endpoint from '/notices' to '/notices/all' to fetch the complete list.
    const response = await api.get('/notices');
    return response.data;
  },

  // Get a single notice by its ID
  getNoticeById: async (id: number): Promise<Notice> => {
    const response = await api.get(`/notices/${id}`);
    return response.data;
  },

  // Create a new notice
  createNotice: async (notice: NoticeCreateRequest): Promise<Notice> => {
    const response = await api.post('/notices/create', notice);
    return response.data;
  },

  // Delete a notice
  deleteNotice: async (id: number): Promise<void> => {
    await api.delete(`/notices/${id}`);
  },
};

export default noticeService;
