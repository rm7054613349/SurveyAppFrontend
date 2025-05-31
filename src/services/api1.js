import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getSections = () => axios.get(`${API_URL}/documentsections`);
export const createSection = (data) => axios.post(`${API_URL}/documentsections`, data);
export const getSubsections = () => axios.get(`${API_URL}/documentsubsections`);
export const createSubsection = (data) => axios.post(`${API_URL}/documentsubsections`, data);
export const getDocuments = (subsectionId) => axios.get(`${API_URL}/documents${subsectionId ? `?subsectionId=${subsectionId}` : ''}`);
export const createDocument = (data) => axios.post(`${API_URL}/documents`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const downloadDocument = (id) => axios.get(`${API_URL}/documents/download/${id}`, { responseType: 'blob' });