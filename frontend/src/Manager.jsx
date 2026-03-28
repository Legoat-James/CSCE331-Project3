import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  Badge,
  Nav,
  InputGroup,
  ListGroup,
  ButtonGroup
} from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Manager() {
  // State management for different sections
  const [salesData, setSalesData] = useState({
    labels: ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'],
    datasets: [{
      label: 'Sales ($)',
      data: [120, 190, 300, 500, 200, 300, 450, 600, 750],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4
    }]
  });

  const [timeframe, setTimeframe] = useState('Hour');
  const [selectedReport, setSelectedReport] = useState(null);

  // Sample data for tables
  const [menuItems] = useState([
    { id: 1, name: 'Classic Milk Tea', price: 4.99 },
    { id: 2, name: 'Taro Bubble Tea', price: 5.49 },
    { id: 3, name: 'Matcha Latte', price: 5.99 },
    { id: 4, name: 'Brown Sugar Milk Tea', price: 6.49 }
  ]);

  const [employees] = useState([
    { id: 1, name: 'John Doe', username: 'john.doe', isManager: true },
    { id: 2, name: 'Jane Smith', username: 'jane.smith', isManager: false },
    { id: 3, name: 'Mike Johnson', username: 'mike.j', isManager: false }
  ]);

  const [inventory] = useState([
    { id: 1, ingredient: 'Black Tea', quantity: 50, unit: 'lbs', cost: 25.00 },
    { id: 2, ingredient: 'Tapioca Pearls', quantity: 30, unit: 'lbs', cost: 45.00 },
    { id: 3, ingredient: 'Milk Powder', quantity: 25, unit: 'lbs', cost: 35.00 },
    { id: 4, ingredient: 'Sugar', quantity: 60, unit: 'lbs', cost: 20.00 }
  ]);

  const [recentOrders] = useState([
    { id: '#001', time: '2:30 PM', items: 3, total: '$15.47' },
    { id: '#002', time: '2:25 PM', items: 1, total: '$4.99' },
    { id: '#003', time: '2:20 PM', items: 2, total: '$10.98' },
    { id: '#004', time: '2:15 PM', items: 4, total: '$22.46' }
  ]);

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

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Sales Report - ${timeframe}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Container fluid className="manager-view p-4">
      {/* Header Navigation */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Nav className="justify-content-between align-items-center">
                <Nav.Item>
                  <h3 className="mb-0 text-primary">Manager Dashboard</h3>
                </Nav.Item>
                <Nav>
                  <Button
                    variant="outline-secondary"
                    className="me-2"
                    onClick={() => {/* TODO: Implement cashier view switch */}}
                  >
                    Switch to Cashier View
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => {/* TODO: Implement sign out functionality */}}
                  >
                    Sign Out
                  </Button>
                </Nav>
              </Nav>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sales Analytics Section */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header>
              <h5>Sales Analytics</h5>
            </Card.Header>
            <Card.Body>
              <Line data={salesData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2}>
          <Card className="h-100">
            <Card.Header>
              <h6>Timeframe</h6>
            </Card.Header>
            <Card.Body>
              <ButtonGroup vertical className="w-100">
                {['Hour', 'Day', 'Week', 'Month'].map((period) => (
                  <Button
                    key={period}
                    variant={timeframe === period ? 'primary' : 'outline-primary'}
                    onClick={() => {
                      setTimeframe(period);
                      /* TODO: Fetch data for selected timeframe */
                    }}
                    className="mb-2"
                  >
                    {period}
                  </Button>
                ))}
              </ButtonGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2}>
          <Card className="h-100">
            <Card.Header>
              <h6>Reports</h6>
            </Card.Header>
            <Card.Body>
              <ButtonGroup vertical className="w-100">
                <Button
                  variant="outline-success"
                  className="mb-2"
                  onClick={() => {/* TODO: Generate X Report */}}
                >
                  X Report
                </Button>
                <Button
                  variant="outline-success"
                  className="mb-2"
                  onClick={() => {/* TODO: Generate Z Report */}}
                >
                  Z Report
                </Button>
                <Button
                  variant="outline-success"
                  onClick={() => {/* TODO: Generate Sales Report */}}
                >
                  Sales Report
                </Button>
              </ButtonGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2}>
          <Card className="h-100">
            <Card.Header>
              <h6>Report Data</h6>
            </Card.Header>
            <Card.Body>
              <Table size="sm" responsive>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>$</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Milk Tea</td><td>15</td><td>74.85</td></tr>
                  <tr><td>Taro Tea</td><td>8</td><td>43.92</td></tr>
                  <tr><td>Matcha</td><td>5</td><td>29.95</td></tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Orders and Inventory Section */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Header>
              <h5>Recent Orders</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {recentOrders.map((order) => (
                  <ListGroup.Item key={order.id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{order.id}</strong>
                      <br />
                      <small className="text-muted">{order.time} • {order.items} items</small>
                    </div>
                    <Badge bg="success">{order.total}</Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
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

      {/* Manager Control Panel */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="text-center">
              <h4>Manager Control Panel</h4>
            </Card.Header>
          </Card>
        </Col>
      </Row>

      {/* Menu and Employee Management */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5>Menu Management</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>${item.price}</td>
                      <td>
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

        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5>Employee Management</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.id}</td>
                      <td>{emp.name}</td>
                      <td>{emp.username}</td>
                      <td>
                        <Badge bg={emp.isManager ? 'warning' : 'secondary'}>
                          {emp.isManager ? 'Manager' : 'Employee'}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {/* TODO: Remove employee */}}
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

      {/* Add/Remove Forms */}
      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Header>
              <h6><Badge bg="success">Add Menu Item</Badge></h6>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Control type="text" placeholder="Item name" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Select>
                    <option>Select category...</option>
                    <option>Tea</option>
                    <option>Coffee</option>
                    <option>Smoothie</option>
                    <option>Snack</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control type="number" step="0.01" placeholder="Price" />
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

        <Col md={3}>
          <Card>
            <Card.Header>
              <h6><Badge bg="danger">Remove Menu Item</Badge></h6>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
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

        <Col md={3}>
          <Card>
            <Card.Header>
              <h6><Badge bg="primary">Add Employee</Badge></h6>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-2">
                  <Form.Control type="text" placeholder="Employee name" />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Control type="text" placeholder="Username" />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Control type="password" placeholder="Password" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check type="checkbox" label="Manager privileges" />
                </Form.Group>
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={() => {/* TODO: Add employee */}}
                >
                  Add Employee
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card>
            <Card.Header>
              <h6><Badge bg="warning">Remove Employee</Badge></h6>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Select>
                    <option>Select employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Button
                  variant="warning"
                  className="w-100 mb-2"
                  onClick={() => {/* TODO: Remove employee */}}
                >
                  Remove Employee
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

      {/* Recipe Management */}
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
    </Container>
  );
}