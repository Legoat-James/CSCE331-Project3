import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Card} from 'react-bootstrap';
import { loginUser, useIsAuthenticated, logoutUser } from './api/authAPI.js';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useMutate } from './hooks/useApi.js';
import { useNavigate } from 'react-router';
import './Login.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Check if user is currently logged in via server session
    const { user: authUser, role: isManager, isSuccess: authSuccess, isPending: authPending } = useIsAuthenticated();
    
    const [displayNavOptions, setDisplayNavOptions] = useState(false);
    const loginMutation = useMutate('/api/employee/login', 'POST', ['auth']);

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const navigate = useNavigate();

    async function googleLogin(credentialResponse){
        const googleToken = credentialResponse.credential;
        try{
            loginMutation.mutate({
                googleToken: googleToken
            });
        }catch(err){
            console.error("Error during login:", err);
        }
    }
    
    useEffect(()=>{
        if(loginMutation.isSuccess){
            const user = loginMutation.data?.user;
            
            if(!user?.is_manager){
                setSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    navigate("/cashier");
                }, 1500);
                return;
            }
            setSuccess('Welcome Manager! Choose a view.');
            setDisplayNavOptions(true);
        }else if(loginMutation.isError){
            setError(loginMutation.error.message);
        }
    }, [loginMutation.data, loginMutation.isSuccess, loginMutation.isError, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        //Clear previous messages
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            //Call the api
            const response = await loginUser(username, password);

            if(!response.user.is_manager){
                setSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    navigate("/cashier");
                }, 1500);
                return;
            }
            setSuccess('Welcome Manager! Choose a view.');
            setDisplayNavOptions(true);

        } catch (err){
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    if(authPending){
        return <div>Loading authentication status...</div>;
    }

    if(authSuccess && authUser){
        return (
        <div className="login-page">
            <Container>
                <div className="row justify-content-center">
                    <div className="col-12 d-flex justify-content-center">
                        <Card className="login-card">
                            <Card.Body className="logout-container">
                                <Card.Title className="login-title">
                                    <h2>Account Access</h2>
                                </Card.Title>
                                <p>You are already logged in to the system as {authUser.username || 'Employee'}.</p>
                                <div className="d-flex flex-column align-items-center gap-3 mt-3 w-100">
                                    {isManager && (
                                        <>
                                            <button className="login-btn" style={{width: '100%'}} onClick={() => navigate("/manager")}>
                                                Manager View
                                            </button>
                                            <button className="login-btn" style={{width: '100%'}} onClick={() => navigate("/cashier")}>
                                                Cashier View
                                            </button>
                                        </>
                                    )}
                                    <button className="logout-btn" style={{width: '100%'}} onClick={async ()=>{
                                        await logoutUser();
                                        window.location.href = '/';
                                    }}>
                                        Sign Out
                                    </button>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </Container>
        </div>
        );
    }
    else{
        return (
        <GoogleOAuthProvider clientId={googleClientId}>
        <div className="login-page">
            <Container>
                <div className="row justify-content-center">
                    <div className="col-12 d-flex justify-content-center">
                        <Card className="login-card">
                            <Card.Body>
                                <Card.Title className="login-title">
                                    <h2>Welcome Back</h2>
                                </Card.Title>
                                
                                {error && <Alert variant="danger">{error}</Alert>}
                                {success && <Alert variant="success">{success}</Alert>}
                                
                                {!displayNavOptions &&<>

                                    <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="login-form-label">Username</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Enter your username"
                                            required
                                            disabled={loading}
                                            className="login-form-control"
                                        />
                                    </Form.Group>
                                    
                                    <Form.Group className="mb-3">
                                        <Form.Label className="login-form-label">Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            required
                                            disabled={loading}
                                            className="login-form-control"
                                        />
                                    </Form.Group>
                                    
                                    <div className="d-grid mt-4">
                                        <button 
                                            type="submit" 
                                            className="login-btn"
                                            disabled={loading}
                                        >
                                            {loading ? 'Signing in...' : 'Sign In'}
                                        </button>
                                    </div>
                                </Form>
                                
                                <div className="google-login-container">
                                    <GoogleLogin 
                                        onSuccess={googleLogin}
                                        onError={() => console.log('Google Login Failed')}
                                    />
                                </div>
                                </>
                                }
                                {displayNavOptions &&
                                    <div className='d-flex flex-column align-items-center'>
                                        <button className='login-btn' onClick={()=>navigate("/cashier")}>
                                            Cashier View
                                        </button>
                                         <button className='login-btn' onClick={()=>navigate("/manager")}>
                                            Manager View
                                        </button>
                                    </div>
                                }
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </Container>
        </div>
        </GoogleOAuthProvider>
    );
    }
    
}