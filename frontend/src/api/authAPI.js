import apiClient from './client_config.js';
import { useGet } from '../hooks/useApi.js';

/*login function that will be used in the login component, takes in username and password and sends a POST request to the backend API to authenticate the user. 
Returns the response from the backend, which should include a token if the login is successful.*/ 
export const loginUser = async (username, password) => {
    return await apiClient('/api/employee/login', {
        method: 'POST',
        body: {
            username,
            password
        }
    });
};

/*Logout function */
export const logoutUser = async () => {
    //Clear any stored tokens/session data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return Promise.resolve();
};

//check if user is authenticated
export const useIsAuthenticated = () => {
   const { data, isPending, error, isSuccess, isError } = useGet(['auth'], '/api/employee/auth', {
       retry: false,
       staleTime: 0, //do not cache your auth
       refetchOnWindowFocus: false,
     });
   return {role: data?.user?.is_manager, isPending, isSuccess, isError};
};

//get current user info
export const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};


