import { useState, useEffect } from 'react';

function Example() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from Express backend
    fetch('http://localhost:5000/api')
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
          Full-Stack App Demo
        </h1>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-gray-700">
            <span className="font-semibold">Frontend:</span> React + Vite + Tailwind CSS
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Backend:</span> Node.js + Express.js
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Backend Response:
          </h2>
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error: {error}
            </div>
          )}
          {!loading && !error && (
            <p className="text-lg text-green-600 font-medium">{message}</p>
          )}
        </div>

        <div className="text-center text-gray-600 text-sm">
          Edit <code className="bg-gray-200 px-2 py-1 rounded">frontend/src/Example.jsx</code> to customize this page
        </div>
      </div>
    </div>
  );
}

export default Example;
