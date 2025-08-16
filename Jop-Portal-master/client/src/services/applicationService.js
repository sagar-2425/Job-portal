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

export const applicationService = {
  // Apply for a job
  applyForJob: async (applicationData) => {
    const response = await api.post('/applications/apply', applicationData);
    return response.data;
  },

  // Get my applications (seeker only)
  getMyApplications: async () => {
    const response = await api.get('/applications/my');
    return response.data;
  },

  // Get applications for a job (recruiter only)
  getJobApplications: async (jobId) => {
    const response = await api.get(`/applications/job/${jobId}`);
    return response.data;
  },

  // Update application status (recruiter only)
  updateApplicationStatus: async (id, status) => {
    const response = await api.put(`/applications/status/${id}`, { status });
    return response.data;
  },

  // Update application (seeker)
  updateApplication: async (id, applicationData) => {
    const response = await api.put(`/applications/${id}`, applicationData);
    return response.data;
  },

  // Delete application (seeker)
  deleteApplication: async (id) => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },
}; 