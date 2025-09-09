import React, { createContext, useContext, useState } from 'react';
import axiosInstance from '../contextprovider/axios';

const UploadContext = createContext();

export const useUpload = () => useContext(UploadContext);

export const UploadProvider = ({ children }) => {
  const [uploads, setUploads] = useState({}); // { metricId: [{...file}] }
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFile = async (metricId, file, criteriaCode, session) => {
    setUploading(true);
    setError(null);

    try {
      console.log('Uploading file...');
      // Ensure session is a string and extract first year (e.g., '2023-2024' -> '2023')
      const sessionStr = String(session || '');
      const firstYear = sessionStr ? sessionStr.split('-')[0] : '';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('session', firstYear);

      // ✅ criteriaCode passed as URL param (backend expects this)
      const res = await axiosInstance.post(
        `/file/upload/${criteriaCode}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );

      const uploadedFile = res.data.data; // API returns saved DB record

      setUploads(prev => ({
        ...prev,
        [metricId]: prev[metricId]
          ? [...prev[metricId], uploadedFile]
          : [uploadedFile],
      }));

      setUploading(false);
      return uploadedFile;
    } catch (err) {
      console.error('Upload failed', err);
      setError(err.response?.data?.message || err.message || 'Upload failed');
      setUploading(false);
      throw err;
    }
  };

  const removeFile = (metricId, fileId) => {
    setUploads(prev => ({
      ...prev,
      [metricId]: prev[metricId]?.filter(f => f.id !== fileId) || [],
    }));
  };

  return (
    <UploadContext.Provider
      value={{ uploads, uploading, error, uploadFile, removeFile }}
    >
      {children}
    </UploadContext.Provider>
  );
};
