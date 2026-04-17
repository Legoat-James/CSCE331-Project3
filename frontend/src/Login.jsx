import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Card} from 'react-bootstrap';
import { loginUser } from './api/authAPI.js';
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
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [displayNavOptions, setDisplayNavOptions] = useState(false);
    const loginMutation = useMutate('/api/employee/login', 'POST', []);

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const navigate = useNavigate();

    async function googleLogin(credentialResponse){
        const googleToken = credentialResponse.credential;
        try{
            loginMutation.mutate({
                googleToken: googleToken
            })
        }catch(err){
            console.error("Error during login:", err);
        }
    }
    useEffect(()=>{
        if(loginMutation.isSuccess){
            if (loginMutation.data) {
                localStorage.setItem('authToken', loginMutation.data.token);
                localStorage.setItem('user', JSON.stringify(loginMutation.data.user));
            }
            const user = loginMutation.data?.user || JSON.parse(localStorage.getItem('user'));
            
            if(!user.is_manager){
                setSuccess('Google Login successful! Redirecting...');
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
    },[loginMutation.data, loginMutation.isSuccess, loginMutation.isError])

    const handleSubmit = async (e) => {
        e.preventDefault();
        //Clear previous messages
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            // Debug logging
            console.log('Login form submission:');
            console.log('Username type:', typeof username, 'Value:', username);
            console.log('Password type:', typeof password, 'Value:', password ? '[HIDDEN]' : password);

            //Call the api
            const response = await loginUser(username, password);

            //store auth info in localStorage
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
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
            //Handle error
            setError(err.message || 'Login failed. Please try again.');

        } finally {
            setLoading(false);
            console.log('Login process completed. isLoggedIn:', isLoggedIn);
        }
    };
    if(isLoggedIn){
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
                                <p>You are already logged in to the system.</p>
                                <button className="logout-btn" onClick={()=>{
                                    localStorage.removeItem('authToken');
                                    localStorage.removeItem('user');
                                    setIsLoggedIn(false);
                                    window.location.href = '/';
                                }}>
                                    Sign Out
                                </button>
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