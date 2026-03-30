import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Badge } from 'react-bootstrap';

export default function InventoryTable() {
  const [inventory] = useState([
    { id: 1, ingredient: 'Black Tea', quantity: 50, unit: 'lbs', cost: 25.00 },
    { id: 2, ingredient: 'Tapioca Pearls', quantity: 30, unit: 'lbs', cost: 45.00 },
    { id: 3, ingredient: 'Milk Powder', quantity: 25, unit: 'lbs', cost: 35.00 },
    { id: 4, ingredient: 'Sugar', quantity: 60, unit: 'lbs', cost: 20.00 }
  ]);

  return (
    <Row className="mb-4">
      <Col md={12}>
        <Card className="h-100">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5>Inventory Management</h5>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {/* TODO: Refresh inventory */}}
            >
              Refresh
            </Button>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col lg={8}>
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Ingredient</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th>Cost</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item.id}>
                        <td>{item.ingredient}</td>
                        <td>
                          <Badge bg={item.quantity < 20 ? 'danger' : 'success'}>
                            {item.quantity}
                          </Badge>
                        </td>
                        <td>{item.unit}</td>
                        <td>${item.cost.toFixed(2)}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {/* TODO: Restock item */}}
                          >
                            Restock
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>

              <Col lg={4}>
                <Card>
                  <Card.Header>Inventory Actions</Card.Header>
                  <Card.Body>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Restock Item</Form.Label>
                        <Form.Select>
                          <option>Select ingredient...</option>
                          {inventory.map((item) => (
                            <option key={item.id} value={item.id}>{item.ingredient}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Control type="number" placeholder="Restock amount" />
                      </Form.Group>
                      <Button
                        variant="success"
                        className="w-100"
                        onClick={() => {/* TODO: Process restock */}}
                      >
                        Confirm Restock
                      </Button>

                      <hr />

                      <h6>Add New Ingredient</h6>
                      <Form.Group className="mb-2">
                        <Form.Control type="text" placeholder="Ingredient name" />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Control type="number" placeholder="Initial stock" />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Control type="text" placeholder="Unit (lbs, oz, etc.)" />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Control type="number" step="0.01" placeholder="Cost per unit" />
                      </Form.Group>
                      <Button
                        variant="primary"
                        className="w-100"
                        onClick={() => {/* TODO: Add new ingredient */}}
                      >
                        Add Ingredient
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
