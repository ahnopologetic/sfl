
// Base URL for the deployed API
const API_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://sfl.onrender.com';

/**
 * Handles API requests with authentication
 */
async function apiRequest(path: string, options: RequestInit = {}) {
  // Get the access token from cookies
  const accessToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('access_token='))
    ?.split('=')[1];

  // Set up headers with authentication
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': accessToken ? `Bearer ${accessToken}` : '',
    ...options.headers,
  };

  // Make the request
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include', // Include cookies in the request
  });

  // Handle non-200 responses
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'API request failed');
  }

  // Handle empty responses
  if (response.status === 204) {
    return null;
  }

  // Parse JSON response
  return await response.json();
}

/**
 * User profile API functions
 */
export const profileApi = {
  create: async (profileData: {
    username: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    timezone: string;
  }) => {
    return await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  getCurrentProfile: async () => {
    return await apiRequest('/users/me');
  },
};

/**
 * Snippet job API functions
 */
export const snippetApi = {
  createJob: async (requestText: string) => {
    return await apiRequest('/snippets', {
      method: 'POST',
      body: JSON.stringify({ request_text: requestText }),
    });
  },

  getJobStatus: async (jobId: string) => {
    return await apiRequest(`/snippets/jobs/${jobId}`);
  },

  getSnippetMetadata: async (snippetId: string) => {
    return await apiRequest(`/snippets/${snippetId}/metadata`);
  },

  updateSnippet: async (snippetId: string, updateData: {
    title?: string;
    description?: string;
    tags?: string[];
    is_public?: boolean;
  }) => {
    return await apiRequest(`/snippets/${snippetId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // This returns the audio URL directly from the backend
  getAudioUrl: (snippetId: string) => {
    return `${API_URL}/snippets/${snippetId}`;
  },
}; 