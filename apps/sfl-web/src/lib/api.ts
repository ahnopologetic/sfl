
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
  listSnippets: async (filters?: {
    status?: string;
    is_public?: boolean;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    job_id?: string;
  }): Promise<{
    items: Array<{
      id: string;
      title: string;
      description: string;
      tags: string[];
      duration_seconds: number;
      is_public: boolean;
      spotify_track_id?: string;
      spotify_artist?: string;
      spotify_album?: string;
      job_id: string;
      created_at: string;
      updated_at: string;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  }> => {
    const queryParams = new URLSearchParams();

    if (filters) {
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.is_public !== undefined) queryParams.append('is_public', filters.is_public.toString());
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => queryParams.append('tags', tag));
      }
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.sort) queryParams.append('sort', filters.sort);
      if (filters.order) queryParams.append('order', filters.order);
      if (filters.job_id) queryParams.append('job_id', filters.job_id);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/snippets?${queryString}` : '/snippets';

    return await apiRequest(endpoint);
  },

  createJob: async (requestText: string) => {
    return await apiRequest('/snippets', {
      method: 'POST',
      body: JSON.stringify({ request_text: requestText }),
    });
  },

  listJobs: async (): Promise<{
    id: string;
    user_id: string;
    request_text: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    error_message?: string;
    estimated_completion_time?: string;
    created_at: string;
    updated_at: string;
  }[]> => {
    return await apiRequest('/jobs');
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

};

export const trendingTopicsApi = {
  retrieve: async (region: string, country: string, city: string): Promise<{
    region: string;
    country: string;
    city: string;
    topics: { title: string, description: string, image_url: string }[];
  }> => {
    return await apiRequest('/trending', {
      method: 'POST',
      body: JSON.stringify({ region, country, city }),
    });
  },
};