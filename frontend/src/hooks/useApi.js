import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client_config';

/**
 * Make a GET request
 * @param {Array} queryKey - e.g., ['users', userId]
 * @param {string} url - e.g., '/api/users'
 */
export function useGet(queryKey, url, options = {}) {
  return useQuery({
    queryKey,
    queryFn: () => apiClient(url),
    ...options,
  });
}

/**
 * Hook for Mutations (POST, PUT, PATCH, DELETE)
 * @param {string} url - The endpoint
 * @param {string} method - 'POST', 'PATCH', etc.
 * @param {Array|Array[]} invalidateKeys - Keys to refresh after success
 */
export function useMutate(url, method = 'POST', invalidateKeys = []) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient(url, { method, body: data }),
    onSuccess: () => {
      // If you provided keys, invalidate them all to refresh the UI
      if (invalidateKeys.length > 0) {
        // Handles both single key ['users'] or multiple [['users'], ['admins']]
        const keysToInvalidate = Array.isArray(invalidateKeys[0]) 
          ? invalidateKeys 
          : [invalidateKeys];
          
        keysToInvalidate.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    },
  });
}