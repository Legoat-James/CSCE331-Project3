import React, { useState } from 'react';
import { Row, Col, Card, Button, Table, Form, Badge } from 'react-bootstrap';

export default function MenuEditor() {
  const [menuItems] = useState([
    { id: 1, name: 'Classic Milk Tea', category: 'Tea', price: 4.99 },
    { id: 2, name: 'Taro Bubble Tea', category: 'Tea', price: 5.49 },
    { id: 3, name: 'Matcha Latte', category: 'Coffee', price: 5.99 }
  ]);

  return (
    <>
      <Row className="mb-4">
        <Col md={12}>
          <Card className="h-100">
            <Card.Header>
              <h5>Menu Management</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td><Badge bg="info">{item.category}</Badge></td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => {/* TODO: Edit menu item */}}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {/* TODO: Remove menu item */}}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6><Badge bg="success">Add Menu Item</Badge></h6>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Item Name</Form.Label>
                  <Form.Control type="text" placeholder="Enter item name" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select>
                    <option>Select category...</option>
                    <option>Tea</option>
                    <option>Coffee</option>
                    <option>Smoothie</option>
                    <option>Snack</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control type="number" step="0.01" placeholder="0.00" />
                </Form.Group>
                <Button
                  variant="success"
                  className="w-100"
                  onClick={() => {/* TODO: Add menu item */}}
                >
                  Add Item
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h6><Badge bg="danger">Remove Menu Item</Badge></h6>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Select Item</Form.Label>
                  <Form.Select>
                    <option>Select item to remove...</option>
                    {menuItems.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Button
                  variant="danger"
                  className="w-100 mb-2"
                  onClick={() => {/* TODO: Remove menu item */}}
                >
                  Remove Item
                </Button>
                <Button
                  variant="outline-secondary"
                  className="w-100"
                  onClick={() => {/* TODO: Clear form */}}
                >
                  Clear
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
