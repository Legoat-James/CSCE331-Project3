import './Customer.css'
import { useGet } from './hooks/useApi'
import React, { useState } from 'react'; // MUST import useState



function Home() {

  const [activeCategory, setActiveCategory] = useState('drink');

  const [isToppingsOpen, setIsToppingsOpen] = useState(false); 
  const [isFoodConfirmOpen, setIsFoodConfirmOpen] = useState(false);
  
  // selectedDrink starts as 'null' (nothing selected yet)
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);

  const drinkItems = [
    {
      id: 1,
      name: 'Taro Milk Tea',
      price: 4.5,
      category: 'drink',
      image: 'https://northofbleu.com/wp-content/uploads/2022/07/taro-tea-recipe-northofbleu.com_.png',
    },
    {
      id: 2,
      name: 'Jasmine Milk Tea',
      price: 4.25,
      category: 'drink',
      image: 'https://northofbleu.com/wp-content/uploads/2022/07/taro-tea-recipe-northofbleu.com_.png',
    },
    {
      id: 3,
      name: 'Brown Sugar Boba',
      price: 4.95,
      category: 'drink',
      image: 'https://northofbleu.com/wp-content/uploads/2022/07/taro-tea-recipe-northofbleu.com_.png',
    },
  ];

  const foodItems = [
    {
      id: 101,
      name: 'Grilled Cheese',
      price: 5.75,
      category: 'food',
      image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=900&q=80',
    },
  ];

  const visibleItems = activeCategory === 'drink' ? drinkItems : foodItems;

  function handleFinishOrder(){

  }

  const handleSelectItem = (item) => {
    if (item.category === 'drink') {
      handleToppings(item);
      return;
    }

    if (item.category === 'food') {
      setSelectedFood(item);
      setIsFoodConfirmOpen(true);
    }
  };

  const handleToppings = (drinkItem) => {
    setSelectedDrink(drinkItem); // Memorize which drink was clicked
    setIsToppingsOpen(true);     // Flip the switch to open the screen
  };

  // We also need a way to close the screen!
  const closeToppingsScreen = () => {
    setIsToppingsOpen(false);    // Hide the screen
    setSelectedDrink(null);      // Clear the memory
  };

  const closeFoodConfirm = () => {
    setIsFoodConfirmOpen(false);
    setSelectedFood(null);
  };

  const confirmAddFood = () => {
    // Cart integration comes next. For now, just close after confirming.
    closeFoodConfirm();
  };
  const { data, isLoading, error, isError} = useGet(['testkey'], "/api/test?isError=false",
    {
      retry: false //only try to query once
    }
  );

  if (isLoading) return <div className="spinner-border tea-spinner" />;
  return (
    <div className="customer-page">
      <div className="customer-shell">
        {/* Category nav anchored to kiosk content */}
        <nav className="tea-nav navbar navbar-expand-lg" aria-label="Category navigation">
          <div className="container-fluid p-0 align-items-center">
            <a className="navbar-brand tea-brand" href="#" aria-label="Tea shop home">
              <img
                src="teashopLogo.png"
                alt="Tea Shop Logo"
                className="tea-logo"
              />
            </a>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#customerCategoryNav"
              aria-controls="customerCategoryNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="customerCategoryNav">
              <ul className="navbar-nav me-auto tea-links">
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link tea-link ${activeCategory === 'drink' ? 'is-active' : ''}`}
                    onClick={() => setActiveCategory('drink')}
                  >
                    Drinks
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link tea-link ${activeCategory === 'food' ? 'is-active' : ''}`}
                    onClick={() => setActiveCategory('food')}
                  >
                    Food
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="kiosk-layout">
          <section className="menu-panel" aria-label="Menu items">
            <div className="panel-heading-row">
              <h3 className="panel-title">
                Featured {activeCategory === 'drink' ? 'Drinks' : 'Food'}
              </h3>
            </div>

            <div className="menu-grid">
              {visibleItems.map((item) => (
                <article key={item.id} className="card h-100 text-center tea-card">
                  <img
                    src={item.image}
                    className="card-img-top"
                    alt={item.name}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{item.name}</h5>
                    <p className="card-text tea-price">${item.price.toFixed(2)}</p>
                    <button
                      className="btn tea-btn-select btn-sm"
                      onClick={() => handleSelectItem(item)}
                    >
                      Select
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="order-panel" aria-label="Current order">
            <h4 className="panel-title">Current Order</h4>
            <p className="order-subtitle">Your selected drinks and snacks will appear here.</p>

            {data && <p className="backend-status">{data.message}</p>}
            {isError && <p className="backend-status error">{error.message}</p>}

            <button className="btn tea-btn-finish btn-sm" onClick={handleFinishOrder}>Finish Order</button>
          </aside>
        </div>

      {isToppingsOpen && (
        <div
          className="tea-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="toppings-modal-title"
        >
          <div className="tea-modal-card">
            <div className="tea-modal-header">
              <h3 id="toppings-modal-title" className="tea-modal-title">
                Customize your {selectedDrink?.name}
              </h3>
              <button
                type="button"
                className="tea-modal-close"
                onClick={closeToppingsScreen}
                aria-label="Close customization dialog"
              >
                x
              </button>
            </div>

            <p className="tea-modal-price">
              Base Price: <strong>${selectedDrink?.price.toFixed(2)}</strong>
            </p>

            <div className="tea-modal-body">
              <p className="tea-modal-note">(Toppings fetched from database will map here...)</p>
            </div>

            <div className="tea-modal-actions">
              <button className="btn tea-modal-btn-secondary" onClick={closeToppingsScreen}>
                Cancel
              </button>
              <button className="btn tea-modal-btn-primary" onClick={closeToppingsScreen}>
                Save Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {isFoodConfirmOpen && (
        <div
          className="tea-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="food-confirm-title"
        >
          <div className="tea-modal-card">
            <div className="tea-modal-header">
              <h3 id="food-confirm-title" className="tea-modal-title">
                Confirm Add
              </h3>
              <button
                type="button"
                className="tea-modal-close"
                onClick={closeFoodConfirm}
                aria-label="Close add confirmation"
              >
                x
              </button>
            </div>

            <p className="tea-modal-price">
              Add <strong>{selectedFood?.name}</strong> to your order for <strong>${selectedFood?.price.toFixed(2)}</strong>?
            </p>

            <div className="tea-modal-body">
              <p className="tea-modal-note">Food items are added directly and do not need customization.</p>
            </div>

            <div className="tea-modal-actions">
              <button className="btn tea-modal-btn-secondary" onClick={closeFoodConfirm}>
                Cancel
              </button>
              <button className="btn tea-modal-btn-primary" onClick={confirmAddFood}>
                Confirm Add
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default Home
