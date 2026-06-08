// Configuration: The base URL for all API backend communication
const BASE_URL = 'http://localhost:10000/api';

/**
 * Custom fetch wrapper that automatically handles JWT access token injection
 * and silent token replication/refresh upon receiving a 401 Unauthorized status.
 * endpoint - The relative URL path (e.g., '/users', '/orders')
 * options - Custom fetch options (method, body, custom headers, etc.)
 * The final HTTP response object
 */
export const apiFetch = async (endpoint, options = {}) => {
  // Retrieve the current access token from the browser's local storage
  let token = localStorage.getItem('accessToken');

  // Initialize and merge request headers, enforcing JSON content format by default
  options.headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // If an access token exists, inject it into the Authorization header using the Bearer schema
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  // Execute the initial network request
  let response = await fetch(`${BASE_URL}${endpoint}`, options);

  // Check if the server rejected the request due to an expired or invalid access token (401)
  if (response.status === 401) {
    // Extract the long-lived refresh token from local storage
    const refreshToken = localStorage.getItem('refreshToken');

    // Proceed only if a refresh token is available
    if (refreshToken) {
      // Send a silent background request to the backend to request a new access token
      const refreshResponse = await fetch(`${BASE_URL}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: refreshToken })
      });

      // If the token refresh process was successful
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        
        // Save the newly generated access token into local storage for future requests
        localStorage.setItem('accessToken', data.accessToken);

        // Update the current request's headers with the new valid token
        options.headers['Authorization'] = `Bearer ${data.accessToken}`;

        // Retry the original request a second time with the fresh token and update the response
        response = await fetch(`${BASE_URL}${endpoint}`, options);
      } else {
        // If the refresh token itself is expired or invalid, clear all tokens from storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Forcefully redirect the user to the login page using the browser window location
        window.location.href = '/login';
      }
    }
  }

  // Return the final response object back to the caller
  return response;
};