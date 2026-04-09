import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Card} from 'react-bootstrap';
import { loginUser } from './api/authAPI.js';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useMutate } from './hooks/useApi.js';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loginMutation = useMutate('/api/employee/login', 'POST', []);

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
            alert("logged in with google");
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
            
            setSuccess('Login successful! Redirecting...');

            //redirect after successful login
            setTimeout(() => {
                window.location.href ='/';
                
                // if(response.user.is_manager) {
                //     window.location.href = '/Manager';
                // } else {
                //     window.location.href = '/Cashier';
                // }
            }, 1500);

        } catch (err){
            //Handle error
            setError(err.message || 'Login failed. Please try again.');

        } finally {
            setLoading(false);
        }
    };

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
        <Container className="mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <Card>
                        <Card.Body>
                            <Card.Title className="text-center mb-4">
                                <h2>Login</h2>
                            </Card.Title>
                            
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}
                            
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        required
                                        disabled={loading}
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        disabled={loading}
                                    />
                                </Form.Group>
                                
                                <div className="d-grid">
                                    <Button 
                                        type="submit" 
                                        variant="primary" 
                                        disabled={loading}
                                    >
                                        {loading ? 'Signing in...' : 'Sign In'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                    <GoogleLogin 
                        onSuccess={googleLogin}
                        onError={() => console.log('Google Login Failed')}
                    />
                </div>
            </div>
        </Container>
        </GoogleOAuthProvider>
    );
}