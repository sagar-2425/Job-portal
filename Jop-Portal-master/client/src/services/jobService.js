import axios from 'axios';

const API_URL = 'https://job-portal-server-4ar8.onrender.com/api';

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

export const jobService = {
  // Get all jobs with filters
  getJobs: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    const response = await api.get(`/jobs?${params.toString()}`);
    return response.data;
  },

  // Get recruiter's jobs
  getRecruiterJobs: async () => {
    const response = await api.get('/jobs/recruiter/my-jobs');
    return response.data;
  },

  // Get single job
  getJob: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  // Create job (recruiter only)
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Update job (recruiter only)
  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  // Delete job (recruiter only)
  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },
};
