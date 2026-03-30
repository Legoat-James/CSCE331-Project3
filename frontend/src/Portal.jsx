import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import './Portal.css';

export default function Portal() {
  const sections = [
    {
      id: 'customer',
      title: 'Customer',
      description: 'Order food and drinks',
      icon: '🛒',
      path: '/customer',
    },
    {
      id: 'cashier',
      title: 'Cashier',
      description: 'Process transactions',
      icon: '💳',
      path: '/cashier',
    },
    {
      id: 'manager',
      title: 'Manager',
      description: 'Manage menu and staff',
      icon: '📊',
      path: '/manager',
    },
    {
      id: 'menuboard',
      title: 'Menu Board',
      description: 'Display menu items',
      icon: '📺',
      path: '/menuboard',
    },
  ];

  return (
    <div className="portal-page">
      <Container className="portal-container">
        <div className="portal-header text-center mb-5">
          <h1 className="portal-title mb-2">Restaurant POS System</h1>
          <p className="portal-subtitle">Select a module to get started</p>
        </div>

        <Row className="g-4 justify-content-center">
          {sections.map((section) => (
            <Col key={section.id} md={6} lg={5} xl={4} className="d-flex">
              <Card
                as="button"
                className="portal-card w-100 border-0"
                onClick={() => (window.location.href = section.path)}
              >
                <Card.Body className="d-flex flex-column align-items-center text-center py-5">
                  <div className="portal-icon mb-3">{section.icon}</div>
                  <Card.Title className="portal-card-title mb-2">{section.title}</Card.Title>
                  <Card.Text className="portal-card-description text-muted">{section.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}
