import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Routes, Route, useLocation } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { Navbar } from 'react-bootstrap';
import Portal from './Portal';
import Customer from './Customer';
import { TranslationProvider } from './contexts/TranslationContext';
import { ThemeContext } from './contexts/ThemeContext';
import NotFound from './NotFound';
import Cashier from './Cashier';
import Manager from './Manager';
import Login from './Login';
import MenuBoard from './MenuBoard';
import Kitchen from './Kitchen';
import AuthRoute from './components/AuthRoute';

const queryClient = new QueryClient();


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
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'standard');
    const [textSize, setTextSize] = useState('normal'); // 'normal', 'large', 'xlarge'
    const [magnifyScreen, setMagnifyScreen] = useState(false); //true or false
    //added line to track if signed in yet.
    const [signedIn, setSignedIn] = useState(false);
    const location = useLocation();

    const scrollZoomContainer = useRef(null);
    
    // Check if we're on the portal page
    const isPortalPage = location.pathname === '/';
    
    useEffect(() => {
        // Apply the theme to the HTML element for Bootstrap 5.3+
        if(theme == 'high-contrast'){
          document.body.classList.add('theme-high-contrast');
        }else{
          document.body.classList.remove('theme-high-contrast');
        }
        localStorage.setItem('theme', theme);

        //handle text resizing
        const htmlElement = document.documentElement;
        htmlElement.classList.remove('text-large', 'text-xlarge');
        if(textSize === "large"){
          htmlElement.classList.add("text-large");
        }
        if(textSize === "xlarge"){
          htmlElement.classList.add("text-xlarge")
        }

      

  }, [theme, textSize]);

  useEffect(()=>{
    scrollZoomContainer.current.scrollTop = scrollZoomContainer.current.scrollHeight;
  }, [magnifyScreen])

    return (
      <ThemeContext.Provider value={{ theme, setTheme, textSize, setTextSize, magnifyScreen, setMagnifyScreen }}>
        <QueryClientProvider client={queryClient}>
          {/* Only show full nav on portal}
          {/* <nav>
            {!isPortalPage && (
              <button onClick={() => window.location.href = '/'} className='btn btn-primary'> Home </button>
            )}
          </nav> */}
          <div className="h-100 transition-all scroll-container" style={{overflow: "auto"}} ref={scrollZoomContainer}>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Routes>
                <Route path="/" index element={<Portal />} />
                <Route path="/customer" element={<TranslationProvider><Customer /></TranslationProvider>} />
                <Route path="/kitchen" element={<Kitchen />} />
                <Route path="/cashier" element={
                  <AuthRoute allowedRoles={["Manager", "Cashier"]}>
                    <Cashier />
                  </AuthRoute>
                  } />
                <Route path="/manager" element={
                  <AuthRoute allowedRoles={["Manager"]}>
                    <Manager />
                  </AuthRoute>
                  } />
                <Route path="/menuboard" element={<MenuBoard />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </QueryClientProvider>
      </ThemeContext.Provider>
    );
}