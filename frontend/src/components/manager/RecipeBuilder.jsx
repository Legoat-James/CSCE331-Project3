import React, { useState } from 'react';
import { Row, Col, Card, Button, Table, Form, Badge } from 'react-bootstrap';

export default function RecipeBuilder() {
  const [recipes] = useState([
    { id: 1, name: 'Classic Milk Tea', status: 'Active' },
    { id: 2, name: 'Taro Bubble Tea', status: 'Active' },
    { id: 3, name: 'Matcha Latte', status: 'Inactive' }
  ]);

  const [recipeIngredients] = useState([
    { ingredient: 'Black Tea', quantity: 2, unit: 'oz' },
    { ingredient: 'Milk Powder', quantity: 1, unit: 'oz' },
    { ingredient: 'Sugar', quantity: 0.5, unit: 'oz' }
  ]);

  const [inventory] = useState([
    { id: 1, ingredient: 'Black Tea' },
    { id: 2, ingredient: 'Tapioca Pearls' },
    { id: 3, ingredient: 'Milk Powder' },
    { id: 4, ingredient: 'Sugar' }
  ]);

  return (
    <Row className="mb-4">
      <Col md={4}>
        <Card className="h-100">
          <Card.Header>
            <h5>Recipe Management</h5>
          </Card.Header>
          <Card.Body>
            <Table striped hover>
              <thead>
                <tr>
                  <th>Drink Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((recipe) => (
                  <tr key={recipe.id}>
                    <td>{recipe.name}</td>
                    <td>
                      <Badge bg={recipe.status === 'Active' ? 'success' : 'secondary'}>
                        {recipe.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>

      <Col md={8}>
        <Card className="h-100">
          <Card.Header>
            <h5>Recipe Ingredients</h5>
          </Card.Header>
          <Card.Body>
            <Table striped hover className="mb-3">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recipeIngredients.map((ingredient, index) => (
                  <tr key={index}>
                    <td>{ingredient.ingredient}</td>
                    <td>{ingredient.quantity}</td>
                    <td>{ingredient.unit}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {/* TODO: Remove ingredient from recipe */}}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Row>
              <Col md={4}>
                <Form.Select className="mb-2">
                  <option>Select ingredient...</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>{item.ingredient}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Control
                  type="number"
                  step="0.1"
                  placeholder="Amount"
                  className="mb-2"
                />
              </Col>
              <Col md={2}>
                <Button
                  variant="outline-primary"
                  className="mb-2"
                  onClick={() => {/* TODO: Add ingredient to recipe */}}
                >
                  Add
                </Button>
              </Col>
              <Col md={3}>
                <Button
                  variant="success"
                  className="w-100 mb-2"
                  onClick={() => {/* TODO: Save complete recipe */}}
                >
                  Save Recipe
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
