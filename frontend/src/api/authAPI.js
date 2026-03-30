import apiClient from './client_config.js';

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
export const isAuthenticated = () => {
    return localStorage.getItem('authToken') !== null;
};

//get current user info
export const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};
