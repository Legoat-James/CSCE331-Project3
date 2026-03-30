import React, { useState, useEffect } from 'react';
import './MenuBoard.css';

const MenuBoard = () => {
  // Dummy menu items
  const staticItems = {
    left: [
      { id: 1, name: 'Bubble Tea', category: 'Drinks', price: '$5.99', color: '#FF6B9D' },
      { id: 2, name: 'Thai Tea', category: 'Drinks', price: '$4.99', color: '#FFC75F' },
      { id: 3, name: 'Matcha Latte', category: 'Drinks', price: '$6.49', color: '#84C06E' },
    ],
    right: [
      { id: 4, name: 'Chicken Teriyaki', category: 'Food', price: '$9.99', color: '#FF7F50' },
      { id: 5, name: 'Veggie Poke Bowl', category: 'Food', price: '$8.99', color: '#6BCB77' },
      { id: 6, name: 'Shrimp Tempura', category: 'Food', price: '$10.99', color: '#4D96FF' },
    ],
  };

  const cyclingItems = [
    { id: 7, name: 'Mango Smoothie', category: 'Drinks', price: '$5.49', image: '🥭' },
    { id: 8, name: 'Boba Pearls', category: 'Topping', price: '$+1.00', image: '⚫' },
    { id: 9, name: 'Summer Special', category: 'Featured', price: '$7.99', image: '☀️' },
    { id: 10, name: 'Lychee Tea', category: 'Drinks', price: '$5.99', image: '🍑' },
  ];

  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  // Cycle through items every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentItemIndex((prev) => (prev + 1) % cyclingItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [cyclingItems.length]);

  const currentItem = cyclingItems[currentItemIndex];

  return (
    <div className="menu-board-container">
      {/* Left Static Display */}
      <div className="display-section left-display">
        <h2 className="display-title">BEVERAGES</h2>
        <div className="items-grid">
          {staticItems.left.map((item) => (
            <div
              key={item.id}
              className="menu-item-card"
              style={{ borderLeftColor: item.color }}
            >
              <h3 className="item-name">{item.name}</h3>
              <p className="item-category">{item.category}</p>
              <p className="item-price">{item.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Center Animated Display */}
      <div className="display-section center-display">
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

      {/* Right Static Display */}
      <div className="display-section right-display">
        <h2 className="display-title">FOOD</h2>
        <div className="items-grid">
          {staticItems.right.map((item) => (
            <div
              key={item.id}
              className="menu-item-card"
              style={{ borderLeftColor: item.color }}
            >
              <h3 className="item-name">{item.name}</h3>
              <p className="item-category">{item.category}</p>
              <p className="item-price">{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuBoard;
