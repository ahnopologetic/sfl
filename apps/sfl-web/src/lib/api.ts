import { createClient } from '@supabase/supabase-js';

// Base URL for the deployed API
const API_URL = 'https://sfl.onrender.com';

// Initialize Supabase client (should match what you're using for auth)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Handles API requests with authentication
 */
async function apiRequest(path: string, options: RequestInit = {}) {
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  
  // Set up headers with authentication
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    ...options.headers,
  };
  
  // Make the request
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
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