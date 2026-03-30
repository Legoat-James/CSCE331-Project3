import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ButtonGroup } from 'react-bootstrap';
import './MenuBoard.css';
import { useGet } from './hooks/useApi';

const MenuBoard = () => {
  // Fetch menu items from API
  const { data: menuItems, isLoading, error } = useGet(['menu-board'], '/api/menu/all', {
    retry: false
  });

  // Filter beverages and food from API data
  const beverages = menuItems?.filter(item => {
    const name = item.name?.toLowerCase() || '';
    return item.is_active && 
           item.category?.toLowerCase() === 'drink' &&
           !name.includes('small') && 
           !name.includes('large');
  }) || [];

  const foods = menuItems?.filter(item => 
    item.is_active && item.category?.toLowerCase() === 'food'
  ) || [];

  // Keep animated items hardcoded for now
  const cyclingItems = [
    { id: 7, name: 'Mango Smoothie', category: 'Drinks', price: '$5.49', image: '🥭' },
    { id: 8, name: 'Boba Pearls', category: 'Topping', price: '$+1.00', image: '⚫' },
    { id: 9, name: 'Summer Special', category: 'Featured', price: '$7.99', image: '☀️' },
    { id: 10, name: 'Lychee Tea', category: 'Drinks', price: '$5.99', image: '🍑' },
  ];

  const [currentPage, setCurrentPage] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  useEffect(() => {
    const itemInterval = setInterval(() => {
      setCurrentItemIndex((prev) => (prev + 1) % cyclingItems.length);
    }, 5000);

    return () => clearInterval(itemInterval);
  }, [cyclingItems.length]);

  const currentItem = cyclingItems[currentItemIndex];

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
            <span className="item-price fw-bold">${parseFloat(item.cost).toFixed(2)}</span>
          </div>
        ))}
      </Col>
    );

    return (
      <Row className="flex-grow-1 g-3">
        {renderColumn(leftColumn)}
        {renderColumn(rightColumn)}
      </Row>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <Container fluid className="menu-board-container min-vh-100 d-flex justify-content-center align-items-center">
        <h2 className="display-title">Loading menu...</h2>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container fluid className="menu-board-container min-vh-100 d-flex justify-content-center align-items-center">
        <h2 className="display-title text-danger">Error loading menu</h2>
      </Container>
    );
  }

  return (
    <Container fluid className="menu-board-container min-vh-100 vh-100 d-flex flex-column overflow-hidden p-0">
      {/* Page Selection Controls */}
      <div className="page-controls d-flex justify-content-center flex-wrap gap-3 py-3 px-4">
        <ButtonGroup>
          {['Beverages', 'Featured', 'Food'].map((label, idx) => (
            <Button
              key={label}
              variant={currentPage === idx ? 'primary' : 'outline-primary'}
              className={`control-btn px-4 py-2 fw-semibold rounded-pill ${currentPage === idx ? 'active' : ''}`}
              onClick={() => setCurrentPage(idx)}
            >
              {label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* Page 0: Beverages */}
      {currentPage === 0 && (
        <Container fluid className="display-section flex-grow-1 d-flex flex-column p-4 overflow-auto">
          <h2 className="display-title display-4 fw-bold text-center mb-4">BEVERAGES</h2>
          {renderMenuItems(beverages)}
        </Container>
      )}

      {/* Page 1: Featured Today */}
      {currentPage === 1 && (
        <Container
          fluid
          className="display-section center-display flex-grow-1 d-flex flex-column justify-content-center align-items-center p-4 position-relative"
        >
          <h2 className="display-title display-4 fw-bold text-center mb-4">FEATURED TODAY</h2>
          <div className="animated-item d-flex flex-column align-items-center gap-3">
            <span className="item-emoji">{currentItem.image}</span>
            <h3 className="animated-item-name display-5 fw-bold text-center mb-0">
              {currentItem.name}
            </h3>
            <p className="animated-item-category fs-4 mb-0">{currentItem.category}</p>
            <p className="animated-item-price display-6 fw-bold mb-0">{currentItem.price}</p>
            <div className="dots-indicator d-flex gap-3 mt-3">
              {cyclingItems.map((_, idx) => (
                <span
                  key={idx}
                  className={`dot rounded-circle ${idx === currentItemIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>
        </Container>
      )}

      {/* Page 2: Food */}
      {currentPage === 2 && (
        <Container fluid className="display-section flex-grow-1 d-flex flex-column p-4 overflow-auto">
          <h2 className="display-title display-4 fw-bold text-center mb-4">FOOD</h2>
          {renderMenuItems(foods)}
        </Container>
      )}
    </Container>
  );
};

export default MenuBoard;
