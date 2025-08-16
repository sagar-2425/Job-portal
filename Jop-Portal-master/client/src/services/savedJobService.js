import axios from 'axios';

const API_URL = '/api';

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const savedJobService = {
  // Save a job
  saveJob: async (jobId) => {
    const response = await api.post('/saved-jobs/save', { jobId });
    return response.data;
  },

  // Unsave a job
  unsaveJob: async (jobId) => {
    const response = await api.delete(`/saved-jobs/unsave/${jobId}`);
    return response.data;
  },

  // Get user's saved jobs
  getSavedJobs: async () => {
    const response = await api.get('/saved-jobs/my');
    return response.data;
  },

  // Check if a job is saved
  checkIfSaved: async (jobId) => {
    const response = await api.get(`/saved-jobs/check/${jobId}`);
    return response.data;
  },
}; 