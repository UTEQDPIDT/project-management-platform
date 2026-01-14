import { api } from '@/lib/axios';
import { EntityType, UploadFilePayload } from '@repo/types';

const uploadFile = async ({
  file,
  entityId,
  entityType,
}: UploadFilePayload) => {
  try {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('entityId', entityId);
    formData.append('entityType', entityType);

    const { data } = await api.post('/files/upload', formData);

    return data;
  } catch (error) {
    console.error('Error uploading file');
    throw error;
  }
};

const uploadMultipleFiles = async ({
  files,
  entityId,
  entityType,
}: {
  files: File[];
  entityId: string;
  entityType: EntityType;
}) => {
  try {
    const formData = new FormData();

    files.forEach((file) => formData.append('files', file));
    formData.append('entityId', entityId);
    formData.append('entityType', entityType);

    const { data } = await api.post('/files/upload/multiple', formData);
    return data;
  } catch (error) {
    throw error;
  }
};

const getAllFiles = async () => {
  try {
    const { data } = await api.get('/files');
    return data;
  } catch (err) {
    console.error('Error loading files');
    throw err;
  }
};

const downloadFile = async (fileId: string, fileName: string) => {
  try {
    const { data } = await api.get(`/files/download/${fileId}`, {
      responseType: 'blob', // Important: tells axios to expect binary data
    });

    // Create a blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName); // Use the actual filename
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error downloading file:', err);
    throw err;
  }
};

const deleteFile = async ({ fileId }: { fileId: string }) => {
  try {
    const { data } = await api.delete(`/files/${fileId}`);

    return data;
  } catch (error) {
    console.error('Error deleting file', error);
    throw error;
  }
};

export {
  uploadFile,
  uploadMultipleFiles,
  getAllFiles,
  downloadFile,
  deleteFile,
};
