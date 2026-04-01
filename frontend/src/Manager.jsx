import {useGet} from './hooks/useApi.js';
import { useMutate } from './hooks/useApi';
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
  ButtonGroup,
  Navbar,
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

// Import manager components
import EmployeeList from './components/manager/EmployeeList';
import InventoryTable from './components/manager/InventoryTable';
import MenuEditor from './components/manager/MenuEditor';
import RecipeBuilder from './components/manager/RecipeBuilder';

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


/* Note: This manager view is the Main Manager View.
  This will include the sales analytics and reports, but the employees, 
  menu items, inventory, and recipe builder will be navigated to from the navbar to other jsx files
*/

export default function Manager() {
  // State management for different sections
    const [activeView, setActiveView] = useState('dashboard');
    const { data: menuItems, isLoading, error } = useGet(['menu-items'], '/api/menu/manager-all', {
      retry: false
    });
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
  //need to call backend api to get real data and set state accordingly
  //we used useGet to fetch menu items now actually have to load it and show.
const NavBar = () => {
    return (
      <Navbar bg="primary" variant="dark" sticky="top" className="mb-4 px-3">
        <Container fluid>
          <Navbar.Brand>Manager Dashboard</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link 
              onClick={() => setActiveView('dashboard')}
              className={activeView === 'dashboard' ? 'text-white fw-bold' : 'text-white-50'}
            >
              Dashboard
            </Nav.Link>
            <Nav.Link 
              onClick={() => setActiveView('employees')}
              className={activeView === 'employees' ? 'text-white fw-bold' : 'text-white-50'}
            >
              Employee List
            </Nav.Link>
            <Nav.Link 
              onClick={() => setActiveView('inventory')}
              className={activeView === 'inventory' ? 'text-white fw-bold' : 'text-white-50'}
            >
              Inventory Table
            </Nav.Link>
            <Nav.Link 
              onClick={() => setActiveView('menu')}
              className={activeView === 'menu' ? 'text-white fw-bold' : 'text-white-50'}
            >
              Menu Editor
            </Nav.Link>
            <Nav.Link 
              onClick={() => setActiveView('recipes')}
              className={activeView === 'recipes' ? 'text-white fw-bold' : 'text-white-50'}
            >
              Recipe Builder
            </Nav.Link>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => {/* TODO: Implement sign out functionality */}}
            >
              Sign Out
            </Button>
          </Nav>
        </Container>
      </Navbar>
    );
  };

  // const renderMenuItems = (items) => {
  //   // Split items into 2 columns
  //   const midpoint = Math.ceil(items.length / 2);
  //   const leftColumn = items.slice(0, midpoint);
  //   const rightColumn = items.slice(midpoint);

  //   const renderColumn = (columnItems) => (
  //     <Col xs={6} className="d-flex flex-column gap-2">
  //       {columnItems.map((item) => (
  //         <div 
  //           key={item.menu_item_id || item.id} 
  //           className="menu-item-row d-flex justify-content-between align-items-center px-3 py-2 rounded-3"
  //         >
  //           <span className="item-name fw-semibold">{item.name}</span>
  //         </div>
  //       ))}
  //     </Col>
  //   );

  //   return (
  //     <Row>
  //       {renderColumn(leftColumn)}
  //       {renderColumn(rightColumn)}
  //     </Row>
  //   );
  // };

  // TODO: Implement the X Report, Z Report, and Sales Report generation logic
  const generateReport = (type) => {
    setSelectedReport(type);
    //selectedReport is the type:
    switch(type) {
      case 'X':
        console.log('Generating X Report...');
        break;
      case 'Z':
        console.log('Generating Z Report...');
        // Generate Z Report
        break;
      case 'Sales':
        console.log('Generating Sales Report...');
        // Generate Sales Report
        break;

    }

  };


  const [recentOrders] = useState([
    { id: '#001', time: '2:30 PM', items: 3, total: '$15.47' },
    { id: '#002', time: '2:25 PM', items: 1, total: '$4.99' },
    { id: '#003', time: '2:20 PM', items: 2, total: '$10.98' },
    { id: '#004', time: '2:15 PM', items: 4, total: '$22.46' }
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

  // Dashboard Component
  const DashboardContent = () => (
    <>
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
                  onClick={() => {generateReport('X')}}
                >
                  X Report
                </Button>
                <Button
                  variant="outline-success"
                  className="mb-2"
                  onClick={() => {generateReport('Z')}}
                >
                  Z Report
                </Button>
                <Button
                  variant="outline-success"
                  onClick={() => {generateReport('Sales')}}
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
        <Col md={8}>
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

        
      </Row>



    

    </>
  );

  // Render active view based on state
  const renderActiveView = () => {
    switch(activeView) {
      case 'dashboard':
        return <DashboardContent />;
      case 'employees':
        return <EmployeeList />;
      case 'inventory':
        return <InventoryTable />;
      case 'menu':
        return <MenuEditor />;
      case 'recipes':
        return <RecipeBuilder />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <>
      <NavBar />
      <Container fluid className="manager-view p-4">
        {renderActiveView()}
      </Container>
    </>
  );
}