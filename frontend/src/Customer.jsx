import './Customer.css';
import { useGet, useMutate} from './hooks/useApi';
import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { Navbar, Nav, NavDropdown, Container, Spinner } from 'react-bootstrap';
import { Menu, OrderSummary, DrinkCustomizer, FoodConfirmModal, Chatbot, AccessibilityWidget } from './components/customer';
import { useTranslate } from './contexts/TranslationContext';
import { ThemeContext } from './contexts/ThemeContext';

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
import { Button, Card } from 'react-bootstrap';

const fallbackCardImage = '/teashopLogo.png';
const iceLevelOptions = ['0%', '50%', '75%', '100%', '125%', '150%'];
const iceLevelMultipliers = [0, 0.5, 0.75, 1, 1.25, 1.5];

const formatMultiplier = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '1';
  return Number.isInteger(numeric) ? String(numeric) : String(numeric);
};

const parseModifierMultiplier = (name, prefix) => {
  const pattern = new RegExp(`^${prefix}\\s+([0-9.]+)x$`, 'i');
  const match = String(name || '').trim().match(pattern);
  const value = match ? Number(match[1]) : NaN;
  return Number.isFinite(value) ? value : null;
};

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
const normalizeChatText = (value) => String(value || '').trim().toLowerCase();

const getRequestedToppings = (item) => {
  const explicitToppings = Array.isArray(item?.toppings) ? item.toppings : [];
  const fromExplicit = explicitToppings
    .map((topping) => {
      if (typeof topping === 'string') {
        return { name: normalizeChatText(topping), menuId: null };
      }
      const menuId = Number(topping?.menu_id ?? topping?.menuId);
      const name = normalizeChatText(topping?.name);
      return {
        name,
        menuId: Number.isInteger(menuId) ? menuId : null,
      };
    })
    .filter((topping) => topping.name || Number.isInteger(topping.menuId));

  if (fromExplicit.length > 0) return fromExplicit;

  const modifications = Array.isArray(item?.modifications_array) ? item.modifications_array : [];
  return modifications
    .filter((modification) => normalizeChatText(modification?.category) === 'topping')
    .map((topping) => {
      const menuId = Number(topping?.menu_id ?? topping?.menuId);
      return {
        name: normalizeChatText(topping?.name),
        menuId: Number.isInteger(menuId) ? menuId : null,
      };
    })
    .filter((topping) => topping.name || Number.isInteger(topping.menuId));
};

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

const areItemsIdentical = (item1, item2) => {
  if (item1.menuId !== item2.menuId) return false;
  
  const mods1 = item1.modifications_array || [];
  const mods2 = item2.modifications_array || [];
  
  if (mods1.length !== mods2.length) return false;
  
  const sorted1 = [...mods1].sort((a,b) => a.menu_id - b.menu_id);
  const sorted2 = [...mods2].sort((a,b) => a.menu_id - b.menu_id);
  
  for (let i = 0; i < sorted1.length; i++) {
      if (sorted1[i].menu_id !== sorted2[i].menu_id) return false;
      if (sorted1[i].name !== sorted2[i].name) return false;
  }
  
  return true;
};

function Customer() {
  const { contrastTheme, setTheme, magnifyScreen, setMagnifyScreen } = useContext(ThemeContext);
  const { translate } = useTranslate();

  // UI state
  const [activeCategory, setActiveCategory] = useState('Teas');
  const [isToppingsOpen, setIsToppingsOpen] = useState(false);
  const [isFoodConfirmOpen, setIsFoodConfirmOpen] = useState(false);

  // Selected item states
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [selectedDrinkSize, setSelectedDrinkSize] = useState('medium');
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState({});
  const [sugarMultiplier, setSugarMultiplier] = useState(1);
  const [iceLevelIndex, setIceLevelIndex] = useState(3);
  const [swapSugar, setSwapSugar] = useState(false);
  const [useOatMilk, setUseOatMilk] = useState(false);
  const [isHot, setIsHot] = useState(false);

  // Order state
  const [orderItems, setOrderItems] = useState([]);
  const [editingOrderItemId, setEditingOrderItemId] = useState(null);
  const [orderSubmitMessage, setOrderSubmitMessage] = useState('');
  const [orderSubmitError, setOrderSubmitError] = useState('');
  const [drinkQuantity, setDrinkQuantity] = useState(1);

  //chatbot
  const [isChatOpen, setIsChatOpen] = useState(false);

  //state for customer name
  const [customerName, setCustomerName] = useState('');

  //theme
  const { theme } = useContext(ThemeContext);

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

  useEffect(() => {
    console.log(`Current order items:`, orderItems);
  },[orderItems])

  useEffect(() => {
    const handleVoiceCustomerName = (event) => {
      const nextName = String(event?.detail?.name || '').trim();
      if (!nextName) return;
      setCustomerName(nextName);
    };

    window.addEventListener('a11y-customer-name', handleVoiceCustomerName);

    return () => {
      window.removeEventListener('a11y-customer-name', handleVoiceCustomerName);
    };
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
          subcategory: item.subcategory || '',
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
            subcategory: item.subcategory || '',
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

  const ALL_DRINKS = 'All Drinks';
  const SUBCATEGORY_ORDER = ['Teas', 'Refreshers', 'Coffee/Matcha', 'Specials', 'Seasonal'];

  const drinkSubcategories = useMemo(() => {
    const available = new Set(drinkItems.map((item) => item.subcategory).filter(Boolean));
    const ordered = SUBCATEGORY_ORDER.filter((sub) => available.has(sub));
    drinkItems.forEach((item) => {
      if (item.subcategory && !SUBCATEGORY_ORDER.includes(item.subcategory)) {
        ordered.push(item.subcategory);
      }
    });
    return ordered;
  }, [drinkItems]);

  useEffect(() => {
    if (drinkSubcategories.length > 0 && activeCategory !== 'food' && activeCategory !== ALL_DRINKS && !drinkSubcategories.includes(activeCategory)) {
      setActiveCategory(drinkSubcategories[0]);
    }
  }, [drinkSubcategories]);

  // Modification flags
  const hasSugarSlider = modificationItems.some((item) => item.name.toLowerCase() === 'sugar');
  const hasIceControl = modificationItems.some((item) => item.name.toLowerCase() === 'ice');
  const hasSwapSugar = modificationItems.some((item) => item.name.toLowerCase() === 'swap sugar');
  const hasOatMilkToggle = modificationItems.some((item) => {
    const normalized = item.name.toLowerCase();
    return normalized === 'oak milk' || normalized === 'oat milk';
  });
  const hasHotToggle = modificationItems.some((item) => item.name.toLowerCase() === 'hot');

  const modificationByName = useMemo(() => {
    return modificationItems.reduce((lookup, item) => {
      lookup[item.name.toLowerCase()] = item;
      return lookup;
    }, {});
  }, [modificationItems]);

  const iceMenuId = modificationByName.ice?.id;
  const sugarMenuId = modificationByName.sugar?.id;
  const swapSugarMenuId = modificationByName['swap sugar']?.id;
  const oatMilkMenuId = (modificationByName['oat milk'] || modificationByName['oak milk'])?.id;
  const hotMenuId = modificationByName.hot?.id;

  const buildOrderEntry = useCallback(
    ({
      entryId,
      menuId,
      name,
      baseCost,
      modificationsArray = [],
      quantity = 1,
    }) => {
        const validQty = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;

      const normalizedMods = modificationsArray
        .map((modification) => ({
          category: String(modification?.category || '').trim().toLowerCase(),
          cost: Number(modification?.cost || 0),
          menu_id: Number(modification?.menu_id),
          name: String(modification?.name || '').trim(),
        }))
        .filter((modification) => Number.isInteger(modification.menu_id));

      const modificationsTotal = normalizedMods.reduce((sum, mod) => sum + mod.cost, 0);

        // Prepend quantity for display in the order summary card, matching the Cashier view
        const displayName = validQty > 1 ? `${validQty}x ${name}` : name;

      return {
        id: entryId || `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        menuId,
        cost: Number(baseCost) || 0,
          name: displayName,
          rawName: name,
          quantity: validQty,
        modifications_array: normalizedMods,
          totalPrice: ((Number(baseCost) || 0) + modificationsTotal) * validQty,
      };
    },
    []
  );

  // Computed values for current selection
  const visibleItems = activeCategory === 'food'
    ? foodItems
    : activeCategory === ALL_DRINKS
      ? drinkItems
      : drinkItems.filter((item) => item.subcategory === activeCategory);
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
      setIceLevelIndex(3);
      setSwapSugar(false);
      setUseOatMilk(false);
      setDrinkQuantity(1);
      setIsToppingsOpen(true);
      return;
    }

    if (item.category === 'food') {
      setSelectedFood(item);
      //the food confirm modal is stupid, we dont need it
      addFood(item);
     
    }
  }, []);

  const closeToppingsScreen = useCallback(() => {
    setIsToppingsOpen(false);
    setSelectedDrink(null);
    setSelectedDrinkSize('medium');
    setSelectedToppings({});
    setSugarMultiplier(1);
    setIceLevelIndex(3);
    setSwapSugar(false);
    setUseOatMilk(false);
    setIsHot(false);
    setEditingOrderItemId(null);
  }, []);

  const closeFoodConfirm = useCallback(() => {
    setIsFoodConfirmOpen(false);
    setSelectedFood(null);
  }, []);

  function addFood(item){
    if(!item){
      return;
    }

    setOrderSubmitMessage('');
    setOrderSubmitError('');

      setOrderItems((prev) => {
        // Find if this exact food item is already in the cart
        const existingIndex = prev.findIndex(
          (orderItem) => orderItem.menuId === item.id && (!orderItem.modifications_array || orderItem.modifications_array.length === 0)
        );
        
        if (existingIndex !== -1) {
          const copy = [...prev];
          const existing = copy[existingIndex];
          copy[existingIndex] = buildOrderEntry({
            entryId: existing.id,
            menuId: existing.menuId,
            name: item.name,
            baseCost: item.price,
            modificationsArray: [],
            quantity: existing.quantity + 1
          });
          return copy;
        }
        
        const orderEntry = buildOrderEntry({
          entryId: `food-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          menuId: item.id,
          name: item.name,
          baseCost: item.price,
          modificationsArray: [],
        });
        return [...prev, orderEntry];
      });
  }

  const confirmAddFood = useCallback(() => {
    if (!selectedFood) {
      console.log("none");
      closeFoodConfirm();
      return;
    }


    setOrderSubmitMessage('');
    setOrderSubmitError('');

      setOrderItems((prev) => {
        const existingIndex = prev.findIndex(
          (orderItem) => orderItem.menuId === selectedFood.id && (!orderItem.modifications_array || orderItem.modifications_array.length === 0)
        );
        
        if (existingIndex !== -1) {
          const copy = [...prev];
          const existing = copy[existingIndex];
          copy[existingIndex] = buildOrderEntry({
            entryId: existing.id,
            menuId: existing.menuId,
            name: selectedFood.name,
            baseCost: selectedFood.price,
            modificationsArray: [],
            quantity: existing.quantity + 1
          });
          return copy;
        }
        
        const orderEntry = buildOrderEntry({
          entryId: `food-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          menuId: selectedFood.id,
          name: selectedFood.name,
          baseCost: selectedFood.price,
          modificationsArray: [],
        });
        return [...prev, orderEntry];
      });
    closeFoodConfirm();
  }, [selectedFood, closeFoodConfirm, buildOrderEntry]);

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
    const modificationsArray = [];

    if (Number.isInteger(sugarMenuId)) {
      modificationsArray.push({
        category: 'modifications',
        cost: 0,
        menu_id: sugarMenuId,
        name: `Sugar ${formatMultiplier(sugarMultiplier)}x`,
      });
    }

    if (Number.isInteger(iceMenuId)) {
      const iceMultiplier = iceLevelMultipliers[iceLevelIndex] ?? 1;
      modificationsArray.push({
        category: 'modifications',
        cost: 0,
        menu_id: iceMenuId,
        name: `Ice ${formatMultiplier(iceMultiplier)}x`,
      });
    }

    if (swapSugar && Number.isInteger(swapSugarMenuId)) {
      const swapSugarMod = modificationItems.find((mod) => mod.id === swapSugarMenuId);
      modificationsArray.push({
        category: swapSugarMod?.category || 'modifications',
        cost: swapSugarMod?.price || 0,
        menu_id: swapSugarMenuId,
        name: swapSugarMod?.name || 'Swap Sugar',
      });
    }

    if (useOatMilk && Number.isInteger(oatMilkMenuId)) {
      const oatMilkMod = modificationItems.find((mod) => mod.id === oatMilkMenuId);
      modificationsArray.push({
        category: oatMilkMod?.category || 'modifications',
        cost: oatMilkMod?.price || 0,
        menu_id: oatMilkMenuId,
        name: oatMilkMod?.name || 'Oat Milk',
      });
    }

    if (isHot && Number.isInteger(hotMenuId)) {
      const hotMod = modificationItems.find((mod) => mod.id === hotMenuId);
      modificationsArray.push({
        category: hotMod?.category || 'modifications',
        cost: hotMod?.price || 0,
        menu_id: hotMenuId,
        name: hotMod?.name || 'Hot',
      });
    }

    selectedToppingEntries.forEach((topping) => {
      const qty = Number.isInteger(topping.quantity) && topping.quantity > 0 ? topping.quantity : 0;
      for (let i = 0; i < qty; i += 1) {
        modificationsArray.push({
          category: 'topping',
          cost: topping.price,
          menu_id: topping.id,
          name: topping.name,
        });
      }
    });

    const selectedDrinkMenuItem = allMenuItems.find((menuItem) => menuItem.id === selectedDrinkMenuId);
    const baseDrinkName = selectedDrinkMenuItem?.name || `${selectedDrink.name} ${selectedDrinkSize}`;
    const newEntry = buildOrderEntry({
      entryId: editingOrderItemId || `drink-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      menuId: selectedDrinkMenuId,
      name: baseDrinkName,
      baseCost: selectedDrinkPrice,
      modificationsArray,
      quantity: drinkQuantity,
    });

    setOrderSubmitMessage('');
    setOrderSubmitError('');
    
    setOrderItems((prev) => {
        let foundMatchIndex = -1;
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].id !== editingOrderItemId && areItemsIdentical(prev[i], newEntry)) {
            foundMatchIndex = i;
            break;
          }
        }

        if (foundMatchIndex !== -1) {
          const copy = [...prev];
          const existing = copy[foundMatchIndex];
          const mergedQty = existing.quantity + newEntry.quantity;
          
          copy[foundMatchIndex] = buildOrderEntry({
            entryId: existing.id,
            menuId: existing.menuId,
            name: baseDrinkName,
            baseCost: selectedDrinkPrice,
            modificationsArray,
            quantity: mergedQty
          });

          if (editingOrderItemId) {
            const removeIndex = copy.findIndex((item) => item.id === editingOrderItemId);
            if (removeIndex !== -1) copy.splice(removeIndex, 1);
          }
          return copy;
        }

        if (editingOrderItemId) {
          const index = prev.findIndex((item) => item.id === editingOrderItemId);
          if (index === -1) return [...prev, newEntry];
          const copy = [...prev];
          copy.splice(index, 1, newEntry);
          return copy;
        } else {
          return [...prev, newEntry];
        }
      });


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
    isHot,
    selectedToppingEntries,
    editingOrderItemId,
    closeToppingsScreen,
    sugarMenuId,
    iceMenuId,
    swapSugarMenuId,
    oatMilkMenuId,
    hotMenuId,
    modificationItems,
    buildOrderEntry,
    allMenuItems,
    drinkQuantity,
  ]);

  const editOrderItem = useCallback((item) => {
    const menuItem = allMenuItems.find((candidate) => candidate.id === item.menuId);
    if (!menuItem || menuItem.category !== 'drink') return;

    const parsedDrink = parseDrinkVariant(menuItem.name);
    const baseName = parsedDrink.baseName;
    const parsedSize = parsedDrink.size;

    const matchedDrink = drinkItems.find(
      (drink) => drink.name.toLowerCase() === baseName.toLowerCase()
    );

    const fallbackDrink = {
      id: menuItem.id,
      name: baseName,
      category: 'drink',
      image: getMenuImage(baseName, 'drink'),
      description: getMenuDescription(baseName, 'drink'),
      sizeOptions: { [parsedSize]: menuItem.price },
      sizeMenuIds: { [parsedSize]: menuItem.id },
    };

    const sourceDrink = matchedDrink || fallbackDrink;
    const selectedSize = Number.isFinite(sourceDrink?.sizeOptions?.[parsedSize])
      ? parsedSize
      : ['medium', 'small', 'large'].find((size) => Number.isFinite(sourceDrink?.sizeOptions?.[size])) || 'medium';

    const toppingsMap = (item.modifications_array || []).reduce((acc, modification) => {
      if (modification.category === 'topping' && Number.isInteger(modification.menu_id)) {
        acc[modification.menu_id] = (acc[modification.menu_id] || 0) + 1;
      }
      return acc;
    }, {});

    const sugarMod = (item.modifications_array || []).find(
      (modification) => modification.menu_id === sugarMenuId
    );
    const iceMod = (item.modifications_array || []).find(
      (modification) => modification.menu_id === iceMenuId
    );

    const parsedSugarMultiplier = parseModifierMultiplier(sugarMod?.name, 'Sugar');
    const parsedIceMultiplier = parseModifierMultiplier(iceMod?.name, 'Ice');
    const resolvedSugar = parsedSugarMultiplier ?? 1;
    const resolvedIce = parsedIceMultiplier ?? 1;
    const iceIndex = iceLevelMultipliers.findIndex((value) => value === resolvedIce);

    const hasSwapSugarMod = Number.isInteger(swapSugarMenuId)
      && (item.modifications_array || []).some((modification) => modification.menu_id === swapSugarMenuId);
    const hasOatMilkMod = Number.isInteger(oatMilkMenuId)
      && (item.modifications_array || []).some((modification) => modification.menu_id === oatMilkMenuId);

    const hasHotMod = Number.isInteger(hotMenuId)
      && (item.modifications_array || []).some((modification) => modification.menu_id === hotMenuId);

    setEditingOrderItemId(item.id);
    setSelectedDrink(sourceDrink);
    setSelectedDrinkSize(selectedSize);
    setSelectedToppings(toppingsMap);
    setSugarMultiplier(resolvedSugar);
    setIceLevelIndex(iceIndex >= 0 ? iceIndex : 3);
    setSwapSugar(hasSwapSugarMod);
    setUseOatMilk(hasOatMilkMod);
    setIsHot(hasHotMod);
    setDrinkQuantity(Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1);
    setIsToppingsOpen(true);
  }, [
    allMenuItems,
    drinkItems,
    getMenuImage,
    getMenuDescription,
    sugarMenuId,
    iceMenuId,
    swapSugarMenuId,
    oatMilkMenuId,
    hotMenuId,
  ]);

  const removeOrderItem = useCallback((itemId) => {
    setOrderSubmitMessage('');
    setOrderSubmitError('');
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const handleFinishOrder = useCallback(() => {
    setTheme('standard');

    if (orderItems.length === 0) return;

    setOrderSubmitMessage('');
    setOrderSubmitError('');

    try {
      const payloadItems = [];
      orderItems.forEach((item, itemIndex) => {
        if (!Number.isInteger(item?.menuId)) {
          throw new Error(`Could not resolve menu ID for order item ${itemIndex + 1} (${item.name}).`);
        }

        const toppingCounts = Array.isArray(item.modifications_array)
          ? item.modifications_array.reduce((acc, modification) => {
              if (Number.isInteger(modification?.menu_id)) {
                const isIceOrSugar = modification.name?.toLowerCase().includes("ice") || modification.name?.toLowerCase().includes("sugar");
                if (isIceOrSugar) {
                  acc[modification.menu_id] = parseFloat(modification.name.replace(/x/g, '').split(' ').at(-1));
                } else {
                  acc[modification.menu_id] = (acc[modification.menu_id] || 0) + 1;
                }
              }
              return acc;
            }, {})
          : {};

        const toppings = Object.entries(toppingCounts)
          .map(([id, quantity]) => ({
            id: Number(id),
            quantity,
          }))
          .filter((entry) => Number.isInteger(entry.id) && Number.isFinite(entry.quantity) && entry.quantity >= 0);
        
        const itemQty = Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1;
        // Unroll items to ensure the kitchen & inventory correctly maps modifiers to EACH distinct drink instance
        for (let i = 0; i < itemQty; i++) {
          payloadItems.push({
            menuId: item.menuId,
            quantity: 1,
            toppings,
          });
        }
      });

      orderMutation.mutate({
        orderTotal: Number(orderSubtotal.toFixed(2)),
        customerName: customerName.trim() || 'Guest',
        items: payloadItems,
      });
      setCustomerName('');
      
    } catch (submitError) {
      setOrderSubmitError(submitError.message || 'Unable to submit order. Please try again.');
    }
  }, [orderItems, orderSubtotal, orderMutation, customerName]);

  useEffect(() => {
    const handleVoiceCheckout = () => {
      handleFinishOrder();
    };

    window.addEventListener('a11y-checkout-order', handleVoiceCheckout);

    return () => {
      window.removeEventListener('a11y-checkout-order', handleVoiceCheckout);
    };
  }, [handleFinishOrder]);

  const handleChatAction = useCallback((chatAction) => {
    const action = normalizeChatText(chatAction?.action);
    const incomingItems = Array.isArray(chatAction?.orderItems) ? chatAction.orderItems : [];
    console.log(`Received chat action: ${action} with items:`, incomingItems);
    if (incomingItems.length === 0) return;
    

    if (action === 'add_to_order') {
      const normalizedOrderItems = incomingItems
        .map((item, index) => {
          const menuId = Number(item?.menuId);
          if (!Number.isInteger(menuId)) {
            return null;
          }

          const matchedMenuItem = allMenuItems.find((menuItem) => menuItem.id === menuId);
          if (!matchedMenuItem) {
            return null;
          }

          const rawMods = Array.isArray(item?.modifications_array) ? item.modifications_array : [];
          const menuModifications = rawMods
            .map((modification) => {
              const modificationMenuId = Number(modification?.menu_id);
              if (!Number.isInteger(modificationMenuId)) return null;
              const matchedModification = allMenuItems.find((menuItem) => menuItem.id === modificationMenuId);
              if (!matchedModification) return null;
              return {
                category: String(modification?.category || matchedModification.category || '').toLowerCase(),
                cost: Number.isFinite(Number(modification?.cost)) ? Number(modification.cost) : matchedModification.price,
                menu_id: matchedModification.id,
                name: String(modification?.name || matchedModification.name || '').trim(),
              };
            })
            .filter(Boolean);

          if (matchedMenuItem.category === 'food') {
            return buildOrderEntry({
              entryId: `chat-food-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
              menuId: matchedMenuItem.id,
              name: matchedMenuItem.name,
              baseCost: matchedMenuItem.price,
              modificationsArray: [],
            });
          }

          if (matchedMenuItem.category !== 'drink') {
            return null;
          }

          const hasSugar = Number.isInteger(sugarMenuId)
            && menuModifications.some((modification) => modification.menu_id === sugarMenuId);
          const hasIce = Number.isInteger(iceMenuId)
            && menuModifications.some((modification) => modification.menu_id === iceMenuId);

          if (!hasSugar && Number.isInteger(sugarMenuId)) {
            menuModifications.push({
              category: 'modifications',
              cost: 0,
              menu_id: sugarMenuId,
              name: 'Sugar 1x',
            });
          }
          if (!hasIce && Number.isInteger(iceMenuId)) {
            menuModifications.push({
              category: 'modifications',
              cost: 0,
              menu_id: iceMenuId,
              name: 'Ice 1x',
            });
          }

          return buildOrderEntry({
            entryId: `chat-drink-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
            menuId: matchedMenuItem.id,
            name: matchedMenuItem.name,
            baseCost: matchedMenuItem.price,
            modificationsArray: menuModifications,
          });
        })
        .filter(Boolean);

      if (normalizedOrderItems.length === 0) return;

      setOrderSubmitMessage('');
      setOrderSubmitError('');
      setOrderItems((prev) => [...prev, ...normalizedOrderItems]);
      return;
    }

    if (action !== 'remove_from_order' ) return;

    setOrderSubmitMessage('');
    setOrderSubmitError('');
    setOrderItems((prev) => {
      const remainingItems = [...prev];

      incomingItems.forEach((itemToRemove) => {
        const requestedMenuId = Number(itemToRemove?.menuId);
        const requestedName = normalizeChatText(itemToRemove?.name || itemToRemove?.description);
        const requestedToppings = getRequestedToppings(itemToRemove);

        const indexToRemove = remainingItems.findIndex((orderItem) => {
          if (Number.isInteger(requestedMenuId) && orderItem.menuId !== requestedMenuId) {
            return false;
          }

          const orderItemName = normalizeChatText(orderItem?.name);
          if (requestedName && !(orderItemName === requestedName || orderItemName.includes(requestedName) || requestedName.includes(orderItemName))) {
            return false;
          }

          if (requestedToppings.length === 0) {
            return true;
          }

          const orderToppings = getRequestedToppings(orderItem);
          const orderToppingCounts = orderToppings.reduce((acc, topping) => {
            const key = Number.isInteger(topping.menuId) ? `id:${topping.menuId}` : `name:${topping.name}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {});

          return requestedToppings.every((topping) => {
            const key = Number.isInteger(topping.menuId) ? `id:${topping.menuId}` : `name:${topping.name}`;
            const available = orderToppingCounts[key] || 0;
            if (available <= 0) return false;
            orderToppingCounts[key] = available - 1;
            return true;
          });
        });

        if (indexToRemove >= 0) {
          remainingItems.splice(indexToRemove, 1);
        }
      });

      return remainingItems;
    });
  }, [allMenuItems, buildOrderEntry, sugarMenuId, iceMenuId]);

  if (isLoading) {
    return (
      <div className={`${theme === "high-contrast" ? "customer-page-2" : "customer-page"} d-flex justify-content-center align-items-center`}>
        <Spinner animation="border" className="tea-spinner" />
      </div>
    );
  }

  return (
    <div className={`${theme === "high-contrast" ? "customer-page-2" : "customer-page"} ${magnifyScreen ? "zoomed" : ""}`}>
      <div className={`customer-shell pt-2`}>
        {/* Category Navigation */}
        <Navbar expand="lg" className="tea-nav container mb-3" aria-label="Category navigation">
          <Container fluid className="p-0 align-items-center">
            <Navbar.Brand href="#" className="tea-brand me-4" aria-label="Tea shop home">
              <img src="teashopLogo.png" alt="Tea Shop Logo" className="tea-logo" />
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="customerCategoryNav" />

            <Navbar.Collapse id="customerCategoryNav">
              <Nav className="me-auto tea-links align-items-center" style={{ '--tab-count': 2 }}>
                <NavDropdown
                  title={activeCategory !== 'food' ? translate(activeCategory) : translate('Drinks')}
                  id="drink-category-dropdown"
                  className={`kiosk-dropdown p-0 h-100 ${activeCategory !== 'food' ? 'is-active' : ''}`}
                >
                  <NavDropdown.Item
                    key={ALL_DRINKS}
                    onClick={() => setActiveCategory(ALL_DRINKS)}
                    className={`kiosk-dropdown-item ${activeCategory === ALL_DRINKS ? 'is-active' : ''}`}
                  >
                    {translate(ALL_DRINKS)}
                  </NavDropdown.Item>
                  {drinkSubcategories.map((sub) => (
                    <NavDropdown.Item
                      key={sub}
                      onClick={() => setActiveCategory(sub)}
                      className={`kiosk-dropdown-item ${activeCategory === sub ? 'is-active' : ''}`}
                    >
                      {translate(sub)}
                    </NavDropdown.Item>
                  ))}
                </NavDropdown>
                <Nav.Item>
                  <button
                    type="button"
                    className={`kiosk-category-btn ${activeCategory === 'food' ? 'is-active' : ''}`}
                    onClick={() => setActiveCategory('food')}
                  >
                    {translate('Food')}
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

        <div className="kiosk-layout container">
          <div className='row h-100 w-100' style={{minHeight: 0}}>
            <div className='col-8 h-100 d-flex flex-column'>
              <Menu
                items={visibleItems}
                activeCategory={activeCategory}
                isLoading={false}
                onSelectItem={handleSelectItem}
                onCardImageError={handleCardImageError}
              />
            </div>
            <div className='col-4 h-100'>
                <OrderSummary
                orderItems={orderItems}
                subtotal={orderSubtotal}
                isError={isError}
                errorMessage={error?.message}
                menuItemCount={allMenuItems.length}
                submitMessage={orderSubmitMessage}
                submitError={orderSubmitError}
                isPending={orderMutation.isPending}
                sugarMenuId={sugarMenuId}
                iceMenuId={iceMenuId}
                onEditItem={editOrderItem}
                onRemoveItem={removeOrderItem}
                onFinishOrder={handleFinishOrder}
                customerName={customerName}
                setCustomerName={setCustomerName}
              />
            </div> 
          </div>
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
          isHot={isHot}
          hasSugarSlider={hasSugarSlider}
          hasIceControl={hasIceControl}
          hasSwapSugar={hasSwapSugar}
          hasOatMilkToggle={hasOatMilkToggle}
          hasHotToggle={hasHotToggle}
          editingOrderItemId={editingOrderItemId}
          onClose={closeToppingsScreen}
          onSave={saveDrinkSelection}
          onSizeChange={setSelectedDrinkSize}
          onToppingQuantityChange={updateToppingQuantity}
          onSugarChange={setSugarMultiplier}
          onIceChange={setIceLevelIndex}
          onSwapSugarChange={setSwapSugar}
          onOatMilkChange={setUseOatMilk}
          onHotChange={setIsHot}
          drinkQuantity={drinkQuantity}
          setDrinkQuantity={setDrinkQuantity}
    
        />

        {/* Food Confirmation Modal */}
        <FoodConfirmModal
          show={isFoodConfirmOpen}
          selectedFood={selectedFood}
          onClose={closeFoodConfirm}
          onConfirm={confirmAddFood}
        />
        {/* --- NEW: Floating Chatbot Widget --- */}
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
          
          {/* The Chat Window — always mounted so translate() calls pre-fetch when language changes */}
          <Card
            className="mb-3 shadow-lg border-0"
            style={{ width: '350px', height: '500px', borderRadius: '16px', overflow: 'hidden', display: isChatOpen ? undefined : 'none' }}
          >
            <Card.Header
              className="d-flex justify-content-between align-items-center text-white"
              style={{ backgroundColor: 'var(--tea-wood)' }}
            >
              <h6 className="mb-0 fw-bold">{translate('AI Assistant')}</h6>
              <button
                type="button"
                className="btn-close btn-close-white"
                style={{ transform: 'scale(1.5)', marginRight: '0.25rem' }}
                aria-label="Close"
                onClick={() => setIsChatOpen(false)}
              ></button>
            </Card.Header>
            <Card.Body className="p-0 overflow-auto bg-light">
              <Chatbot onChatAction={handleChatAction} />
            </Card.Body>
          </Card>
          {/* The Chat Bubble Button */}
          <div className="d-flex justify-content-end">
            <Button
              className="rounded-circle shadow-lg d-flex justify-content-center align-items-center border-0"
              style={{ 
                width: '6rem', 
                height: '6rem', 
                backgroundColor: 'var(--tea-wood)',
                transition: 'transform 0.2s'
              }}
              onClick={() => setIsChatOpen(!isChatOpen)}
              aria-label="Toggle Chatbot"
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '2.25rem' }}>
                {isChatOpen ? '✖️' : '💬'}
              </span>
            </Button>
          </div>
        </div>
        {/* --- END Floating Chatbot Widget --- */}

        {/* --- Floating Accessibility Widget --- */}
        <AccessibilityWidget />
        {/* --- END Floating Accessibility Widget --- */}
      </div>
    </div>
  );
}

export default Customer;
