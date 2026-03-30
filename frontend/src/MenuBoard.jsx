import React, { useState, useEffect } from 'react';
import './MenuBoard.css';

const MenuBoard = () => {
  // Dummy menu items
  const staticItems = {
    left: [
      { id: 1, name: 'Bubble Tea', category: 'Drinks', price: '$5.99' },
      { id: 2, name: 'Thai Tea', category: 'Drinks', price: '$4.99' },
      { id: 3, name: 'Matcha Latte', category: 'Drinks', price: '$6.49' },
    ],
    right: [
      { id: 4, name: 'Chicken Teriyaki', category: 'Food', price: '$9.99' },
      { id: 5, name: 'Veggie Poke Bowl', category: 'Food', price: '$8.99' },
      { id: 6, name: 'Shrimp Tempura', category: 'Food', price: '$10.99' },
    ],
  };

  const cyclingItems = [
    { id: 7, name: 'Mango Smoothie', category: 'Drinks', price: '$5.49', image: '🥭' },
    { id: 8, name: 'Boba Pearls', category: 'Topping', price: '$+1.00', image: '⚫' },
    { id: 9, name: 'Summer Special', category: 'Featured', price: '$7.99', image: '☀️' },
    { id: 10, name: 'Lychee Tea', category: 'Drinks', price: '$5.99', image: '🍑' },
  ];

  const [currentPage, setCurrentPage] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  // Cycle through featured items every 5 seconds
  useEffect(() => {
    const itemInterval = setInterval(() => {
      setCurrentItemIndex((prev) => (prev + 1) % cyclingItems.length);
    }, 5000);

    return () => clearInterval(itemInterval);
  }, [cyclingItems.length]);

  const currentItem = cyclingItems[currentItemIndex];

  return (
    <div className="menu-board-container">
      {/* Page Selection Controls */}
      <div className="page-controls">
        <button 
          className={`control-btn ${currentPage === 0 ? 'active' : ''}`}
          onClick={() => setCurrentPage(0)}
        >
          Beverages
        </button>
        <button 
          className={`control-btn ${currentPage === 1 ? 'active' : ''}`}
          onClick={() => setCurrentPage(1)}
        >
          Featured
        </button>
        <button 
          className={`control-btn ${currentPage === 2 ? 'active' : ''}`}
          onClick={() => setCurrentPage(2)}
        >
          Food
        </button>
      </div>
      {/* Page 0: Left Display (Beverages) */}
      {currentPage === 0 && (
        <div className="display-section full-page left-display">
          <h2 className="display-title">BEVERAGES</h2>
          <div className="items-grid full-grid">
            {staticItems.left.map((item) => (
              <div key={item.id} className="menu-item-card">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-category">{item.category}</p>
                <p className="item-price">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Page 1: Animated Display (Featured Today) */}
      {currentPage === 1 && (
        <div className="display-section full-page center-display">
          <h2 className="display-title">FEATURED TODAY</h2>
          <div className="animated-item">
            <div className="item-emoji">{currentItem.image}</div>
            <h3 className="animated-item-name">{currentItem.name}</h3>
            <p className="animated-item-category">{currentItem.category}</p>
            <p className="animated-item-price">{currentItem.price}</p>
            <div className="dots-indicator">
              {cyclingItems.map((_, idx) => (
                <div
                  key={idx}
                  className={`dot ${idx === currentItemIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Page 2: Right Display (Food) */}
      {currentPage === 2 && (
        <div className="display-section full-page right-display">
          <h2 className="display-title">FOOD</h2>
          <div className="items-grid full-grid">
            {staticItems.right.map((item) => (
              <div key={item.id} className="menu-item-card">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-category">{item.category}</p>
                <p className="item-price">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuBoard;
