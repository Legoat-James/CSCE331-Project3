import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './MenuBoard.css';
import { useGet } from './hooks/useApi';

const normalizeValue = (value) => String(value || '').trim().toLowerCase();

const formatImageName = (name) => {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const spotlightAssetModules = import.meta.glob('./assets/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
});

const spotlightImageByName = Object.entries(spotlightAssetModules).reduce((acc, [filePath, src]) => {
  const fileName = filePath.split('/').pop() || '';
  const baseName = fileName.replace(/\.[^.]+$/, '');
  const key = formatImageName(baseName);
  acc[key] = src;
  return acc;
}, {});

const SUBCATEGORY_ORDER = {
  teas: 0,
  refreshers: 1,
  'coffee/matcha': 2,
  specials: 3,
  seasonal: 4,
};

const formatPrice = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '$0.00';
};

const getItemSubcategory = (item) => String(item?.subcategory || '').trim();

const groupItemsBySubcategory = (items, fallbackLabel) => {
  const groups = new Map();

  items.forEach((item) => {
    const rawSubcategory = getItemSubcategory(item);
    const normalizedSubcategory = normalizeValue(rawSubcategory);
    let key = normalizedSubcategory || 'main';
    let displayLabel = rawSubcategory || fallbackLabel;

    // Combine seasonal and specials into one group
    if (key === 'seasonal' || key === 'specials') {
      key = 'specials';
      displayLabel = 'Specials & Seasonal';
    }

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: displayLabel,
        items: [],
      });
    }

    groups.get(key).items.push(item);
  });

  return [...groups.values()]
    .sort((leftGroup, rightGroup) => {
      const leftRank = SUBCATEGORY_ORDER[leftGroup.key] ?? Number.MAX_SAFE_INTEGER;
      const rightRank = SUBCATEGORY_ORDER[rightGroup.key] ?? Number.MAX_SAFE_INTEGER;

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      return leftGroup.label.localeCompare(rightGroup.label);
    })
    .map((group) => ({
      ...group,
      items: [...group.items].sort((leftItem, rightItem) => {
        const leftName = String(leftItem.name || '');
        const rightName = String(rightItem.name || '');

        return leftName.localeCompare(rightName);
      }),
    }));
};

const MenuBoard = () => {
  const { data: menuItems, isLoading, error } = useGet(['menu-board'], '/api/menu/all', {
    retry: false
  });

  const activeMenuItems = useMemo(
    () => (menuItems || []).filter((item) => item?.is_active),
    [menuItems]
  );

  const beverageItems = useMemo(
    () =>
      activeMenuItems.filter((item) => {
        const itemName = String(item.name || '').toLowerCase();
        return (
          normalizeValue(item.category) === 'drink' &&
          !itemName.includes('small') &&
          !itemName.includes('large')
        );
      }),
    [activeMenuItems]
  );

  const foodItems = useMemo(
    () => activeMenuItems.filter((item) => normalizeValue(item.category) === 'food'),
    [activeMenuItems]
  );

  const spotlightItems = useMemo(
    () =>
      beverageItems.filter((item) => {
        const subcategory = normalizeValue(item.subcategory);
        return subcategory === 'specials' || subcategory === 'seasonal';
      }),
    [beverageItems]
  );

  const fallbackSpotlightItems = useMemo(
    () => [
      { id: 7, name: 'Summer Special', subcategory: 'Specials', price: 7.99, image: '☀️' },
      { id: 8, name: 'Seasonal Tea', subcategory: 'Seasonal', price: 6.49, image: '🍵' },
    ],
    []
  );

  const rotatingSpotlightItems = spotlightItems.length > 0 ? spotlightItems : fallbackSpotlightItems;

  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  useEffect(() => {
    setCurrentItemIndex(0);

    if (rotatingSpotlightItems.length <= 1) {
      return undefined;
    }

    const itemInterval = setInterval(() => {
      setCurrentItemIndex((prev) => (prev + 1) % rotatingSpotlightItems.length);
    }, 5000);

    return () => clearInterval(itemInterval);
  }, [rotatingSpotlightItems]);

  const currentItem = rotatingSpotlightItems[currentItemIndex] || rotatingSpotlightItems[0];
  const currentItemImageSrc = spotlightImageByName[formatImageName(currentItem?.name)];

  // Grouped Data
  const beverageGroups = groupItemsBySubcategory(beverageItems, 'Drinks');
  const foodGroups = groupItemsBySubcategory(foodItems, 'Food');

  // Split drink categories across columns to balance space
  const leftColumnGroups = beverageGroups.filter(g => g.key === 'teas' || g.key === 'coffee/matcha');
  const middleColumnGroups = beverageGroups.filter(g => g.key !== 'teas' && g.key !== 'coffee/matcha');

  // Reusable render function for a subcategory group
  const renderGroup = (group) => (
    <div key={group.key} className="menu-section-group">
      <h3 className="menu-subcategory-title">{group.label}</h3>
      <div className="d-flex flex-column gap-1">
        {group.items.map((item) => (
          <div key={item.menu_item_id || item.id} className="menu-item-row d-flex align-items-center">
            <span className="item-name">{item.name}</span>
            <span className="item-dots"></span>
            <span className="item-price">{formatPrice(item.cost)}</span>
          </div>
        ))}
      </div>
    </div>
  );

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
      <header className="board-header d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h1 className="board-title mb-0">Tea House Menu</h1>
        </div>
      </header>

      <Container fluid className="display-section board-surface flex-grow-1 position-relative overflow-hidden p-0">
        <div className="board-content">
          <Row className="h-100 g-3">
            
            {/* COLUMN 1: Main Drinks */}
            <Col lg={4} className="d-flex flex-column">
              <h2 className="board-section-title">DRINKS</h2>
              {leftColumnGroups.length > 0 ? (
                leftColumnGroups.map(renderGroup)
              ) : (
                <p className="menu-empty-state">No drinks available.</p>
              )}
            </Col>

            {/* COLUMN 2: Secondary Drinks & Food */}
            <Col lg={4} className="d-flex flex-column">
              {middleColumnGroups.map(renderGroup)}

              <h2 className="board-section-title mt-2">FOOD</h2>
              {foodGroups.length > 0 ? (
                foodGroups.map(renderGroup)
              ) : (
                <p className="menu-empty-state">No food items available.</p>
              )}
            </Col>

            {/* COLUMN 3: Spotlight Feature */}
            <Col lg={4} className="h-100">
              <aside className="spotlight-panel shadow-sm">
                <div className="card-body d-flex flex-column align-items-center text-center">
                  <p className="spotlight-label mb-1">Spotlight</p>
                  <p className="spotlight-subtitle">{getItemSubcategory(currentItem) || 'Special Feature'}</p>
                  
                  <div className="item-emoji">
                    {currentItemImageSrc ? (
                      <img src={currentItemImageSrc} alt={currentItem.name} />
                    ) : (
                      <span>{currentItem.image || '✨'}</span>
                    )}
                  </div>
                  
                  <h2 className="animated-item-name spotlight-item-name">{currentItem.name}</h2>
                  <p className="animated-item-category fs-6 mb-2">{getItemSubcategory(currentItem) || 'Featured item'}</p>
                  <p className="animated-item-price spotlight-price">{formatPrice(currentItem.price ?? currentItem.cost)}</p>
                  
                  <div className="dots-indicator d-flex gap-2 mt-3">
                    {rotatingSpotlightItems.map((_, idx) => (
                      <span
                        key={idx}
                        className={`dot rounded-circle ${idx === currentItemIndex ? 'active' : ''}`}
                      />
                    ))}
                  </div>
                </div>
              </aside>
            </Col>

          </Row>
        </div>
      </Container>
    </Container>
  );
};

export default MenuBoard;