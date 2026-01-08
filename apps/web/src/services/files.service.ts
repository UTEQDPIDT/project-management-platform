import { api } from '@/lib/axios';

const getAllFiles = async () => {
  try {
    const { data } = await api.get('/files');
    return data;
  } catch (err) {
    console.error('Error loading files');
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

export { getAllFiles, downloadFile };
