import React, { useState } from 'react';
import { Row, Col, Card, Button, Table, Form, Badge } from 'react-bootstrap';

import { useGet } from '../../hooks/useApi';
import apiClient from '../../api/client_config.js';

export default function MenuEditor() {
  /*TODO: Change from beign constant to actually use the api endpoint from backend */
    const { data: menuItems, isLoading, error } = useGet(['menu-items'], '/api/menu/manager-all', {
      retry: false
    });

    const renderMenuItems = (items) => {
        // Split items into 2 columns
        const midpoint = Math.ceil(items.length / 2);
        const leftColumn = items.slice(0, midpoint);
        const rightColumn = items.slice(midpoint);
    
        const renderColumn = (columnItems) => (
          <Col xs={6} className="d-flex flex-column gap-2">
            {columnItems.map((item) => (
              <div 
                key={item.menu_item_id || item.id} 
                className="menu-item-row d-flex justify-content-between align-items-center px-3 py-2 rounded-3"
              >
                <span className="item-name fw-semibold">{item.name}</span>
              </div>
            ))}
          </Col>
        );
    
        return (
          <Row>
            {renderColumn(leftColumn)}
            {renderColumn(rightColumn)}
          </Row>
        );
      };

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
                  {renderMenuItems(menuItems || [])}
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
                    {/*TODO populate with menu items */}
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
                  Clear Form
                </Button>
              </Form>
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
                    {/*TODO populate with menu items */}
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
