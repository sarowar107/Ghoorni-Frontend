import api from './api';

export interface FileData {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: {
    userId: string;
    name: string;
  };
  filePath: string;
}

const fileService = {
  // Get all files
  getAllFiles: async () => {
    const response = await api.get('/files');
    return response.data;
  },

  // Get file by ID
  getFileById: async (id: string) => {
    const response = await api.get(`/files/${id}`);
    return response.data;
  },

  // Upload file (using FormData)
  uploadFile: async (file: File, topic: string = 'General', isPublic: boolean = true) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('topic', topic);
    formData.append('isPublic', String(isPublic));
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Delete file
  deleteFile: async (id: string) => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
  },

  // Download file
  getDownloadLink: (fileId: string) => {
    return `${api.defaults.baseURL}/files/download/${fileId}`;
  }
};

export default fileService;
