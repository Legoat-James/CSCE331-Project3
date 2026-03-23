// src/api/client.js
async function apiClient(endpoint, { body, ...customConfig } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  
  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(endpoint, config);
  const data = await response.json();

  if (response.ok) {
    return data;
  } else {
    //EXAMPLE ERROR FORMAT:
    // {
    //   status: 400,
    //   message: "Validation Failed",
    //   data: {
    //     errors: [
    //       { field: "email", issue: "Email is already taken" },
    //       { field: "password", issue: "Password must be 8 characters" },
    //     ],
    //   },
    //   stack: "Error: Validation Failed at ...",
    // }


    // This allows you to access server-side error messages
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data; // Catch-all for extra error info
    throw error;
  }
}

export default apiClient;