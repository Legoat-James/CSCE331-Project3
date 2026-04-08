import './Customer.css';
import { useGet, useMutate } from './hooks/useApi';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar, Nav, Container, Spinner } from 'react-bootstrap';
import { Menu, OrderSummary, DrinkCustomizer, FoodConfirmModal } from './components/customer';

// Import images from assets
import blackTeaImg from './assets/Black-tea.jpg';
import blackHoneyTeaImg from './assets/black-honey-tea.jpg';
import coffeeCreamaImg from './assets/coffee-crema.jpg';
import coffeeMilkTeaImg from './assets/coffee-milk-tea.jpg';
import goldenRetrieverImg from './assets/golden-retriever.png';
import honeyLemonadeImg from './assets/hney-lemonade.jpg';
import honeyPearlMilkTeaImg from './assets/honey-pearl-milk-tea.jpg';
import mangoPassionFruitTeaImg from './assets/mango-passion-fruit-tea.jpg';
import mangoGreenMilkTeaImg from './assets/mango-green-milk-tea.jpg';
import mangoGreenTeaImg from './assets/mango-green-tea.jpg';
import mangoMatchaFreshMilkImg from './assets/mango-matcha-fresh-tea.jpg';
import matchaPearlMilkTeaImg from './assets/matcha-pearl-milk-tea.jpg';
import pearlMilkTeaImg from './assets/pearl-milk-tea.jpg';
import strawberryCoconutImg from './assets/strawberry-coconut-milk-tea.png';
import thaiPearlMilkTeaImg from './assets/thai-pearl-milk-tea.jpg';
import tigerBobaImg from './assets/tiger-boba.jpg';
import avocadoToastImg from './assets/avocado-toast.jpg';
import bagelSandwichImg from './assets/bagel-sandwich.jpg';
import friesImg from './assets/fries.jpg';
import grilledCheeseImg from './assets/grilled-cheese.jpg';
import Weather from './components/customer/Weather';

const fallbackCardImage = '/teashopLogo.png';
const iceLevelOptions = ['No Ice', 'Light Ice', 'Regular Ice', 'Extra Ice'];

const itemVisualsByName = {
  'black tea': {
    description: 'Classic brewed black tea with a smooth tannin finish and a bold, comforting aroma.',
    image: blackTeaImg,
  },
  'black honey tea': {
    description: 'Fragrant black tea sweetened with mellow honey notes for a warm, rounded sip.',
    image: blackHoneyTeaImg,
  },
  'coffee crema': {
    description: 'Velvety coffee-forward drink topped with a creamy finish and roasted caramel depth.',
    image: coffeeCreamaImg,
  },
  'coffee milk tea': {
    description: 'A balanced fusion of milk tea richness and smooth coffee flavor with light sweetness.',
    image: coffeeMilkTeaImg,
  },
  'golden retriever': {
    description: 'House signature golden milk tea blend with bright floral notes and silky texture.',
    image: goldenRetrieverImg,
  },
  'honey lemonade': {
    description: 'Citrusy lemonade sweetened with honey for a refreshing, sunny, and crisp finish.',
    image: honeyLemonadeImg,
  },
  'honey pearl milk tea': {
    description: 'Creamy milk tea with chewy pearls and layered honey sweetness in every sip.',
    image: honeyPearlMilkTeaImg,
  },
  'mango and passion fruit tea': {
    description: 'Tropical mango and passion fruit infusion with bright acidity and juicy tea notes.',
    image: mangoPassionFruitTeaImg,
  },
  'mango green milk tea': {
    description: 'Green milk tea blended with ripe mango flavor for a creamy, fruity profile.',
    image: mangoGreenMilkTeaImg,
  },
  'mango green tea': {
    description: 'Fresh green tea base with sweet mango character and a clean, lightly grassy finish.',
    image: mangoGreenTeaImg,
  },
  'mango matcha fresh milk': {
    description: 'Creamy fresh milk layered with mango sweetness and earthy matcha complexity.',
    image: mangoMatchaFreshMilkImg,
  },
  'matcha pearl milk tea': {
    description: 'Matcha milk tea with bouncy pearls, combining gentle bitterness and creamy sweetness.',
    image: matchaPearlMilkTeaImg,
  },
  'pearl milk tea': {
    description: 'Traditional pearl milk tea with smooth tea flavor and chewy tapioca pearls.',
    image: pearlMilkTeaImg,
  },
  'strawberry coconut': {
    description: 'Sweet strawberry and coconut blend with a creamy tropical finish.',
    image: strawberryCoconutImg,
  },
  'thai pearl milk tea': {
    description: 'Thai-style milk tea with pearl topping, deep spice notes, and caramel sweetness.',
    image: thaiPearlMilkTeaImg,
  },
  'tiger boba': {
    description: 'Brown sugar tiger stripes over milk tea and boba for a rich caramelized treat.',
    image: tigerBobaImg,
  },
  'avocado toast': {
    description: 'Crisp toasted bread layered with seasoned avocado mash and savory toppings.',
    image: avocadoToastImg,
  },
  'bagel sandwich': {
    description: 'Warm bagel sandwich stacked with hearty fillings for a satisfying bite.',
    image: bagelSandwichImg,
  },
  fries: {
    description: 'Golden fries with a crisp outside, fluffy center, and a savory potato finish.',
    image: friesImg,
  },
  'grilled cheese': {
    description: 'Buttery toasted bread with a melty cheese center and classic comfort flavor.',
    image: grilledCheeseImg,
  },
};

// Utility functions
const normalizeItemName = (name) => String(name || '').trim().toLowerCase();

const normalizeCategory = (categoryValue) => {
  const normalized = String(categoryValue || '').trim().toLowerCase();
  if (normalized.startsWith('drink')) return 'drink';
  if (normalized.startsWith('food')) return 'food';
  if (normalized.startsWith('topping')) return 'topping';
  if (normalized.startsWith('mod')) return 'modifications';
  return normalized;
};

const parseDrinkVariant = (drinkName) => {
  const normalizedName = String(drinkName || '').trim();
  const lower = normalizedName.toLowerCase();

  if (lower.endsWith(' small')) {
    return { baseName: normalizedName.slice(0, -6).trim(), size: 'small' };
  }
  if (lower.endsWith(' large')) {
    return { baseName: normalizedName.slice(0, -6).trim(), size: 'large' };
  }
  return { baseName: normalizedName, size: 'medium' };
};

function Customer() {
  // UI state
  const [activeCategory, setActiveCategory] = useState('drink');
  const [isToppingsOpen, setIsToppingsOpen] = useState(false);
  const [isFoodConfirmOpen, setIsFoodConfirmOpen] = useState(false);

  // Selected item states
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [selectedDrinkSize, setSelectedDrinkSize] = useState('medium');
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState({});
  const [sugarMultiplier, setSugarMultiplier] = useState(1);
  const [iceLevelIndex, setIceLevelIndex] = useState(2);
  const [swapSugar, setSwapSugar] = useState(false);
  const [useOatMilk, setUseOatMilk] = useState(false);

  // Order state
  const [orderItems, setOrderItems] = useState([]);
  const [editingOrderItemId, setEditingOrderItemId] = useState(null);
  const [orderSubmitMessage, setOrderSubmitMessage] = useState('');
  const [orderSubmitError, setOrderSubmitError] = useState('');

  // API hooks
  const { data, isLoading, error, isError } = useGet(['full-menu'], '/api/menu/all', {
    retry: false,
  });

  const orderMutation = useMutate('/api/orders/create', 'POST', []);

  // Image helper functions
  const getMenuImage = useCallback((name, category) => {
    const normalizedName = normalizeItemName(name);
    const mappedImage = itemVisualsByName[normalizedName]?.image;

    if (mappedImage) return mappedImage;
    return fallbackCardImage;
  }, []);

  const getMenuDescription = useCallback((name, category) => {
    const normalizedName = normalizeItemName(name);
    const match = itemVisualsByName[normalizedName];

    if (match?.description) return match.description;
    if (category === 'food') return 'Freshly prepared kitchen item crafted to pair perfectly with your tea.';
    if (category === 'drink') return 'Handcrafted milk tea made to order with balanced flavor and sweetness.';
    return 'House specialty item with rotating ingredients and seasonal flavors.';
  }, []);

  const handleCardImageError = useCallback((event) => {
    if (event.currentTarget.src !== fallbackCardImage) {
      event.currentTarget.src = fallbackCardImage;
    }
  }, []);

  // Process menu data
  const allMenuItems = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .filter((item) => item?.is_active !== false)
      .map((item) => {
        const category = normalizeCategory(item.category);
        const price = Number(item.cost);
        return {
          id: item.menu_id,
          name: item.name,
          price,
          category,
          image: getMenuImage(item.name, category),
          description: getMenuDescription(item.name, category),
        };
      })
      .filter((item) => Number.isFinite(item.price));
  }, [data, getMenuImage, getMenuDescription]);

  const drinkItems = useMemo(() => {
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
            image: getMenuImage(baseName, 'drink'),
            description: getMenuDescription(baseName, 'drink'),
            sizeOptions: {},
            sizeMenuIds: {},
          };
        }

        groups[key].sizeOptions[size] = item.price;
        groups[key].sizeMenuIds[size] = item.id;

        if (size === 'medium') {
          groups[key].id = item.id;
        }

        return groups;
      }, {});

    return Object.values(drinkGroups)
      .filter((item) => Number.isFinite(item.sizeOptions.medium))
      .map((item) => ({
        ...item,
        price: item.sizeOptions.medium,
      }));
  }, [allMenuItems, getMenuImage, getMenuDescription]);

  const toppingItems = useMemo(
    () => allMenuItems.filter((item) => item.category === 'topping'),
    [allMenuItems]
  );

  const modificationItems = useMemo(
    () => allMenuItems.filter((item) => item.category === 'modifications'),
    [allMenuItems]
  );

  const foodItems = useMemo(
    () => allMenuItems.filter((item) => item.category === 'food'),
    [allMenuItems]
  );

  // Modification flags
  const hasSugarSlider = modificationItems.some((item) => item.name.toLowerCase() === 'sugar');
  const hasIceControl = modificationItems.some((item) => item.name.toLowerCase() === 'ice');
  const hasSwapSugar = modificationItems.some((item) => item.name.toLowerCase() === 'swap sugar');
  const hasOatMilkToggle = modificationItems.some((item) => {
    const normalized = item.name.toLowerCase();
    return normalized === 'oak milk' || normalized === 'oat milk';
  });

  const modificationByName = useMemo(() => {
    return modificationItems.reduce((lookup, item) => {
      lookup[item.name.toLowerCase()] = item;
      return lookup;
    }, {});
  }, [modificationItems]);

  // Computed values for current selection
  const visibleItems = activeCategory === 'drink' ? drinkItems : foodItems;
  const selectedDrinkPrice = selectedDrink?.sizeOptions?.[selectedDrinkSize] ?? selectedDrink?.price;
  const selectedDrinkMenuId = selectedDrink?.sizeMenuIds?.[selectedDrinkSize] ?? selectedDrink?.id;
  const availableDrinkSizes = selectedDrink?.sizeOptions
    ? ['small', 'medium', 'large'].filter((size) => Number.isFinite(selectedDrink.sizeOptions[size]))
    : [];

  const selectedToppingEntries = toppingItems
    .map((topping) => ({
      ...topping,
      quantity: selectedToppings[topping.id] || 0,
    }))
    .filter((topping) => topping.quantity > 0);

  const toppingsTotal = selectedToppingEntries.reduce(
    (sum, topping) => sum + topping.price * topping.quantity,
    0
  );

  const selectedDrinkTotal = (selectedDrinkPrice || 0) + toppingsTotal;
  const orderSubtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // Handle order mutation results
  useEffect(() => {
    if (orderMutation.isSuccess) {
      setOrderItems([]);
      setOrderSubmitMessage(`Order #${orderMutation.data.orderId} submitted successfully.`);
    }
    if (orderMutation.isError) {
      setOrderSubmitError(orderMutation.error?.message || 'Unable to submit order. Please try again.');
    }
  }, [orderMutation.isSuccess, orderMutation.isError, orderMutation.data, orderMutation.error]);

  // Event handlers
  const handleSelectItem = useCallback((item) => {
    if (item.category === 'drink') {
      setEditingOrderItemId(null);
      setSelectedDrink(item);
      const defaultSize = Number.isFinite(item?.sizeOptions?.medium)
        ? 'medium'
        : ['small', 'large'].find((size) => Number.isFinite(item?.sizeOptions?.[size])) || 'medium';
      setSelectedDrinkSize(defaultSize);
      setSelectedToppings({});
      setSugarMultiplier(1);
      setIceLevelIndex(2);
      setSwapSugar(false);
      setUseOatMilk(false);
      setIsToppingsOpen(true);
      return;
    }

    if (item.category === 'food') {
      setSelectedFood(item);
      setIsFoodConfirmOpen(true);
    }
  }, []);

  const closeToppingsScreen = useCallback(() => {
    setIsToppingsOpen(false);
    setSelectedDrink(null);
    setSelectedDrinkSize('medium');
    setSelectedToppings({});
    setSugarMultiplier(1);
    setIceLevelIndex(2);
    setSwapSugar(false);
    setUseOatMilk(false);
    setEditingOrderItemId(null);
  }, []);

  const closeFoodConfirm = useCallback(() => {
    setIsFoodConfirmOpen(false);
    setSelectedFood(null);
  }, []);

  const confirmAddFood = useCallback(() => {
    if (!selectedFood) {
      closeFoodConfirm();
      return;
    }

    const orderEntry = {
      id: `food-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'food',
      menuId: selectedFood.id,
      quantity: 1,
      name: selectedFood.name,
      price: selectedFood.price,
      totalPrice: selectedFood.price,
    };

    setOrderSubmitMessage('');
    setOrderSubmitError('');
    setOrderItems((prev) => [...prev, orderEntry]);
    closeFoodConfirm();
  }, [selectedFood, closeFoodConfirm]);

  const updateToppingQuantity = useCallback((toppingId, delta) => {
    setSelectedToppings((prev) => {
      const nextQuantity = Math.max(0, (prev[toppingId] || 0) + delta);
      const updated = { ...prev };

      if (nextQuantity === 0) {
        delete updated[toppingId];
      } else {
        updated[toppingId] = nextQuantity;
      }

      return updated;
    });
  }, []);

  const saveDrinkSelection = useCallback(() => {
    if (!selectedDrink || !Number.isFinite(selectedDrinkTotal)) {
      closeToppingsScreen();
      return;
    }

    const orderEntry = {
      id: editingOrderItemId || `drink-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'drink',
      menuId: selectedDrinkMenuId,
      quantity: 1,
      name: selectedDrink.name,
      size: selectedDrinkSize,
      price: selectedDrinkPrice,
      sugarMultiplier,
      iceLevel: iceLevelOptions[iceLevelIndex],
      swapSugar,
      useOatMilk,
      toppings: selectedToppingEntries.map((topping) => ({
        id: topping.id,
        name: topping.name,
        quantity: topping.quantity,
        price: topping.price,
      })),
      totalPrice: selectedDrinkTotal,
    };

    setOrderSubmitMessage('');
    setOrderSubmitError('');

    if (editingOrderItemId) {
      setOrderItems((prev) => prev.map((item) => (item.id === editingOrderItemId ? orderEntry : item)));
    } else {
      setOrderItems((prev) => [...prev, orderEntry]);
    }

    closeToppingsScreen();
  }, [
    selectedDrink,
    selectedDrinkTotal,
    selectedDrinkMenuId,
    selectedDrinkSize,
    selectedDrinkPrice,
    sugarMultiplier,
    iceLevelIndex,
    swapSugar,
    useOatMilk,
    selectedToppingEntries,
    editingOrderItemId,
    closeToppingsScreen,
  ]);

  const editOrderItem = useCallback((item) => {
    if (item.type !== 'drink') return;

    const matchedDrink = drinkItems.find(
      (drink) => drink.name.toLowerCase() === String(item.name || '').toLowerCase()
    );

    const fallbackSize = item.size || 'medium';
    const fallbackDrink = {
      id: item.menuId ?? item.id,
      name: item.name,
      category: 'drink',
      image: getMenuImage(item.name, 'drink'),
      description: getMenuDescription(item.name, 'drink'),
      sizeOptions: { [fallbackSize]: item.price },
      sizeMenuIds: { [fallbackSize]: item.menuId ?? item.id },
    };

    const sourceDrink = matchedDrink || fallbackDrink;
    const selectedSize = Number.isFinite(sourceDrink?.sizeOptions?.[item.size])
      ? item.size
      : ['medium', 'small', 'large'].find((size) => Number.isFinite(sourceDrink?.sizeOptions?.[size])) || fallbackSize;

    const toppingsMap = (item.toppings || []).reduce((acc, topping) => {
      acc[topping.id] = topping.quantity;
      return acc;
    }, {});

    const iceIndex = iceLevelOptions.indexOf(item.iceLevel);

    setEditingOrderItemId(item.id);
    setSelectedDrink(sourceDrink);
    setSelectedDrinkSize(selectedSize);
    setSelectedToppings(toppingsMap);
    setSugarMultiplier(item.sugarMultiplier ?? 1);
    setIceLevelIndex(iceIndex >= 0 ? iceIndex : 2);
    setSwapSugar(Boolean(item.swapSugar));
    setUseOatMilk(Boolean(item.useOatMilk));
    setIsToppingsOpen(true);
  }, [drinkItems, getMenuImage, getMenuDescription]);

  const removeOrderItem = useCallback((itemId) => {
    setOrderSubmitMessage('');
    setOrderSubmitError('');
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const resolveItemMenuId = useCallback((item) => {
    if (Number.isInteger(item?.menuId)) return item.menuId;

    if (item?.type === 'drink') {
      const matchedDrink = drinkItems.find(
        (drink) => drink.name.toLowerCase() === String(item.name || '').toLowerCase()
      );
      if (matchedDrink) {
        const sizeKey = item.size || 'medium';
        return matchedDrink.sizeMenuIds?.[sizeKey] ?? matchedDrink.id;
      }
    }

    const matchedMenu = allMenuItems.find(
      (menuItem) => menuItem.category === item?.type && menuItem.name.toLowerCase() === String(item?.name || '').toLowerCase()
    );
    return matchedMenu?.id;
  }, [drinkItems, allMenuItems]);

  const handleFinishOrder = useCallback(() => {
    if (orderItems.length === 0) return;

    setOrderSubmitMessage('');
    setOrderSubmitError('');

    try {
      const swapSugarMenuId = modificationByName['swap sugar']?.id;
      const oatMilkMenuId = (modificationByName['oat milk'] || modificationByName['oak milk'])?.id;

      const payloadItems = orderItems.map((item, itemIndex) => {
        const menuId = resolveItemMenuId(item);
        if (!Number.isInteger(menuId)) {
          throw new Error(`Could not resolve menu ID for order item ${itemIndex + 1} (${item.name}).`);
        }

        const toppings = Array.isArray(item.toppings)
          ? item.toppings.map((topping) => ({
              id: topping.id,
              quantity: topping.quantity,
            }))
          : [];

        if (item.type === 'drink') {
          if (item.swapSugar && Number.isInteger(swapSugarMenuId)) {
            toppings.push({ id: swapSugarMenuId, quantity: 1 });
          }
          if (item.useOatMilk && Number.isInteger(oatMilkMenuId)) {
            toppings.push({ id: oatMilkMenuId, quantity: 1 });
          }
        }

        return {
          menuId,
          quantity: Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1,
          toppings,
        };
      });

      orderMutation.mutate({
        orderTotal: Number(orderSubtotal.toFixed(2)),
        customerName: 'Guest',
        items: payloadItems,
      });
    } catch (submitError) {
      setOrderSubmitError(submitError.message || 'Unable to submit order. Please try again.');
    }
  }, [orderItems, orderSubtotal, modificationByName, resolveItemMenuId, orderMutation]);

  if (isLoading) {
    return (
      <div className="customer-page d-flex justify-content-center align-items-center">
        <Spinner animation="border" className="tea-spinner" />
      </div>
    );
  }

  return (
    <div className="customer-page">
      <div className="customer-shell">
        {/* Category Navigation */}
        <Navbar expand="lg" className="tea-nav" aria-label="Category navigation">
          <Container fluid className="p-0 align-items-center">
            <Navbar.Brand href="#" className="tea-brand" aria-label="Tea shop home">
              <img src="teashopLogo.png" alt="Tea Shop Logo" className="tea-logo" />
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="customerCategoryNav" />

            <Navbar.Collapse id="customerCategoryNav">
              <Nav className="me-auto tea-links">
                <Nav.Item>
                  <button
                    type="button"
                    className={`nav-link tea-link ${activeCategory === 'drink' ? 'is-active' : ''}`}
                    onClick={() => setActiveCategory('drink')}
                  >
                    Drinks
                  </button>
                </Nav.Item>
                <Nav.Item>
                  <button
                    type="button"
                    className={`nav-link tea-link ${activeCategory === 'food' ? 'is-active' : ''}`}
                    onClick={() => setActiveCategory('food')}
                  >
                    Food
                  </button>
                </Nav.Item>
              </Nav>
              <Nav className="ms-auto">
                <Nav.Item>
                  <Weather />
                </Nav.Item>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <div className="kiosk-layout">
          {/* Menu Panel */}
          <Menu
            items={visibleItems}
            activeCategory={activeCategory}
            isLoading={false}
            onSelectItem={handleSelectItem}
            onCardImageError={handleCardImageError}
          />

          {/* Order Summary Panel */}
          <OrderSummary
            orderItems={orderItems}
            subtotal={orderSubtotal}
            isError={isError}
            errorMessage={error?.message}
            menuItemCount={allMenuItems.length}
            submitMessage={orderSubmitMessage}
            submitError={orderSubmitError}
            isPending={orderMutation.isPending}
            onEditItem={editOrderItem}
            onRemoveItem={removeOrderItem}
            onFinishOrder={handleFinishOrder}
          />
        </div>

        {/* Drink Customization Modal */}
        <DrinkCustomizer
          show={isToppingsOpen}
          selectedDrink={selectedDrink}
          selectedDrinkSize={selectedDrinkSize}
          selectedDrinkPrice={selectedDrinkPrice}
          selectedDrinkTotal={selectedDrinkTotal}
          availableDrinkSizes={availableDrinkSizes}
          toppingItems={toppingItems}
          selectedToppings={selectedToppings}
          sugarMultiplier={sugarMultiplier}
          iceLevelIndex={iceLevelIndex}
          swapSugar={swapSugar}
          useOatMilk={useOatMilk}
          hasSugarSlider={hasSugarSlider}
          hasIceControl={hasIceControl}
          hasSwapSugar={hasSwapSugar}
          hasOatMilkToggle={hasOatMilkToggle}
          editingOrderItemId={editingOrderItemId}
          onClose={closeToppingsScreen}
          onSave={saveDrinkSelection}
          onSizeChange={setSelectedDrinkSize}
          onToppingQuantityChange={updateToppingQuantity}
          onSugarChange={setSugarMultiplier}
          onIceChange={setIceLevelIndex}
          onSwapSugarChange={setSwapSugar}
          onOatMilkChange={setUseOatMilk}
        />

        {/* Food Confirmation Modal */}
        <FoodConfirmModal
          show={isFoodConfirmOpen}
          selectedFood={selectedFood}
          onClose={closeFoodConfirm}
          onConfirm={confirmAddFood}
        />
      </div>
    </div>
  );
}

export default Customer;
