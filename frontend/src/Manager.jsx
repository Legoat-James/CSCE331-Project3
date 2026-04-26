import { useGet } from './hooks/useApi.js';
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
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend
);


/* Note: This manager view is the Main Manager View.
  This will include the sales analytics and reports, but the employees, 
  menu items, inventory, and recipe builder will be navigated to from the navbar to other jsx files
*/

export default function Manager() {
  const isLoggedIn = !!localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user'));

  // State management for different sections
  const [activeView, setActiveView] = useState('dashboard');
  const queryClient = useQueryClient();

  //Todo: get real sales data from a timeframe specified
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: []
  });

  // Date range state for Sales report
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Default to 7 days ago
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]; // Default to today
  });

  // Hour selection for single-day reports
  const [startHour, setStartHour] = useState('00');
  const [endHour, setEndHour] = useState('23');
  const isSingleDay = startDate === endDate;

  const { data: recentOrders, isPending, error, isSuccess } = useGet(['recent-orders'], '/api/orders/recent', {
    retry: true,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const [timeframe, setTimeframe] = useState('Hour');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [salesReportMode, setSalesReportMode] = useState('quantity'); // 'quantity', 'revenue', or 'netRevenue'
  const [reportLoading, setReportLoading] = useState(false);
  const [zReportGenerated, setZReportGenerated] = useState(false); // Track if Z report has been generated for the day
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
              onClick={() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/';
              }}
            >
              Sign Out
            </Button>
          </Nav>
        </Container>
      </Navbar>
    );
  };

  if (!isLoggedIn || !user || !user.is_manager) {
    return (
      <Container className="mt-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Alert variant="danger">
          <Alert.Heading>Access Denied</Alert.Heading>
          <p>You must have Manager privileges and be logged in to access this view.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button onClick={() => window.location.href = '/'}>Back to Portal</Button>
          </div>
        </Alert>
      </Container>
    );
  }

  //Render report data
  const renderReportData = () => {
    if (reportLoading) {
      return <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>;
    }
    else if (reportData) {
      //check the cases to determine what type of report data to show:
      switch (selectedReport) {
        case 'X':
          console.log('Rendering X Report data:', reportData);
          // Calculate totals for the day
          const totalX = reportData.reduce((acc, hourData) => ({
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
                  <td className="text-end">{totalX.drinks_sold}</td>
                  <td className="text-end">{totalX.food_sold}</td>
                  <td className="text-end">{totalX.total_items_sold}</td>
                  <td className="text-end">${totalX.total_sales_amount.toFixed(2)}</td>
                  <td className="text-end">{totalX.total_transactions}</td>
                </tr>
              </tfoot>
            </Table>
          );
        case 'Z':
          console.log('Rendering Z Report data:', reportData);
          // Calculate totals for the day
          try {
            if (zReportGenerated) {
              return <div className="text-center text-danger">Z Report has already been generated for today. Totals have not been reset. Please contact support if you believe this is an error.</div>;
            }
            const totalZ = reportData.reduce((acc, hourData) => ({
              drinks_sold: acc.drinks_sold + (hourData.drinks_sold || 0),
              food_sold: acc.food_sold + (hourData.food_sold || 0),
              total_items_sold: acc.total_items_sold + (hourData.total_items_sold || 0),
              total_sales_amount: acc.total_sales_amount + (parseFloat(hourData.total_sales_amount) || 0),
              total_transactions: acc.total_transactions + (hourData.total_transactions || 0),
            }), { drinks_sold: 0, food_sold: 0, total_items_sold: 0, total_sales_amount: 0, total_transactions: 0 });
            //now set the zReportGenerated to true to prevent multiple generations in the same day
            setZReportGenerated(true);
            return (
              <Table striped hover responsive size="sm" className="dashboard-table">
                <thead>
                  <tr>
                    <th className="text-start"></th>
                    <th className="text-end">Drinks Sold</th>
                    <th className="text-end">Food Sold</th>
                    <th className="text-end">Total Items</th>
                    <th className="text-end">Sales ($)</th>
                    <th className="text-end">Transactions</th>
                  </tr>
                </thead>
                <tfoot>
                  <tr className="fw-bold table-secondary">
                    <td className="text-start">Today's Totals</td>
                    <td className="text-end">{totalZ.drinks_sold}</td>
                    <td className="text-end">{totalZ.food_sold}</td>
                    <td className="text-end">{totalZ.total_items_sold}</td>
                    <td className="text-end">${totalZ.total_sales_amount.toFixed(2)}</td>
                    <td className="text-end">{totalZ.total_transactions}</td>
                  </tr>
                </tfoot>
              </Table>
            );
          } catch (err) {
            console.error('Error calculating Z Report totals:', err);
            return <div>Error calculating Z Report totals. Please try again later.</div>;
          }

        case 'Sales':
          const isMoneyMode = salesReportMode === 'revenue' || salesReportMode === 'netRevenue';
          let columnHeader, dataArray;

          if (salesReportMode === 'revenue') {
            columnHeader = 'Gross Revenue';
            dataArray = reportData.revenue;
          } else if (salesReportMode === 'netRevenue') {
            columnHeader = 'Net Revenue';
            dataArray = reportData.netRevenue;
          } else {
            columnHeader = 'Quantity Sold';
            dataArray = reportData.quantities;
          }

          const total = dataArray?.reduce((sum, val) => sum + val, 0) || 0;
          return (
            <Table striped bordered hover size="sm" className="report-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th className="text-end">{columnHeader}</th>
                </tr>
              </thead>
              <tbody>
                {reportData.labels && reportData.labels.map((label, index) => (
                  <tr key={index}>
                    <td>{label}</td>
                    <td className="text-end">
                      {isMoneyMode ? `$${dataArray[index]?.toFixed(2)}` : dataArray[index]}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="table-dark">
                  <td><strong>Total</strong></td>
                  <td className="text-end">
                    <strong>{isMoneyMode ? `$${total.toFixed(2)}` : total}</strong>
                  </td>
                </tr>
              </tfoot>
            </Table>
          );
        default:
          return <div>Unknown report type.</div>;
      }
    }
    else {
      return <div>No report data to display.</div>;
    }
  }

  // TODO: Implement the X Report, Z Report, and Sales Report generation logic
  const generateReport = useCallback(async (type, options = {}) => {
    setSelectedReport(type);
    setReportLoading(true);

    try {
      switch (type) {
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

          // First, check if Z report was already generated by calling /api/reports/z
          try {
            await apiClient('/api/reports/z');
            // If successful, Z report was not yet generated - now fetch the data
            const zReportData = await queryClient.fetchQuery({
              queryKey: ['z-report-fetch'],
              queryFn: () => apiClient('/api/reports/x'),
              staleTime: 0, // Always fetch fresh for Z report
            });
            console.log('Z Report data:', zReportData);
            setReportData(zReportData);
          } catch (zError) {
            // Check if error is because Z report was already generated
            if (zError.message?.includes('already been generated') || zError.status === 400) {
              alert('Z report has already been generated for today. Totals have not been reset. Please contact support if you believe this is an error.');
            } else {
              throw zError; // Re-throw other errors to be handled by outer catch
            }
          }
          break;

        case 'Sales':
          console.log('Generating Sales Report...');
          //TODO: Given a time window, display the sales by item from the order history.
          //Should probably use a calendar type of view to select start and end date

          const { startDate: start, endDate: end, startHour: sHour, endHour: eHour } = options;
          let salesUrl = `/api/reports/sales?startDate=${start}&endDate=${end}`;
          if (start === end && sHour && eHour) {
            salesUrl += `&startHour=${sHour}&endHour=${eHour}`;
          }
          const salesReportData = await queryClient.fetchQuery({
            queryKey: ['sales-report', start, end, sHour, eHour],
            queryFn: () => apiClient(salesUrl),
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

  // Update chart data when salesReportMode or reportData changes
  useEffect(() => {
    if (reportData && reportData.labels && reportData.revenue) {
      let label, data, backgroundColor, borderColor;

      if (salesReportMode === 'revenue') {
        label = 'Gross Revenue ($)';
        data = reportData.revenue;
        backgroundColor = 'rgba(255, 159, 64, 0.6)';
        borderColor = 'rgb(255, 159, 64)';
      } else if (salesReportMode === 'netRevenue') {
        label = 'Net Revenue ($)';
        data = reportData.netRevenue;
        backgroundColor = 'rgba(75, 192, 75, 0.6)';
        borderColor = 'rgb(75, 192, 75)';
      } else {
        label = 'Quantity Sold';
        data = reportData.quantities;
        backgroundColor = 'rgba(75, 192, 192, 0.6)';
        borderColor = 'rgb(75, 192, 192)';
      }

      setSalesData({
        labels: reportData.labels,
        datasets: [
          {
            label,
            data,
            backgroundColor,
            borderColor,
            borderWidth: 1,
          },
        ],
      });
    }
  }, [salesReportMode, reportData]);

  const renderRecentOrders = (orders) => {
    console.log('Rendering recent orders:', orders);
    if (isPending) {
      return <Spinner animation="border" role="status">
        <span className="visually-hidden text-center">Loading...</span>
      </Spinner>;
    }
    else if (isSuccess && orders.length === 0) {
      return <div>No recent orders found.</div>;
    }
    else if (isSuccess && orders.length > 0) {
      console.log('Successfully loaded recent orders:', orders);
      return (
        <Row className="g-2">
          {orders.map((order) => (
            <Col xs={12} md={6} xl={4} key={order.orderId}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Order #{order.orderId}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{new Date(order.timestamp).toLocaleString()}</Card.Subtitle>
                  <Card.Text>
                    Total: ${parseFloat(order.orderTotal).toFixed(2)}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      );
    }
    else if (error) {
      return <div>Error loading recent orders: {error.message}</div>;
    }
    else {
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
        text: `Sales by Item - ${startDate}${startDate !== endDate ? ` to ${endDate}` : ''}`,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Menu Item',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: salesReportMode === 'revenue' ? 'Gross Revenue ($)' : salesReportMode === 'netRevenue' ? 'Net Revenue ($)' : 'Quantity Sold',
        },
      },
    },
  }), [startDate, endDate, salesReportMode]);

  // Dashboard Content - memoized to prevent unnecessary re-renders and scroll resets
  const dashboardContent = useMemo(() => (
    <div className="dashboard-content">
      {/* Analytics, Controls, and Reports Row */}
      <Row className="g-3 mb-4">
        {/* Sales Analytics - Sets the height standard for this row */}
        <Col lg={9}>
          <Card className="dashboard-card h-100">
            <Card.Header className="dashboard-card-header">
              <h5 className="mb-0">Sales Analytics</h5>
            </Card.Header>
            <Card.Body className="dashboard-card-body">
              <Bar data={salesData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>

        {/* Date Range Controls */}
        <Col lg={3}>
          <Card className="dashboard-card h-100">
            <Card.Header className="dashboard-card-header">
              <h6 className="mb-0">Sales Report Date Range</h6>
            </Card.Header>
            <Card.Body className="dashboard-card-body d-flex flex-column">
              <Form.Group className="mb-2">
                <Form.Label className="small mb-1">Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                  size="sm"
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="small mb-1">End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
                  size="sm"
                />
              </Form.Group>
              {isSingleDay && (
                <>
                  <Row className="mb-2">
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className="small mb-1">Start</Form.Label>
                        <Form.Select
                          value={startHour}
                          onChange={(e) => setStartHour(e.target.value)}
                          size="sm"
                        >
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0');
                            const displayHour = i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`;
                            return <option key={hour} value={hour} disabled={parseInt(hour) > parseInt(endHour)}>{displayHour}</option>;
                          })}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className="small mb-1">End</Form.Label>
                        <Form.Select
                          value={endHour}
                          onChange={(e) => setEndHour(e.target.value)}
                          size="sm"
                        >
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0');
                            const displayHour = i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`;
                            return <option key={hour} value={hour} disabled={parseInt(hour) < parseInt(startHour)}>{displayHour}</option>;
                          })}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </>
              )}
              <Form.Group className="mb-2">
                <Form.Label className="small mb-1">Mode</Form.Label>
                <div className="d-flex flex-column gap-1">
                  <Button
                    size="sm"
                    variant={salesReportMode === 'quantity' ? 'primary' : 'outline-primary'}
                    onClick={() => setSalesReportMode('quantity')}
                  >
                    Qty
                  </Button>
                  <Button
                    size="sm"
                    variant={salesReportMode === 'revenue' ? 'primary' : 'outline-primary'}
                    onClick={() => setSalesReportMode('revenue')}
                  >
                    Gross
                  </Button>
                  <Button
                    size="sm"
                    variant={salesReportMode === 'netRevenue' ? 'primary' : 'outline-primary'}
                    onClick={() => setSalesReportMode('netRevenue')}
                  >
                    Net
                  </Button>
                </div>
              </Form.Group>
              <Button
                variant="primary"
                className="w-100 dashboard-btn mt-3 mb-3"
                onClick={() => generateReport('Sales', { startDate, endDate, startHour, endHour })}
                disabled={!startDate || !endDate}
              >
                Generate Sales Report
              </Button>
              <hr className="my-2" />
              <ButtonGroup vertical className="w-100 mt-2">
                <Button
                  variant="outline-success"
                  className="mb-2 dashboard-btn"
                  onClick={() => generateReport('X')}
                >
                  Generate X Report
                </Button>
                <Button
                  variant="outline-success"
                  className="dashboard-btn"
                  onClick={() => generateReport('Z')}
                >
                  Generate Z Report
                </Button>
              </ButtonGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Secondary Row for Recent Orders and Report Data */}
      <Row className="g-3 mb-4">
        {/* Recent Orders - Takes 30% */}
        <Col style={{ flex: '0 0 30%' }} className="d-flex">
          <Card className="dashboard-card h-100 w-100 d-flex flex-column">
            <Card.Header className="dashboard-card-header flex-shrink-0">
              <h5 className="mb-0">Recent Orders</h5>
            </Card.Header>
            <Card.Body className="dashboard-card-body flex-grow-1" style={{ overflowY: 'auto', maxHeight: '50vh', minHeight: 0, paddingBottom: '1rem' }}>
              <ListGroup variant="flush" className="dashboard-list h-100">
                {renderRecentOrders(recentOrders || [])}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Report Data Output - Takes 70% */}
        <Col style={{ flex: '0 0 70%' }}>
          <Card className="dashboard-card h-100">
            <Card.Header className="dashboard-card-header flex-shrink-0">
              <h5 className="mb-0">Report Data</h5>
            </Card.Header>
            <Card.Body className="dashboard-card-body flex-grow-1" style={{ overflowY: 'auto', maxHeight: '50vh', minHeight: 0 }}>
              {renderReportData()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  ), [salesData, chartOptions, timeframe, recentOrders, isPending, error, isSuccess, generateReport, selectedReport, reportData, reportLoading, startDate, endDate, startHour, endHour, isSingleDay, salesReportMode]);

  // Render active view based on state
  const renderActiveView = () => {
    switch (activeView) {
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
      <Container fluid className="manager-view py-4 px-md-5">
        {renderActiveView()}
      </Container>
    </>
  );
}