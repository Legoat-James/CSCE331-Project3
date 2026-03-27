import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Routes, Route } from 'react-router';
import { useState, useEffect,createContext, useContext } from 'react';
import { Navbar} from 'react-bootstrap';
import Customer from './Customer';
import NotFound from './NotFound';
import Cashier from './Cashier';
import Manager from './Manager';

//create a client for react query
const queryClient = new QueryClient();
//create a theme context
// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext();


function ErrorFallback({ error, resetErrorBoundary }) { 
  return (
    <div role="alert">
      <h1 className='text-center text-black'>An error occurred.</h1>
      <p className='text-muted ms-3'>Error: {error.message}</p>
      <button className='btn btn-warning ms-3' onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}


export default function App(){
    //themes will be used for accessiblity (ex: light, dark, high contrast)
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    useEffect(() => {
        // Apply the theme to the HTML element for Bootstrap 5.3+
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
  }, [theme]);

    return (
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <QueryClientProvider client={queryClient}>
          <nav>
            <button onClick={() => window.location.href = '/Cashier'} className='btn btn-primary'> Cashier </button>
            <button onClick={() => window.location.href = '/Manager'} className='btn btn-primary'> manager </button>
            <button onClick={() => window.location.href = '/'} className='btn btn-primary'> Home </button>
            <button onClick={() => window.location.href = '/'} className='btn btn-primary'> login (WIP) </button>
          </nav>
          <div className="min-vh-100 transition-all">
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Routes>
                <Route path="/" index element={<Customer />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/cashier" element={<Cashier />} />
                <Route path="/manager" element={<Manager />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </QueryClientProvider>
      </ThemeContext.Provider>
    );
}