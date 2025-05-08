import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  console.log(`Fetching from: ${url}`);
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMessage = error.message || `API request failed: ${response.status} ${response.statusText}`;
    console.error(`API error: ${errorMessage}`);
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
  return response.json();
};

export const login = async (email, password, role) => {
  if (!role) {
    console.error('Role is required for login');
    toast.error('User role not provided');
    throw new Error('User role not provided');
  }
  const data = await fetchWithAuth(`${API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });
  localStorage.setItem('token', data.token); // Store token
  localStorage.setItem('role', role); // Store role
  console.log(`Login successful for role: ${role}`);
  return data;
};

export const signup = async (email, password, role) => {
  if (!role) {
    console.error('Role is required for signup');
    toast.error('User role not provided');
    throw new Error('User role not provided');
  }
  const data = await fetchWithAuth(`${API_URL}/auth/signup`, {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });
  localStorage.setItem('token', data.token); // Store token
  localStorage.setItem('role', role); // Store role
  console.log(`Signup successful for role: ${role}`);
  return data;
};

export const getSurveys = async () => {
  return fetchWithAuth(`${API_URL}/survey`);
};

export const createSurvey = async (survey) => {
  return fetchWithAuth(`${API_URL}/survey`, {
    method: 'POST',
    body: JSON.stringify(survey),
  });
};

export const updateSurvey = async (id, survey) => {
  return fetchWithAuth(`${API_URL}/survey/${id}`, {
    method: 'PUT',
    body: JSON.stringify(survey),
  });
};

export const deleteSurvey = async (id) => {
  return fetchWithAuth(`${API_URL}/survey/${id}`, {
    method: 'DELETE',
  });
};

export const getCategories = async () => {
  return fetchWithAuth(`${API_URL}/category`);
};

export const getUsers = async () => {
  return fetchWithAuth(`${API_URL}/auth/users`);
};

export const getResponses = async (role) => {
  console.log('getResponses called with role:', role);
  let effectiveRole = role || localStorage.getItem('role');
  if (!effectiveRole) {
    console.error('Role is required for getResponses and not found in localStorage');
    toast.error('User role not provided. Please log in again.');
    throw new Error('User role not provided');
  }
  const endpoint = effectiveRole === 'admin' ? '/response' : '/response/my-responses';
  console.log(`Fetching responses from: ${API_URL}${endpoint} for role: ${effectiveRole}`);
  try {
    const responses = await fetchWithAuth(`${API_URL}${endpoint}`);
    console.log(`Fetched ${responses.length || 0} responses for ${effectiveRole}:`, responses);
    if (!responses || responses.length === 0) {
      console.warn(`No responses found for ${effectiveRole}`);
      toast.info(`No responses available for ${effectiveRole === 'admin' ? 'any users' : 'you'}`);
    }
    return responses || [];
  } catch (err) {
    console.error(`Failed to fetch responses for ${effectiveRole}:`, err.message);
    throw err;
  }
};

export const submitResponse = async (response) => {
  const { userId, surveyId, answer } = response;
  if (!userId || !surveyId || !answer) {
    console.error('Missing required fields:', { userId, surveyId, answer });
    toast.error('All fields are required');
    throw new Error('All fields are required');
  }
  console.log('Submitting response:', response);
  return fetchWithAuth(`${API_URL}/response`, {
    method: 'POST',
    body: JSON.stringify(response),
  });
};

export const sendReportByUser = async (userId) => {
  return fetchWithAuth(`${API_URL}/response/report-by-user`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
};