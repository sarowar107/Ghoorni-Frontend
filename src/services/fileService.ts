import api from './api';

// Helper function to determine file type from filename
const getFileTypeFromName = (filename: string): string => {
  if (!filename) return 'unknown';
  
  const parts = filename.split('.');
  if (parts.length < 2) return 'unknown';
  
  const extension = parts[parts.length - 1].toLowerCase();
  
  // Map common extensions to MIME types
  const mimeTypes: {[key: string]: string} = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'txt': 'text/plain',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed'
  };
  
  return mimeTypes[extension] || `application/${extension}`;
};

// Backend file structure
export interface FileResponseFromBackend {
  fileId: number;
  topic: string;
  content: string;
  uploadedAt: string;
  isPublic: boolean;
  uploadedBy: {
    userId: string;
    name: string;
    role: string;
    deptName: string;
    batch: string;
  };
}

// Frontend file structure used in the UI
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
  topic: string;
  isPublic: boolean;
}

export interface UploadMetadata {
  topic: string;
  toDept?: string;
  toBatch?: string;
  isPublic?: boolean;
}

const fileService = {
  // Get all files
  getAllFiles: async () => {
    const response = await api.get('/files');
    // Map backend response to our frontend file structure
    return response.data.map((file: FileResponseFromBackend): FileData => ({
      id: file.fileId.toString(),
      fileName: file.content.substring(file.content.indexOf('_') + 1), // Extract original filename from content
      fileType: getFileTypeFromName(file.content),
      fileSize: 0, // Backend doesn't provide size
      uploadedAt: file.uploadedAt,
      uploadedBy: {
        userId: file.uploadedBy?.userId || '',
        name: file.uploadedBy?.name || ''
      },
      filePath: file.content,
      topic: file.topic,
      isPublic: file.isPublic
    }));
  },

  // Get file by ID
  getFileById: async (id: string) => {
    const response = await api.get(`/files/${id}`);
    const file = response.data as FileResponseFromBackend;
    
    return {
      id: file.fileId.toString(),
      fileName: file.content.substring(file.content.indexOf('_') + 1),
      fileType: getFileTypeFromName(file.content),
      fileSize: 0,
      uploadedAt: file.uploadedAt,
      uploadedBy: {
        userId: file.uploadedBy?.userId || '',
        name: file.uploadedBy?.name || ''
      },
      filePath: file.content,
      topic: file.topic,
      isPublic: file.isPublic
    } as FileData;
  },

  // Upload file (using FormData)
  uploadFile: async (file: File, metadata: UploadMetadata) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('topic', metadata.topic);

    if (metadata.toDept) {
      formData.append('toDept', metadata.toDept);
    }
    if (metadata.toBatch) {
      formData.append('toBatch', metadata.toBatch);
    }
    if (typeof metadata.isPublic === 'boolean') {
      formData.append('isPublic', String(metadata.isPublic));
    }
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Convert backend response to frontend format
    const backendFile = response.data as FileResponseFromBackend;
    return {
      id: backendFile.fileId.toString(),
      fileName: backendFile.content.substring(backendFile.content.indexOf('_') + 1),
      fileType: getFileTypeFromName(backendFile.content),
      fileSize: file.size, // We have the actual file size during upload
      uploadedAt: backendFile.uploadedAt,
      uploadedBy: {
        userId: backendFile.uploadedBy?.userId || '',
        name: backendFile.uploadedBy?.name || ''
      },
      filePath: backendFile.content,
      topic: backendFile.topic,
      isPublic: backendFile.isPublic
    } as FileData;
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
