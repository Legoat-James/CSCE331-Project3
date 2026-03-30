import './Customer.css'
import { useGet } from './hooks/useApi'
import apiClient from './api/client_config'
import { useMutate } from './hooks/useApi';
import React, { useEffect, useState } from 'react'; // MUST import useState



function Home() {

  const [activeCategory, setActiveCategory] = useState('drink');

  const [isToppingsOpen, setIsToppingsOpen] = useState(false); 
  const [isFoodConfirmOpen, setIsFoodConfirmOpen] = useState(false);
  
  // selectedDrink starts as 'null' (nothing selected yet)
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [selectedDrinkSize, setSelectedDrinkSize] = useState('medium');
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState({});
  const [sugarMultiplier, setSugarMultiplier] = useState(1);
  const [iceLevelIndex, setIceLevelIndex] = useState(2);
  const [swapSugar, setSwapSugar] = useState(false);
  const [useOatMilk, setUseOatMilk] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [editingOrderItemId, setEditingOrderItemId] = useState(null);
  const [orderSubmitMessage, setOrderSubmitMessage] = useState('');
  const [orderSubmitError, setOrderSubmitError] = useState('');
  const [resolvedImageByName, setResolvedImageByName] = useState({});
  const [requestedImageByName, setRequestedImageByName] = useState({});

  const orderMutation = useMutate("/api/orders/create", "POST",[]);

  const fallbackCardImage = 'https://picsum.photos/id/1040/900/600';

  const itemVisualsByName = {
    'black tea': {
      description: 'Classic brewed black tea with a smooth tannin finish and a bold, comforting aroma.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Cup_of_black_tea.JPG/330px-Cup_of_black_tea.JPG',
    },
    'black honey tea': {
      description: 'Fragrant black tea sweetened with mellow honey notes for a warm, rounded sip.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Chai_%28Tea%29_2.jpg/330px-Chai_%28Tea%29_2.jpg',
    },
    'coffee crema': {
      description: 'Velvety coffee-forward drink topped with a creamy finish and roasted caramel depth.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Affogato_al_Caffe.jpg/330px-Affogato_al_Caffe.jpg',
    },
    'coffee milk tea': {
      description: 'A balanced fusion of milk tea richness and smooth coffee flavor with light sweetness.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Caffe_Latte_at_Pulse_Cafe.jpg/330px-Caffe_Latte_at_Pulse_Cafe.jpg',
    },
    'golden retriever': {
      description: 'House signature golden milk tea blend with bright floral notes and silky texture.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Bubble_Tea.png/330px-Bubble_Tea.png',
    },
    'honey lemonade': {
      description: 'Citrusy lemonade sweetened with honey for a refreshing, sunny, and crisp finish.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Lemonade_-_27682817724.jpg/330px-Lemonade_-_27682817724.jpg',
    },
    'honey pearl milk tea': {
      description: 'Creamy milk tea with chewy pearls and layered honey sweetness in every sip.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Bubble_Tea.png/330px-Bubble_Tea.png',
    },
    'mango and passion fruit tea': {
      description: 'Tropical mango and passion fruit infusion with bright acidity and juicy tea notes.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Passiflora_edulis_forma_flavicarpa.jpg/330px-Passiflora_edulis_forma_flavicarpa.jpg',
    },
    'mango green mlik tea': {
      description: 'Green milk tea blended with ripe mango flavor for a creamy, fruity profile.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Green_tea_3_appearances.jpg/330px-Green_tea_3_appearances.jpg',
    },
    'mango green tea': {
      description: 'Fresh green tea base with sweet mango character and a clean, lightly grassy finish.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Green_tea_3_appearances.jpg/330px-Green_tea_3_appearances.jpg',
    },
    'mango matcha fresh milk': {
      description: 'Creamy fresh milk layered with mango sweetness and earthy matcha complexity.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Matcha_Scoop.jpg/330px-Matcha_Scoop.jpg',
    },
    'matcha pearl milk tea': {
      description: 'Matcha milk tea with bouncy pearls, combining gentle bitterness and creamy sweetness.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Matcha_Scoop.jpg/330px-Matcha_Scoop.jpg',
    },
    'pearl milk tea': {
      description: 'Traditional pearl milk tea with smooth tea flavor and chewy tapioca pearls.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Bubble_Tea.png/330px-Bubble_Tea.png',
    },
    'strawberry coconut': {
      description: 'Sweet strawberry and coconut blend with a creamy tropical finish.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Cononut_milk.JPG/330px-Cononut_milk.JPG',
    },
    'thai pearl milk tea': {
      description: 'Thai-style milk tea with pearl topping, deep spice notes, and caramel sweetness.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Cha_yen.JPG/330px-Cha_yen.JPG',
    },
    'tiger boba': {
      description: 'Brown sugar tiger stripes over milk tea and boba for a rich caramelized treat.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Bubble_Tea.png/330px-Bubble_Tea.png',
    },
    'avacado toast': {
      description: 'Crisp toasted bread layered with seasoned avocado mash and savory toppings.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Avocado_toast_at_Voyager_Espresso_%2833134505776%29.jpg/330px-Avocado_toast_at_Voyager_Espresso_%2833134505776%29.jpg',
    },
    'bagel sandwhich': {
      description: 'Warm bagel sandwich stacked with hearty fillings for a satisfying bite.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Bagel_with_sesame_3.jpg/330px-Bagel_with_sesame_3.jpg',
    },
    fries: {
      description: 'Golden fries with a crisp outside, fluffy center, and a savory potato finish.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/French_Fries.JPG/330px-French_Fries.JPG',
    },
    'grilled cheese': {
      description: 'Buttery toasted bread with a melty cheese center and classic comfort flavor.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Classic_Grilled_Cheese_Sandwich_%2825791331763%29_%28cropped%29.jpg/330px-Classic_Grilled_Cheese_Sandwich_%2825791331763%29_%28cropped%29.jpg',
    },
  };

  const normalizeItemName = (name) => String(name || '').trim().toLowerCase();

  const imageSearchAliasesByName = {
    'black tea': 'black tea drink',
    'black honey tea': 'honey black tea',
    'coffee crema': 'coffee cream drink',
    'coffee milk tea': 'coffee milk tea',
    'golden retriever': 'milk tea',
    'honey lemonade': 'honey lemonade drink',
    'honey pearl milk tea': 'bubble tea pearls',
    'mango and passion fruit tea': 'mango passionfruit iced tea',
    'mango green mlik tea': 'mango green milk tea',
    'mango green tea': 'mango green tea drink',
    'mango matcha fresh milk': 'mango matcha latte',
    'matcha pearl milk tea': 'matcha bubble tea',
    'pearl milk tea': 'bubble tea',
    'strawberry coconut': 'strawberry coconut milk drink',
    'thai pearl milk tea': 'thai milk tea bubble tea',
    'tiger boba': 'brown sugar boba',
    'avacado toast': 'avocado toast',
    'bagel sandwhich': 'bagel sandwich',
    fries: 'french fries',
    'grilled cheese': 'grilled cheese sandwich',
  };

  const getImageSearchQuery = (name, category) => {
    const normalizedName = normalizeItemName(name)
      .replace(/\bmlik\b/g, 'milk')
      .replace(/\bavacado\b/g, 'avocado')
      .replace(/\bsandwhich\b/g, 'sandwich')
      .replace(/\b(small|medium|large)\b/g, '')
      .trim();

    if (imageSearchAliasesByName[normalizedName]) {
      return imageSearchAliasesByName[normalizedName];
    }

    return category === 'food'
      ? `${normalizedName} food`
      : `${normalizedName} milk tea drink`;
  };

  const fetchWikipediaImage = async (query) => {
    try {
      const searchResponse = await fetch(
        `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(query)}&limit=3`,
      );

      if (!searchResponse.ok) {
        return null;
      }

      const searchData = await searchResponse.json();
      const pages = Array.isArray(searchData?.pages) ? searchData.pages : [];

      for (const page of pages) {
        if (!page?.title) {
          continue;
        }

        const summaryResponse = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.title)}`,
        );

        if (!summaryResponse.ok) {
          continue;
        }

        const summaryData = await summaryResponse.json();
        const imageUrl = summaryData?.thumbnail?.source;

        if (imageUrl) {
          return imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl;
        }
      }
    } catch {
      return null;
    }

    return null;
  };

  const fetchOpenverseImage = async (query) => {
    try {
      const openverseResponse = await fetch(
        `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=3`,
      );

      if (!openverseResponse.ok) {
        return null;
      }

      const openverseData = await openverseResponse.json();
      const firstResult = Array.isArray(openverseData?.results)
        ? openverseData.results.find((result) => typeof result?.url === 'string')
        : null;

      return firstResult?.url || null;
    } catch {
      return null;
    }
  };

  const resolveImageForMenuItem = async (name, category) => {
    const query = getImageSearchQuery(name, category);
    const wikiImage = await fetchWikipediaImage(query);

    if (wikiImage) {
      return wikiImage;
    }

    return fetchOpenverseImage(query);
  };

  const normalizeCategory = (categoryValue) => {
    const normalized = String(categoryValue || '').trim().toLowerCase();

    if (normalized.startsWith('drink')) return 'drink';
    if (normalized.startsWith('food')) return 'food';
    if (normalized.startsWith('topping')) return 'topping';
    if (normalized.startsWith('mod')) return 'modifications';

    return normalized;
  };

  const getMenuImage = (name, category) => {
    const normalizedName = normalizeItemName(name);
    const mappedImage = itemVisualsByName[normalizedName]?.image;
    const resolvedImage = resolvedImageByName[normalizedName];

    if (mappedImage) {
      return mappedImage;
    }

    if (resolvedImage) {
      return resolvedImage;
    }

    if (category === 'food') {
      return 'https://picsum.photos/id/292/900/600';
    }

    return 'https://picsum.photos/id/766/900/600';
  };

  const handleCardImageError = (event) => {
    if (event.currentTarget.src !== fallbackCardImage) {
      event.currentTarget.src = fallbackCardImage;
    }
  };

  const getMenuDescription = (name, category) => {
    const normalizedName = normalizeItemName(name);
    const match = itemVisualsByName[normalizedName];

    if (match?.description) {
      return match.description;
    }

    if (category === 'food') {
      return 'Freshly prepared kitchen item crafted to pair perfectly with your tea.';
    }

    if (category === 'drink') {
      return 'Handcrafted milk tea made to order with balanced flavor and sweetness.';
    }

    return 'House specialty item with rotating ingredients and seasonal flavors.';
  };

  const { data, isLoading, error, isError } = useGet(['full-menu'], '/api/menu/all',
    {
      retry: false //only try to query once
    }
  );

  useEffect(() => {
    const activeMenuItems = Array.isArray(data)
      ? data
          .filter((item) => item?.is_active !== false)
          .map((item) => ({
            name: item.name,
            category: normalizeCategory(item.category),
          }))
          .filter((item) => item.category === 'drink' || item.category === 'food')
      : [];

    if (activeMenuItems.length === 0) {
      return;
    }

    const uniqueByName = new Map();

    for (const item of activeMenuItems) {
      const key = normalizeItemName(item.name);
      if (!uniqueByName.has(key)) {
        uniqueByName.set(key, item);
      }
    }

    const unresolvedItems = [...uniqueByName.entries()]
      .filter(([key]) => !itemVisualsByName[key]?.image && !resolvedImageByName[key] && !requestedImageByName[key])
      .map(([key, item]) => ({ key, ...item }));

    if (unresolvedItems.length === 0) {
      return;
    }

    setRequestedImageByName((prev) => {
      const next = { ...prev };
      unresolvedItems.forEach((item) => {
        next[item.key] = true;
      });
      return next;
    });

    let isCancelled = false;

    const loadImages = async () => {
      const resolvedEntries = await Promise.all(
        unresolvedItems.map(async (item) => {
          const imageUrl = await resolveImageForMenuItem(item.name, item.category);
          return [item.key, imageUrl];
        }),
      );

      if (isCancelled) {
        return;
      }

      setResolvedImageByName((prev) => {
        const next = { ...prev };
        resolvedEntries.forEach(([key, imageUrl]) => {
          if (imageUrl) {
            next[key] = imageUrl;
          }
        });
        return next;
      });
    };

    loadImages();

    return () => {
      isCancelled = true;
    };
  }, [data, requestedImageByName, resolvedImageByName]);

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

  const iceLevelOptions = ['No Ice', 'Light Ice', 'Regular Ice', 'Extra Ice'];

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
    setEditingOrderItemId(null);
    setSelectedDrink(drinkItem); // Memorize which drink was clicked
    const defaultSize = Number.isFinite(drinkItem?.sizeOptions?.medium)
      ? 'medium'
      : (['small', 'large'].find((size) => Number.isFinite(drinkItem?.sizeOptions?.[size])) || 'medium');
    setSelectedDrinkSize(defaultSize);
    setSelectedToppings({});
    setSugarMultiplier(1);
    setIceLevelIndex(2);
    setSwapSugar(false);
    setUseOatMilk(false);
    setIsToppingsOpen(true);     // Flip the switch to open the screen
  };

  // We also need a way to close the screen!
  const closeToppingsScreen = () => {
    setIsToppingsOpen(false);    // Hide the screen
    setSelectedDrink(null);      // Clear the memory
    setSelectedDrinkSize('medium');
    setSelectedToppings({});
    setSugarMultiplier(1);
    setIceLevelIndex(2);
    setSwapSugar(false);
    setUseOatMilk(false);
    setEditingOrderItemId(null);
  };

  const closeFoodConfirm = () => {
    setIsFoodConfirmOpen(false);
    setSelectedFood(null);
  };

  const confirmAddFood = () => {
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
  };

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
            image: getMenuImage(item.name, category),
            description: getMenuDescription(item.name, category),
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
          image: getMenuImage(baseName, 'drink'),
          description: getMenuDescription(baseName, 'drink'),
          sizeOptions: {},
          sizeMenuIds: {},
        };
      }

      groups[key].sizeOptions[size] = item.price;
      groups[key].sizeMenuIds[size] = item.id;

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

  const toppingItems = allMenuItems.filter((item) => item.category === 'topping');
  const modificationItems = allMenuItems.filter((item) => item.category === 'modifications');

  const hasSugarSlider = modificationItems.some((item) => item.name.toLowerCase() === 'sugar');
  const hasIceControl = modificationItems.some((item) => item.name.toLowerCase() === 'ice');
  const hasSwapSugar = modificationItems.some((item) => item.name.toLowerCase() === 'swap sugar');
  const hasOatMilkToggle = modificationItems.some((item) => {
    const normalized = item.name.toLowerCase();
    return normalized === 'oak milk' || normalized === 'oat milk';
  });

  const modificationByName = modificationItems.reduce((lookup, item) => {
    lookup[item.name.toLowerCase()] = item;
    return lookup;
  }, {});

  const foodItems = allMenuItems.filter((item) => item.category === 'food');
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
    (sum, topping) => sum + (topping.price * topping.quantity),
    0,
  );

  const selectedDrinkTotal = (selectedDrinkPrice || 0) + toppingsTotal;

  const orderSubtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const resolveItemMenuId = (item) => {
    if (Number.isInteger(item?.menuId)) {
      return item.menuId;
    }

    if (item?.type === 'drink') {
      const matchedDrink = drinkItems.find(
        (drink) => drink.name.toLowerCase() === String(item.name || '').toLowerCase(),
      );

      if (matchedDrink) {
        const sizeKey = item.size || 'medium';
        return matchedDrink.sizeMenuIds?.[sizeKey] ?? matchedDrink.id;
      }
    }

    const matchedMenu = allMenuItems.find(
      (menuItem) => menuItem.category === item?.type && menuItem.name.toLowerCase() === String(item?.name || '').toLowerCase(),
    );

    return matchedMenu?.id;
  };

  const handleFinishOrder = async () => {
    if (orderItems.length === 0) {
      return;
    }

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

      orderMutation.mutate(
        {
          orderTotal: Number(orderSubtotal.toFixed(2)),
          customerName: 'Guest',
          items: payloadItems,
        }
      )

    } catch (submitError) {
      setOrderSubmitError(submitError.message || 'Unable to submit order. Please try again.');
    }
  };

  useEffect(()=>{
    if(orderMutation.isSuccess){
      setOrderItems([]);
      setOrderSubmitMessage(`Order #${orderMutation.data.orderId} submitted successfully.`);
    }
    if(orderMutation.isError){
      setOrderSubmitError(orderMutation.error.message || 'Unable to submit order. Please try again.');
    }
  },[orderMutation.data]);


  const removeOrderItem = (itemId) => {
    setOrderSubmitMessage('');
    setOrderSubmitError('');
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const editOrderItem = (item) => {
    if (item.type !== 'drink') {
      return;
    }

    const matchedDrink = drinkItems.find(
      (drink) => drink.name.toLowerCase() === String(item.name || '').toLowerCase(),
    );

    const fallbackSize = item.size || 'medium';
    const fallbackDrink = {
      id: item.menuId ?? item.id,
      name: item.name,
      category: 'drink',
      image: getMenuImage(item.name, 'drink'),
      description: getMenuDescription(item.name, 'drink'),
      sizeOptions: {
        [fallbackSize]: item.price,
      },
      sizeMenuIds: {
        [fallbackSize]: item.menuId ?? item.id,
      },
    };

    const sourceDrink = matchedDrink || fallbackDrink;
    const selectedSize = Number.isFinite(sourceDrink?.sizeOptions?.[item.size])
      ? item.size
      : (['medium', 'small', 'large'].find((size) => Number.isFinite(sourceDrink?.sizeOptions?.[size])) || fallbackSize);

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
  };

  const updateToppingQuantity = (toppingId, delta) => {
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
  };

  const saveDrinkSelection = () => {
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
      setOrderItems((prev) =>
        prev.map((item) => (item.id === editingOrderItemId ? orderEntry : item)),
      );
    } else {
      setOrderItems((prev) => [...prev, orderEntry]);
    }

    closeToppingsScreen();
  };

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
                    loading="lazy"
                    onError={handleCardImageError}
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

            <div className="order-list">
              {orderItems.length === 0 && (
                <p className="order-empty">No items in order yet.</p>
              )}

              {orderItems.map((item) => (
                <div key={item.id} className="order-line-item">
                  <div className="order-line-header">
                    <span className="order-line-name">{item.name}</span>
                    <div className="order-line-actions">
                      <span className="order-line-price">${item.totalPrice.toFixed(2)}</span>
                      {item.type === 'drink' && (
                        <button
                          type="button"
                          className="order-edit-btn"
                          aria-label={`Edit ${item.name}`}
                          onClick={() => editOrderItem(item)}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.06-9.06.92.92L5.92 19.58zM20.7 7.04a1 1 0 0 0 0-1.42l-2.32-2.32a1 1 0 0 0-1.42 0l-1.42 1.42 3.75 3.75 1.41-1.43z" />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        className="order-remove-btn"
                        aria-label={`Remove ${item.name} from order`}
                        onClick={() => removeOrderItem(item.id)}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm-3 6h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 9zm4 2v8h2v-8h-2zm4 0v8h2v-8h-2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {item.type === 'drink' && (
                    <div className="order-line-details">
                      <div>Size: {item.size}</div>
                      <div>Sugar: {item.sugarMultiplier.toFixed(2)}x</div>
                      <div>Ice: {item.iceLevel}</div>
                      {item.swapSugar && <div>Swap Sugar: selected</div>}
                      {item.useOatMilk && <div>Oat Milk: selected</div>}
                      {item.toppings.length > 0 && (
                        <div>
                          Toppings: {item.toppings.map((topping) => `${topping.name} x${topping.quantity}`).join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="order-subtotal">Subtotal: ${orderSubtotal.toFixed(2)}</p>

            {orderSubmitMessage && <p className="order-submit-message success">{orderSubmitMessage}</p>}
            {orderSubmitError && <p className="order-submit-message error">{orderSubmitError}</p>}

            <button
              className="btn tea-btn-finish btn-sm"
              onClick={handleFinishOrder}
              disabled={orderMutation.isPending || orderItems.length === 0}
            >
              {orderMutation.isPending ? 'Submitting...' : 'Finish Order'}
            </button>
          </aside>
        </div>

      {isToppingsOpen && (
        <div
          className="tea-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="toppings-modal-title"
        >
          <div className="tea-modal-card tea-modal-card--drink">
            <div className="tea-modal-header">
              <h3 id="toppings-modal-title" className="tea-modal-title">
                {editingOrderItemId ? 'Edit' : 'Customize'} your {selectedDrink?.name}
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

              <p className="tea-mod-heading">Toppings</p>
              <div className="tea-toppings-list">
                {toppingItems.length === 0 && (
                  <p className="tea-modal-note">No toppings available from the database.</p>
                )}

                {toppingItems.map((topping) => (
                  <div key={topping.id} className="tea-topping-row">
                    <div className="tea-topping-meta">
                      <span className="tea-topping-name">{topping.name}</span>
                      <span className="tea-topping-price">+${topping.price.toFixed(2)}</span>
                    </div>
                    <div className="tea-topping-controls">
                      <button
                        type="button"
                        className="btn tea-qty-btn"
                        onClick={() => updateToppingQuantity(topping.id, -1)}
                      >
                        -
                      </button>
                      <span className="tea-qty-value">{selectedToppings[topping.id] || 0}</span>
                      <button
                        type="button"
                        className="btn tea-qty-btn"
                        onClick={() => updateToppingQuantity(topping.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="tea-mod-heading">Modifications</p>

              {hasSugarSlider && (
                <div className="tea-slider-block">
                  <label htmlFor="sugar-slider" className="tea-slider-label">
                    Sugar Multiplier: <strong>{sugarMultiplier.toFixed(2)}x</strong>
                  </label>
                  <input
                    id="sugar-slider"
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.25"
                    value={sugarMultiplier}
                    onChange={(e) => setSugarMultiplier(Number(e.target.value))}
                  />
                </div>
              )}

              {hasIceControl && (
                <div className="tea-slider-block">
                  <label htmlFor="ice-slider" className="tea-slider-label">
                    Ice Level: <strong>{iceLevelOptions[iceLevelIndex]}</strong>
                  </label>
                  <input
                    id="ice-slider"
                    type="range"
                    min="0"
                    max="3"
                    step="1"
                    value={iceLevelIndex}
                    onChange={(e) => setIceLevelIndex(Number(e.target.value))}
                  />
                </div>
              )}

              <div className="tea-toggle-list">
                {hasSwapSugar && (
                  <label className="tea-toggle-item">
                    <input
                      type="checkbox"
                      checked={swapSugar}
                      onChange={(e) => setSwapSugar(e.target.checked)}
                    />
                    <span>Swap Sugar</span>
                  </label>
                )}

                {hasOatMilkToggle && (
                  <label className="tea-toggle-item">
                    <input
                      type="checkbox"
                      checked={useOatMilk}
                      onChange={(e) => setUseOatMilk(e.target.checked)}
                    />
                    <span>Oat Milk</span>
                  </label>
                )}
              </div>

              <p className="tea-modal-note">Toppings can be added in any quantity. Swap sugar and oat milk are included in order submission when selected.</p>

              <p className="tea-modal-total">Current drink total: ${selectedDrinkTotal.toFixed(2)}</p>
            </div>

            <div className="tea-modal-actions">
              <button className="btn tea-modal-btn-secondary" onClick={closeToppingsScreen}>
                Cancel
              </button>
              <button className="btn tea-modal-btn-primary" onClick={saveDrinkSelection}>
                {editingOrderItemId ? 'Save Changes' : 'Add Drink'}
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
