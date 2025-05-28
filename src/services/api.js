import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import axios from 'axios';



const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  console.log(`Fetching from: ${url}`, { method: options.method, headers });
  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      console.error(`API error: ${errorMessage}`, { status: response.status, url });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    const data = await response.json();
    console.log(`Response from ${url}:`, data);
    return data;
  } catch (err) {
    console.error('Network or fetch error:', {
      message: err.message,
      url,
      options,
    });
    throw err;
  }
};

// const fetchWithAuth = async (url, options = {}) => {
//   const token = localStorage.getItem('token');
//   const headers = {
//     ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
//     ...(token && { Authorization: `Bearer ${token}` }),
//     ...options.headers,
//   };
//   console.log(`Fetching from: ${url}`);
//   const response = await fetch(url, { ...options, headers });
//   if (!response.ok) {
//     const error = await response.json().catch(() => ({}));
//     const errorMessage = error.message || `API request failed: ${response.status} ${response.statusText}`;
//     console.error(`API error: ${errorMessage}`);
//     toast.error(errorMessage);
//     throw new Error(errorMessage);
//   }
//   return response.json();
// };




// export const fetchWithA = async (url, options = {}) => {
//   const token = localStorage.getItem('token');
//   console.log('fetchWithAuth - URL:', url, 'Token:', token ? token.slice(0, 20) + '...' : 'No token', 'Options:', options); // Debug log
//   if (!token) {
//     throw new Error('No authentication token found. Please log in.');
//   }
//   try {
//     const response = await fetch(url, {
//       ...options,
//       headers: {
//         ...options.headers,
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });
//     console.log(`fetchWithAuth - Response status for ${url}:`, response.status); // Debug log
//     console.log(`fetchWithAuth - Response headers for ${url}:`, Object.fromEntries(response.headers)); // Debug log

//     if (!response.ok) {
//       const contentType = response.headers.get('Content-Type') || '';
//       const text = await response.text(); // Get raw response text
//       let errorData = { message: 'No response body' };

//       console.log(`fetchWithAuth - Raw response text for ${url}:`, text.slice(0, 200) + (text.length > 200 ? '...' : '')); // Debug log

//       if (contentType.includes('text/html') || text.startsWith('<!DOCTYPE')) {
//         throw new Error('Server returned an HTML response. Possible causes: incorrect route, authentication redirect, or server misconfiguration.');
//       }

//       try {
//         errorData = text ? JSON.parse(text) : errorData; // Try parsing JSON
//       } catch (parseErr) {
//         console.warn(`fetchWithAuth - Failed to parse response body for ${url}:`, parseErr.message); // Debug log
//       }
//       console.log(`fetchWithAuth - Error response body for ${url}:`, errorData); // Debug log

//       if (response.status === 401) {
//         throw new Error(errorData.message || 'Unauthorized: Invalid or expired token. Please log in again.');
//       }
//       if (response.status === 403) {
//         throw new Error(errorData.message || 'Access denied: Admin privileges required.');
//       }
//       if (response.status === 404) {
//         throw new Error(errorData.message || 'Endpoint not found. Please check the API route configuration.');
//       }
//       throw new Error(errorData.message || `Network error: ${response.status}`);
//     }
//     return response.json();
//   } catch (err) {
//     console.error(`fetchWithAuth - Error for ${url}:`, err.message); // Debug log
//     throw err;
//   }
// };


export const fetchWithA= async (url, options = {}) => {
  const token = localStorage.getItem('token');
  console.log('fetchWithAuth - URL:', url, 'Token:', token ? token.slice(0, 20) + '...' : 'No token', 'Options:', options); // Debug log
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(`fetchWithAuth - Response status for ${url}:`, response.status, 'Ok:', response.ok); // Debug log
    console.log(`fetchWithAuth - Response headers for ${url}:`, Object.fromEntries(response.headers)); // Debug log

    const contentType = response.headers.get('Content-Type') || '';
    const text = await response.text(); // Get raw response text
    console.log(`fetchWithAuth - Raw response text for ${url}:`, text.slice(0, 500) + (text.length > 500 ? '...' : '')); // Debug log

    if (!response.ok) {
      let errorData = { message: 'No response body' };

      if (contentType.includes('text/html') || text.startsWith('<!DOCTYPE')) {
        throw new Error(`Server returned an HTML response (status: ${response.status || 'unknown'}). Possible causes: incorrect route (check /api/response/report-by-user), authentication redirect, or server misconfiguration.`);
      }

      try {
        errorData = text ? JSON.parse(text) : errorData; // Try parsing JSON
      } catch (parseErr) {
        console.warn(`fetchWithAuth - Failed to parse response body for ${url}:`, parseErr.message); // Debug log
      }
      console.log(`fetchWithAuth - Error response body for ${url}:`, errorData); // Debug log

      if (response.status === 401) {
        throw new Error(errorData.message || 'Unauthorized: Invalid or expired token. Please log in again.');
      }
      if (response.status === 403) {
        throw new Error(errorData.message || 'Access denied: Admin privileges required.');
      }
      if (response.status === 404) {
        throw new Error(errorData.message || 'Endpoint not found. Verify /api/response/report-by-user is registered.');
      }
      throw new Error(errorData.message || `Network error: ${response.status}`);
    }

    try {
      return text ? JSON.parse(text) : {};
    } catch (parseErr) {
      console.error(`fetchWithAuth - Failed to parse successful response for ${url}:`, parseErr.message); // Debug log
      throw new Error('Invalid JSON response from server');
    }
  } catch (err) {
    console.error(`fetchWithAuth - Error for ${url}:`, err.message, err.stack); // Debug log
    if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
      throw new Error('Network error: Failed to connect to server. Check if backend is running at http://localhost:5000 and CORS is configured.');
    }
    throw err;
  }
};



export const login = async (email, password, role) => {
  if (!email || !password) {
    console.error('Email and password are required for login');
    toast.error('Email and password are required');
    throw new Error('Email and password are required');
  }
  if (!role) {
    console.warn('Role is not provided for login; proceeding with request');
    toast.warn('User role not provided; default behavior may apply');
  }
  try {
    const data = await fetchWithAuth(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role || role || 'unknown');
    localStorage.setItem('userId', data.userId);
    console.log(`Login successful for role: ${data.role || role || 'unknown'}`);
    return data;
  } catch (err) {
    console.error('Login error:', err.message);
    if (err.message.includes('Access Denied Role')) {
      toast.error('Login failed: Selected role does not match your account. Please choose the correct role.');
      throw new Error('Invalid role selected');
    }
    throw err;
  }
};



// export const login = async (email, password, role) => {
//   if (!email || !password) {
//     console.error('Email and password are required for login');
//     toast.error('Email and password are required');
//     throw new Error('Email and password are required');
//   }
//   if (!role) {
//     console.warn('Role is not provided for login; proceeding with request');
//     toast.warn('User role not provided; default behavior may apply');
//   }
//   try {
//     const data = await fetchWithAuth(`${API_URL}/auth/login`, {
//       method: 'POST',
//       body: JSON.stringify({ email, password, role }),
//     });
//     localStorage.setItem('token', data.token);
//     localStorage.setItem('role', data.role || role || 'unknown');
//     localStorage.setItem('userId', data.id);
//     console.log(`Login successful for role: ${data.role || role || 'unknown'}`);
//     return data;
//   } catch (err) {
//     console.error('Login error:', err.message);
//     if (err.message.includes('Access Denied Role')) {
//       toast.error('Login failed: Selected role does not match your account. Please choose the correct role.');
//       throw new Error('Invalid role selected');
//     }
//     throw err;
//   }
// };



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
  localStorage.setItem('token', data.token);
  localStorage.setItem('role', role);
  localStorage.setItem('userId', data.userId);
  console.log(`Signup successful for role: ${role}`);
  return data;
};

export const getSurveys = async () => {
  return fetchWithAuth(`${API_URL}/survey`);
};

export const getSurveysBySubsection = async (subsectionId) => {
  if (!subsectionId) {
    console.error('Subsection ID is required');
    toast.error('Subsection ID not provided');
    throw new Error('Subsection ID not provided');
  }
  console.log(`Fetching surveys for subsection: ${subsectionId}`);
  return fetchWithAuth(`${API_URL}/survey/subsection/${subsectionId}`);
};




// export const createSurvey = async (formData) => {
//   // Validate required fields from FormData
//   const question = formData.get('question');
//   const categoryId = formData.get('categoryId');
//   const sectionId = formData.get('sectionId');
//   const subsectionId = formData.get('subsectionId');
//   const questionType = formData.get('questionType');
//   const maxScore = formData.get('maxScore');

//   if (!question || !categoryId || !sectionId || !subsectionId || !questionType || !maxScore) {
//     console.error('Missing required fields for survey creation:', [...formData.entries()]);
//     toast.error('All required fields must be provided');
//     throw new Error('All required fields must be provided');
//   }

//   if (questionType === 'file-upload' && !formData.get('file')) {
//     console.error('File is required for file-upload question type');
//     toast.error('File is required for file-upload question type');
//     throw new Error('File is required for file-upload question type');
//   }

//   console.log('Creating survey with FormData:', [...formData.entries()]);
//   return fetchWithAuth(`${API_URL}/survey`, {
//     method: 'POST',
//     body: formData,
//   });
// };



export const createSurvey = async (formData) => {
  const question = formData.get('question');
  const categoryId = formData.get('categoryId');
  const sectionId = formData.get('sectionId');
  const subsectionId = formData.get('subsectionId');
  const questionType = formData.get('questionType');
  const maxScore = formData.get('maxScore');

  if (!question || !categoryId || !sectionId || !subsectionId || !questionType || !maxScore) {
    console.error('Missing required fields for survey creation:', [...formData.entries()]);
    toast.error('All required fields must be provided');
    throw new Error('All required fields must be provided');
  }

  if (questionType === 'file-upload') {
    const file = formData.get('file');
    if (!file || file.size === 0) {
      console.error('File is required for file-upload question type');
      toast.error('File is required for file-upload question type');
      throw new Error('File is required for file-upload question type');
    }
    if (file.size > 20 * 1024 * 1024) {
      console.error(`File size exceeds limit: ${file.size} bytes`);
      toast.error('File size must be less than 5MB');
      throw new Error('File size must be less than 5MB');
    }
    // const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
        const allowedTypes = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  'image/heic',
  'image/heif',

  // Videos
  'video/mp4',
  'video/mpeg',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',

  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
  'audio/webm',
  'audio/aac',
  'audio/x-wav',

  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',       // .xlsx
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'text/plain',
  'text/csv',
  'text/html',
  'application/json',
  'application/rtf',
  'application/xml',

  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',

  // Code files
  'application/javascript',
  'application/x-python-code',
  'application/x-java',
  'text/css',
  'text/markdown',
  'text/x-c',
  'text/x-c++',
  'text/x-java-source'
];

    if (!allowedTypes.includes(file.type)) {
      console.error(`Invalid file type: ${file.type}`);
      toast.error('Only JPEG, PNG, PDF, or TXT files are allowed');
      throw new Error('Only JPEG, PNG, PDF, or TXT files are allowed');
    }
    console.log('File details:', { name: file.name, size: file.size, type: file.type });
  }

  console.log('Creating survey with FormData:', [...formData.entries()]);
  return fetchWithAuth(`${API_URL}/survey`, {
    method: 'POST',
    body: formData,
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

export const createCategory = async (category) => {
  return fetchWithAuth(`${API_URL}/category`, {
    method: 'POST',
    body: JSON.stringify(category),
  });
};

export const getSections = async () => {
  return fetchWithAuth(`${API_URL}/section`);
};

export const createSection = async (section) => {
  return fetchWithAuth(`${API_URL}/section`, {
    method: 'POST',
    body: JSON.stringify(section),
  });
};

export const getSubsections = async () => {
  return fetchWithAuth(`${API_URL}/subsection`);
};

export const createSubsection = async (subsection) => {
  return fetchWithAuth(`${API_URL}/subsection`, {
    method: 'POST',
    body: JSON.stringify(subsection),
  });
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

export const getResponsesBySubsection = async (subsectionId) => {
  if (!subsectionId) {
    console.error('Subsection ID is required:',subsectionId);
    toast.error('Subsection ID not provided');
    throw new Error('Subsection ID not provided');
  }
  console.log(`Fetching responses for subsection: ${subsectionId}`);
  const data = await fetchWithAuth(`${API_URL}/response/subsection/${subsectionId}`);
  console.log(`getResponsesBySubsection response for ${subsectionId}:`, data);
  return Array.isArray(data) ? data : data.responseDetails && Array.isArray(data.responseDetails) ? data.responseDetails : [];
};



export const submitResponses = async (subsectionId, data) => {
  if (!subsectionId) {
    console.error('Subsection ID is required');
    toast.error('Subsection ID not provided');
    throw new Error('Subsection ID not provided');
  }
  if (!data.responses || !Array.isArray(data.responses)) {
    console.error('Responses array is required');
    toast.error('Responses data is invalid');
    throw new Error('Responses data is invalid');
  }
  console.log(`Submitting responses for subsection: ${subsectionId}`, data);

  const payload = {
    responses: data.responses.map(response => ({
      survey: response.surveyId, // Changed from surveyId to survey
      answer: response.answer || '',
      fileUrl: response.fileUrl || '',
    })),
  };

  return fetchWithAuth(`${API_URL}/response/submit/${subsectionId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};



export const sendReportByUser = async (payload) => {
  console.log('sendReportByUser - Payload:', payload); // Debug log
  return fetchWithA(`${API_URL}/response/report-by-user`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};




export const getScores = async (userId) => {
  return fetchWithAuth(`${API_URL}/response/score/${userId}`);
};

export const assignBadges = async (userId) => {
  return fetchWithAuth(`${API_URL}/response/badges/${userId}`);
};


// New function to fetch file content
export const getFileContent = async (filename) => {
  const url = `${API_URL}/files/${filename}`;
  console.log('getFileContent: Requesting file', { filename, url });
  try {
    const response = await axios.get(url, {
      responseType: 'blob', // Handle binary data (text, images)
    });
    console.log('getFileContent: Success', {
      filename,
      status: response.status,
      contentType: response.headers['content-type'],
    });
    return response;
  } catch (error) {
    console.error('getFileContent: Failed', {
      filename,
      url,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};





// Get user profile
export const getUserProfile = async () => {
  try {
    console.log('Fetching user profile');
    const data = await fetchWithAuth(`${API_URL}/auth/me`, {
      method: 'GET',
    });
    console.log('User profile fetched successfully:', data);
    return data;
  } catch (err) {
    console.error('Get user profile error:', err.message);
    toast.error(err.message);
    throw err;
  }
};

// Change password
// export const changePassword = async (currentPassword, newPassword) => {
//   if (!currentPassword || !newPassword) {
//     console.error('Current and new password are required');
//     toast.error('Current and new password are required');
//     throw new Error('Current and new password are required');
//   }

//   try {
//     console.log('Attempting to change password');
//     const data = await fetchWithAuth(`${API_URL}/auth/change-password`, {
//       method: 'POST',
//       body: JSON.stringify({ currentPassword, newPassword }),
//     });
//     console.log('Password change successful:', data);
//     return data;
//   } catch (err) {
//     console.error('Change password error:', err.message);
//     throw err;
//   }
// };

const fetchWithAu = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  console.log(`Fetching from: ${url}`, { method: options.method, headers });
  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      console.error(`API error: ${errorMessage}`, { status: response.status, url });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    const data = await response.json();
    console.log(`Response from ${url}:`, data);
    return data;
  } catch (err) {
    console.error('Network or fetch error:', {
      message: err.message,
      url,
      options,
    });
    throw err;
  }
};


export const changePassword = async (currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    console.error('Current and new password are required');
    toast.error('Current and new password are required');
    throw new Error('Current and new password are required');
  }

  try {
    console.log('Attempting to change password');
    const data = await fetchWithAu(`${API_URL}/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    console.log('Password change successful:', data);
    return data;
  } catch (err) {
    console.error('Change password error:', err.message);
    throw err;
  }
};



//Code for Announcement
const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`Requesting: ${config.method.toUpperCase()} ${config.url}`, { headers: config.headers });
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

API.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    const errorMsg = error.response?.data?.message || 'An unexpected error occurred';
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: errorMsg,
    });
    toast.error(errorMsg);
    return Promise.reject(error);
  }
);

// Admin APIs
export const createMessage = async (data) => {
  try {
    console.log('Creating message with data:', data);
    const response = await API.post('/admin/messages', data);
    console.log('Message created successfully:', response.data);
    toast.success('Message created successfully!');
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Error creating message';
    console.error('Create message error:', errorMsg);
    throw new Error(errorMsg);
  }
};

// Employee APIs
export const getMessages = async () => {
  try {
    console.log('Fetching messages');
    const response = await API.get('/employee/messages');
    console.log('Messages fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Error fetching messages';
    console.error('Get messages error:', errorMsg);
    throw new Error(errorMsg);
  }
};




//Code for Event
//Admin
export const createEvent = async (data) => {
  try {
    if (!data || !data.title || !data.content || !data.date || !data.type) {
      throw new Error('Missing required event fields');
    }
    
    console.log('Creating event with data:', data);
    const response = await API.post('/adminevent/event', data); // Send date as ISO string with time
    console.log('Event created successfully:', response.data);
    toast.success('Event created successfully!');
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Error creating event';
    console.error('Create event error:', errorMsg);
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }
};

export const getEvent = async () => {
  try {
    console.log('Fetching events');
    const response = await API.get('/employeeevent/event');
    console.log('Events fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Error fetching events';
    console.error('Get events error:', errorMsg);
    throw new Error(errorMsg);
  }
};