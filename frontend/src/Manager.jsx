import {useGet} from './hooks/useApi.js';
import { useMutate } from './hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect, useCallback, useMemo } from 'react';

import apiClient from './api/client_config.js';


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
  Spinner
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

// Import manager styles
import './Manager.css';

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
  const queryClient = useQueryClient();

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

  const {data: recentOrders, isPending, error, isSuccess} = useGet(['recent-orders'],'/api/orders/recent', {
    retry: true,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const [timeframe, setTimeframe] = useState('Hour');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
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

  //Render report data
  const renderReportData = () => {
    if(reportLoading) {
      return <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>;
    }
    else if(reportData) {
      //check the cases to determine what type of report data to show:
      switch(selectedReport) {
        case 'X':
          console.log('Rendering X Report data:', reportData);
          // Calculate totals for the day
          const totals = reportData.reduce((acc, hourData) => ({
            drinks_sold: acc.drinks_sold + (hourData.drinks_sold || 0),
            food_sold: acc.food_sold + (hourData.food_sold || 0),
            total_items_sold: acc.total_items_sold + (hourData.total_items_sold || 0),
            total_sales_amount: acc.total_sales_amount + (parseFloat(hourData.total_sales_amount) || 0),
            total_transactions: acc.total_transactions + (hourData.total_transactions || 0),
          }), { drinks_sold: 0, food_sold: 0, total_items_sold: 0, total_sales_amount: 0, total_transactions: 0 });

          return (
            <Table striped hover responsive size="sm" className="dashboard-table">
              <thead>
                <tr>
                  <th className="text-start">Hour</th>
                  <th className="text-end">Drinks Sold</th>
                  <th className="text-end">Food Sold</th>
                  <th className="text-end">Total Items</th>
                  <th className="text-end">Sales ($)</th>
                  <th className="text-end">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((hourData, index) => (
                  <tr key={index}>
                    <td className="text-start">{hourData.hour}</td>
                    <td className="text-end">{hourData.drinks_sold}</td>
                    <td className="text-end">{hourData.food_sold}</td>
                    <td className="text-end">{hourData.total_items_sold}</td>
                    <td className="text-end">${parseFloat(hourData.total_sales_amount).toFixed(2)}</td>
                    <td className="text-end">{hourData.total_transactions}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="fw-bold table-secondary">
                  <td className="text-start">Total</td>
                  <td className="text-end">{totals.drinks_sold}</td>
                  <td className="text-end">{totals.food_sold}</td>
                  <td className="text-end">{totals.total_items_sold}</td>
                  <td className="text-end">${totals.total_sales_amount.toFixed(2)}</td>
                  <td className="text-end">{totals.total_transactions}</td>
                </tr>
              </tfoot>
            </Table>
          );
        case 'Z':
          return <pre className="report-data">{JSON.stringify(reportData, null, 2)}</pre>;
        case 'Sales':
          return <pre className="report-data">{JSON.stringify(reportData, null, 2)}</pre>;
        default:
          return <div>Unknown report type.</div>;
      }
    }
    else {
      return <div>No report data to display.</div>;
    }
  }

  // TODO: Implement the X Report, Z Report, and Sales Report generation logic
  const generateReport = useCallback(async (type) => {
    setSelectedReport(type);
    setReportLoading(true);
    
    try {
      switch(type) {
        case 'X':
          console.log('Generating X Report...');
          /*TODO: Gives sales activites per hour for the current day of operation. 
          Managers usually run this report to determine whether the "rush" they felt was really a large sales volume or the "lull" they felt really had almost no sales. 
          You can do a web search on this, as it is an industry-standard. This report has no side effects and can be run as often as desired. Example types of totals include:
          sales
          returns
          voids
          discards
          payment methods
          */
          
          const xReportData = await queryClient.fetchQuery({
            queryKey: ['x-report'],
            queryFn: () => apiClient('/api/reports/x'),
            staleTime: 0, // Always fetch fresh
          });
          
          console.log('X Report data:', xReportData);
          setReportData(xReportData);
          
          break;
          
        case 'Z':
          console.log('Generating Z Report...');
          /* TODO: This report is similar to the X-Report, except it is run at the end of the day, when you close and will have no more customers. 
          It gives all the totals for the day and resets the totals to zero for the next day and the next set of X reports. 
          This report has side effects and should only be run once per day.

          Example types of totals include:
          sales and tax information
          payment methods
          total cash
          discounts, voids, and service charges
          employee signatures
          Key considerations for successfully completing this requirement include:
          Resetting the Z-report and X-report values in the database to zero after generating and displaying the Z-display.
          Only allowing the Z-report to be generated once a day.
          */
          
          const zReportData = await queryClient.fetchQuery({
            queryKey: ['z-report'],
            queryFn: () => apiClient('/api/reports/z'),
            staleTime: 0, // Always fetch fresh for Z report
          });
          
          console.log('Z Report data:', zReportData);
          setReportData(zReportData);
          break;
          
        case 'Sales':
          console.log('Generating Sales Report...');
          //TODO: Given a time window, display the sales by item from the order history.
          //Should probably use a calendar type of view to select start and end date
          
          const salesReportData = await queryClient.fetchQuery({
            queryKey: ['sales-report'],
            queryFn: () => apiClient('/api/reports/sales'),
            staleTime: 30000,
          });
          
          console.log('Sales Report data:', salesReportData);
          setReportData(salesReportData);
          break;
      }
    } catch (err) {
      console.error(`Error generating ${type} report:`, err);
      setReportData(null);
    } finally {
      setReportLoading(false);
    }

  }, [queryClient]);

  const renderRecentOrders = (orders) => {
    const renderColumn = (columnItems) => (
      <Col xs={6} className="d-flex flex-column gap-2">
        {/*Need to do a for loop through each item in the orders list */}
        {columnItems.map((order) => (
          <Card key={order.order_id} className="mb-2">
            <Card.Body>
              <Card.Title>Order #{order.order_id}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">{new Date(order.timestamp).toLocaleString()}</Card.Subtitle>
              <Card.Text>
                Total: ${parseFloat(order.order_total)}
              </Card.Text>
            </Card.Body>
          </Card>
        ))}
      </Col>
    );
    console.log('Rendering recent orders:', orders);
    if(isPending) {
      return <Spinner animation="border" role="status">
        <span className="visually-hidden .text-center">Loading...</span>
      </Spinner>;
    }
    else if(isSuccess && orders.length === 0) {
      return <div>No recent orders found.</div>;
    }
    else if(isSuccess && orders.length > 0) {
      console.log('Successfully loaded recent orders:', orders);
      //need to parse through orders list and show in nice format. Split into 2 columns if more than 5 orders. Show customer name, order total, timestamp, and order_id of order at minimum.
      if(orders.length > 5) {
        console.log('More than 5 recent orders, splitting into columns.');
        return (
          <Row>
            {renderColumn(orders.slice(0, Math.ceil(orders.length / 2)))}
            {renderColumn(orders.slice(Math.ceil(orders.length / 2)))}
          </Row>
        );
      }
      else{
        console.log('5 or fewer recent orders, showing in single column.');
        return (
          <Row>
            {renderColumn(orders)}
          </Row>
        );
      }
    }
    else if(error) {
      return <div>Error loading recent orders: {error.message}</div>;
    }
    else{
      return <div>Unexpected state while loading recent orders.</div>;
    }


  };




  // Chart options - memoized to prevent re-creation
  const chartOptions = useMemo(() => ({
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
  }), [timeframe]);

  // Dashboard Content - memoized to prevent unnecessary re-renders and scroll resets
  const dashboardContent = useMemo(() => (
    <div className="dashboard-content">
      {/* Sales Analytics Section */}
      <Row className="g-3 mb-4">
        <Col lg={10}>
          <Card className="dashboard-card h-100">
            <Card.Header className="dashboard-card-header">
              <h5 className="mb-0">Sales Analytics</h5>
            </Card.Header>
            <Card.Body className="dashboard-card-body">
              <Line data={salesData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2}>
          <Card className="dashboard-card h-100">
            <Card.Header className="dashboard-card-header">
              <h6 className="mb-0">Timeframe</h6>
            </Card.Header>
            <Card.Body className="dashboard-card-body d-flex flex-column justify-content-center">
              <ButtonGroup vertical className="w-100">
                {['Hour', 'Day', 'Week', 'Month'].map((period) => (
                  <Button
                    key={period}
                    variant={timeframe === period ? 'primary' : 'outline-primary'}
                    onClick={() => {
                      setTimeframe(period);
                      /* TODO: Fetch data for selected timeframe */
                    }}
                    className="mb-2 dashboard-btn"
                  >
                    {period}
                  </Button>
                ))}
              </ButtonGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Orders and Reports Section */}
      <Row className="g-3 mb-4">
        <Col lg={5}>
          <Card className="dashboard-card h-100">
            <Card.Header className="dashboard-card-header">
              <h5 className="mb-0">Recent Orders</h5>
            </Card.Header>
            <Card.Body className="dashboard-card-body">
              <ListGroup variant="flush" className="dashboard-list">
                {renderRecentOrders(recentOrders || [])}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3}>
          <Card className="dashboard-card h-100">
            <Card.Header className="dashboard-card-header">
              <h6 className="mb-0">Reports</h6>
            </Card.Header>
            <Card.Body className="dashboard-card-body d-flex flex-column justify-content-center">
              <ButtonGroup vertical className="w-100">
                <Button
                  variant="outline-success"
                  className="mb-2 dashboard-btn"
                  onClick={() => generateReport('X')}
                >
                  X Report
                </Button>
                <Button
                  variant="outline-success"
                  className="mb-2 dashboard-btn"
                  onClick={() => generateReport('Z')}
                >
                  Z Report
                </Button>
                <Button
                  variant="outline-success"
                  className="dashboard-btn"
                  onClick={() => generateReport('Sales')}
                >
                  Sales Report
                </Button>
              </ButtonGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="dashboard-card h-100">
            <Card.Header className="dashboard-card-header">
              <h6 className="mb-0">Report Data</h6>
            </Card.Header>
            <Card.Body className="dashboard-card-body">
              {renderReportData()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  ), [salesData, chartOptions, timeframe, recentOrders, isPending, error, isSuccess, generateReport, selectedReport, reportData, reportLoading]);

  // Render active view based on state
  const renderActiveView = () => {
    switch(activeView) {
      case 'dashboard':
        return dashboardContent;
      case 'employees':
        return <EmployeeList />;
      case 'inventory':
        return <InventoryTable />;
      case 'menu':
        return <MenuEditor />;
      case 'recipes':
        return <RecipeBuilder />;
      default:
        return dashboardContent;
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