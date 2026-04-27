import { useState } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import './Portal.css';
import { useIsAuthenticated } from './api/authAPI.js';

export default function Portal() {
  const [errorMsg, setErrorMsg] = useState('');
  const { user, isSuccess: authSuccess } = useIsAuthenticated();
  const isLoggedIn = authSuccess && !!user;

  const sections = [
    {
      id: 'customer',
      title: 'Customer',
      description: 'Order food and drinks',
      icon: '🛒',
      path: '/customer',
      protected: false,
    },
    {
      id: 'cashier',
      title: 'Cashier',
      description: 'Process transactions',
      icon: '💳',
      path: '/cashier',
      protected: true,
      requiresManager: false,
    },
    {
      id: 'manager',
      title: 'Manager',
      description: 'Manage menu and staff',
      icon: '📊',
      path: '/manager',
      protected: true,
      requiresManager: true,
    },
    {
      id: 'menuboard',
      title: 'Menu Board',
      description: 'Display menu items',
      icon: '📺',
      path: '/menuboard',
      protected: false,
    },
    {
      id: 'kitchen',
      title: 'Kitchen',
      description: 'View pending kitchen orders',
      icon: '🍳',
      path: '/kitchen',
      protected: false,
    },
    {
      id: 'login',
      title: 'Login',
      description: isLoggedIn ? 'Logout of the system' : 'Login to the system',
      icon: '🔑',
      path: '/login',
      protected: false,
    },
  ];

  const handleNavigation = (section) => {
    if (section.protected && !isLoggedIn) {
      setErrorMsg(`You must be logged in to access the ${section.title} portal.`);
      return;
    }
    if (section.requiresManager && (!user || !user.is_manager)) {
      setErrorMsg('Access Denied: You must have Manager privileges to access the Manager portal.');
      return;
    }
    window.location.href = section.path;
  };

  return (
    <Container
      fluid
      className="portal-page min-vh-100 d-flex align-items-center justify-content-center py-4 px-3"
    >
      <Container className="portal-container">
        <header className="text-center mb-5">
          <h1 className="display-4 fw-bold portal-title mb-2">Restaurant POS System</h1>
          <p className="lead portal-subtitle">Select a module to get started</p>
          {errorMsg && <Alert variant="danger" className="mt-3">{errorMsg}</Alert>}
        </header>

        <Row className="g-4 justify-content-center">
          {sections.map((section) => (
            <Col key={section.id} xs={12} sm={6} lg={5} xl={3}>
              <Card
                as="button"
                className="portal-card w-100 h-100 border-2 rounded-4 shadow-sm"
                onClick={() => handleNavigation(section)}
              >
                <Card.Body className="d-flex flex-column align-items-center text-center py-5 px-4">
                  <span className="portal-icon display-3 mb-3">{section.icon}</span>
                  <Card.Title as="h2" className="h4 fw-bold portal-card-title mb-2">
                    {section.title}
                  </Card.Title>
                  <Card.Text className="text-muted portal-card-description">
                    {section.description}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </Container>
  );
}
