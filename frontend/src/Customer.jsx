import './Customer.css'
import { useGet } from './hooks/useApi'
import React, { useState } from 'react'; // MUST import useState



function Home() {

  const [activeCategory, setActiveCategory] = useState('drink');

  const [isToppingsOpen, setIsToppingsOpen] = useState(false); 
  const [isFoodConfirmOpen, setIsFoodConfirmOpen] = useState(false);
  
  // selectedDrink starts as 'null' (nothing selected yet)
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [selectedDrinkSize, setSelectedDrinkSize] = useState('medium');
  const [selectedFood, setSelectedFood] = useState(null);

  const placeholderDescriptionByName = {
    'Taro Milk Tea': 'Creamy taro milk tea with a rich, nutty sweetness and a smooth finish.',
    'Jasmine Milk Tea': 'Fragrant jasmine tea blended with milk for a floral and refreshing sip.',
    'Brown Sugar Boba': 'Caramelized brown sugar syrup with fresh boba pearls and silky milk tea.',
    'Grilled Cheese': 'Toasted artisan bread layered with melty cheddar and a crisp golden crust.',
  };

  const normalizeCategory = (categoryValue) => {
    const normalized = String(categoryValue || '').trim().toLowerCase();

    if (normalized.startsWith('drink')) return 'drink';
    if (normalized.startsWith('food')) return 'food';
    if (normalized.startsWith('topping')) return 'topping';
    if (normalized.startsWith('mod')) return 'modifications';

    return normalized;
  };

  const getPlaceholderImage = (category) => {
    if (category === 'food') {
      return 'https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=900&q=80';
    }

    return 'https://northofbleu.com/wp-content/uploads/2022/07/taro-tea-recipe-northofbleu.com_.png';
  };

  const getPlaceholderDescription = (name, category) => {
    if (placeholderDescriptionByName[name]) {
      return placeholderDescriptionByName[name];
    }

    if (category === 'food') {
      return 'Freshly prepared kitchen item crafted to pair perfectly with your tea.';
    }

    if (category === 'drink') {
      return 'Handcrafted milk tea made to order with balanced flavor and sweetness.';
    }

    return 'House specialty item with rotating ingredients and seasonal flavors.';
  };

  const parseDrinkVariant = (drinkName) => {
    const normalizedName = String(drinkName || '').trim();
    const lower = normalizedName.toLowerCase();

    if (lower.endsWith(' small')) {
      return {
        baseName: normalizedName.slice(0, -6).trim(),
        size: 'small',
      };
    }

    if (lower.endsWith(' large')) {
      return {
        baseName: normalizedName.slice(0, -6).trim(),
        size: 'large',
      };
    }

    return {
      baseName: normalizedName,
      size: 'medium',
    };
  };

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
    const defaultSize = Number.isFinite(drinkItem?.sizeOptions?.medium)
      ? 'medium'
      : (['small', 'large'].find((size) => Number.isFinite(drinkItem?.sizeOptions?.[size])) || 'medium');
    setSelectedDrinkSize(defaultSize);
    setIsToppingsOpen(true);     // Flip the switch to open the screen
  };

  // We also need a way to close the screen!
  const closeToppingsScreen = () => {
    setIsToppingsOpen(false);    // Hide the screen
    setSelectedDrink(null);      // Clear the memory
    setSelectedDrinkSize('medium');
  };

  const closeFoodConfirm = () => {
    setIsFoodConfirmOpen(false);
    setSelectedFood(null);
  };

  const confirmAddFood = () => {
    // Cart integration comes next. For now, just close after confirming.
    closeFoodConfirm();
  };

  const { data, isLoading, error, isError } = useGet(['full-menu'], '/api/get-full-menu',
    {
      retry: false //only try to query once
    }
  );

  const allMenuItems = Array.isArray(data)
    ? data
        .filter((item) => item?.is_active !== false)
        .map((item) => {
          const category = normalizeCategory(item.category);
          const price = Number(item.cost);

          return {
            id: item.menu_id,
            name: item.name,
            price,
            category,
            image: getPlaceholderImage(category),
            description: getPlaceholderDescription(item.name, category),
          };
        })
        .filter((item) => Number.isFinite(item.price))
    : [];

  const drinkGroups = allMenuItems
    .filter((item) => item.category === 'drink')
    .reduce((groups, item) => {
      const { baseName, size } = parseDrinkVariant(item.name);
      const key = baseName.toLowerCase();

      if (!groups[key]) {
        groups[key] = {
          id: item.id,
          name: baseName,
          category: 'drink',
          image: getPlaceholderImage('drink'),
          description: getPlaceholderDescription(baseName, 'drink'),
          sizeOptions: {},
        };
      }

      groups[key].sizeOptions[size] = item.price;

      // Use medium variant record as canonical card row when available.
      if (size === 'medium') {
        groups[key].id = item.id;
      }

      return groups;
    }, {});

  const drinkItems = Object.values(drinkGroups)
    .filter((item) => Number.isFinite(item.sizeOptions.medium))
    .map((item) => ({
      ...item,
      price: item.sizeOptions.medium,
    }));

  const foodItems = allMenuItems.filter((item) => item.category === 'food');
  const visibleItems = activeCategory === 'drink' ? drinkItems : foodItems;
  const selectedDrinkPrice = selectedDrink?.sizeOptions?.[selectedDrinkSize] ?? selectedDrink?.price;
  const availableDrinkSizes = selectedDrink?.sizeOptions
    ? ['small', 'medium', 'large'].filter((size) => Number.isFinite(selectedDrink.sizeOptions[size]))
    : [];

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
              {visibleItems.length === 0 && (
                <article className="card h-100 text-center tea-card">
                  <div className="card-body">
                    <h5 className="card-title">No items yet</h5>
                    <p className="card-text tea-description">
                      No {activeCategory} items were returned from the database.
                    </p>
                  </div>
                </article>
              )}

              {visibleItems.map((item) => (
                <article key={item.id} className="card h-100 text-center tea-card">
                  <img
                    src={item.image}
                    className="card-img-top"
                    alt={item.name}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{item.name}</h5>
                    <p className="card-text tea-description">{item.description}</p>
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

            {!isError && (
              <p className="backend-status">
                Loaded {allMenuItems.length} active item{allMenuItems.length === 1 ? '' : 's'} from the menu database.
              </p>
            )}
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
              Size: <strong>{selectedDrinkSize}</strong> | Base Price: <strong>${selectedDrinkPrice?.toFixed(2)}</strong>
            </p>

            <div className="tea-modal-body">
              <p className="tea-mod-heading">Select Size</p>
              <div className="tea-size-options">
                {availableDrinkSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`btn tea-size-btn ${selectedDrinkSize === size ? 'is-active' : ''}`}
                    onClick={() => setSelectedDrinkSize(size)}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)} (${selectedDrink?.sizeOptions?.[size].toFixed(2)})
                  </button>
                ))}
              </div>

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
