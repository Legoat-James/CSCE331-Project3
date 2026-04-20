import React, { useEffect, useMemo, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  Badge,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { useGet, useMutate } from '../../hooks/useApi';

const CATEGORY_ORDER = {
  drink: 0,
  food: 1,
  topping: 2,
  toppings: 2,
  modifications: 3,
};

const normalizeCategory = (value) => String(value || '').trim().toLowerCase();
const normalizeLookup = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
const stripDrinkSizeSuffix = (value) => String(value || '').trim().replace(/\s+/g, ' ').replace(/\s+(small|large)$/i, '').trim();
const isDrinkSizeVariant = (item) =>
  normalizeCategory(item?.category) === 'drink' && /\s+(small|large)$/i.test(String(item?.name || '').trim());
const DRINK_SIZE_MULTIPLIERS = {
  base: 1,
  small: 0.5,
  large: 1.5,
};
const SIZE_SPECIFIC_INGREDIENT_FAMILIES = ['cup', 'lid', 'straw'];

const getIngredientFamily = (name) => {
  const normalized = normalizeLookup(name);
  return SIZE_SPECIFIC_INGREDIENT_FAMILIES.find((family) => normalized.includes(family)) || null;
};

const findIngredientVariant = (ingredients, family, size) => {
  if (!family) {
    return null;
  }

  const normalizedFamily = normalizeLookup(family);
  const sizeToken = size === 'base' ? null : size;

  const exactMatches = ingredients.filter((ingredient) => {
    const normalized = normalizeLookup(ingredient.name);
    if (!normalized.includes(normalizedFamily)) {
      return false;
    }

    if (size === 'base') {
      return !normalized.includes('small') && !normalized.includes('large');
    }

    return normalized.includes(sizeToken);
  });

  if (exactMatches.length > 0) {
    return exactMatches.sort((a, b) => String(a.name || '').length - String(b.name || '').length)[0];
  }

  return null;
};

export default function RecipeBuilder() {
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [recipeSearch, setRecipeSearch] = useState('');
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');

  const {
    data: menuItemsRaw = [],
    isLoading: menuLoading,
    error: menuError,
    refetch: refetchMenu,
  } = useGet(['manager-menu-items'], '/api/menu/manager-all', {
    retry: false,
  });

  const {
    data: recipesRaw = [],
    isLoading: recipesLoading,
    error: recipesError,
    refetch: refetchRecipes,
  } = useGet(['manager-recipes'], '/api/recipes/all', {
    retry: false,
  });

  const {
    data: ingredientsRaw = [],
    isLoading: ingredientsLoading,
    error: ingredientsError,
    refetch: refetchIngredients,
  } = useGet(['manager-ingredients'], '/api/ingredients/all', {
    retry: false,
  });

  const menuItems = useMemo(
    () =>
      menuItemsRaw
        .filter((item) => item.is_active)
        .map((item, index) => ({
          ...item,
          menu_id: item.menu_id ?? item.id ?? null,
          rowKey: item.menu_id ?? item.id ?? `${item.name || 'menu'}-${index}`,
        })),
    [menuItemsRaw]
  );

  const recipes = useMemo(
    () =>
      recipesRaw.map((recipe, index) => ({
        ...recipe,
        menu_id: recipe.menu_id ?? null,
        rowKey: recipe.menu_id ?? `${recipe.name || 'recipe'}-${index}`,
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      })),
    [recipesRaw]
  );

  const ingredients = useMemo(
    () =>
      ingredientsRaw.map((ingredient, index) => ({
        ...ingredient,
        ingredient_id: ingredient.ingredient_id ?? ingredient.id ?? null,
        rowKey: ingredient.ingredient_id ?? ingredient.id ?? `${ingredient.name || 'ingredient'}-${index}`,
      })),
    [ingredientsRaw]
  );

  const ingredientsById = useMemo(() => {
    const map = new Map();
    ingredients.forEach((ingredient) => {
      map.set(String(ingredient.ingredient_id), ingredient);
    });
    return map;
  }, [ingredients]);

  const sortedMenuItems = useMemo(
    () =>
      [...menuItems].sort((a, b) => {
        const aCategory = normalizeCategory(a.category);
        const bCategory = normalizeCategory(b.category);
        const aRank = CATEGORY_ORDER[aCategory] ?? Number.MAX_SAFE_INTEGER;
        const bRank = CATEGORY_ORDER[bCategory] ?? Number.MAX_SAFE_INTEGER;

        if (aRank !== bRank) {
          return aRank - bRank;
        }

        const aId = Number(a.menu_id);
        const bId = Number(b.menu_id);
        if (Number.isFinite(aId) && Number.isFinite(bId) && aId !== bId) {
          return aId - bId;
        }

        return String(a.name || '').localeCompare(String(b.name || ''));
      }),
    [menuItems]
  );

  const recipesByMenuId = useMemo(() => {
    const map = new Map();
    recipes.forEach((recipe) => {
      map.set(String(recipe.menu_id), recipe);
    });
    return map;
  }, [recipes]);

  const selectedMenuItem = useMemo(
    () => sortedMenuItems.find((item) => String(item.menu_id) === String(selectedMenuId)) || null,
    [sortedMenuItems, selectedMenuId]
  );

  const selectedRecipe = useMemo(
    () => (selectedMenuItem ? recipesByMenuId.get(String(selectedMenuItem.menu_id)) || null : null),
    [recipesByMenuId, selectedMenuItem]
  );

  const selectedDrinkFamily = useMemo(() => {
    if (!selectedMenuItem || normalizeCategory(selectedMenuItem.category) !== 'drink' || isDrinkSizeVariant(selectedMenuItem)) {
      return null;
    }

    const baseName = stripDrinkSizeSuffix(selectedMenuItem.name);
    const baseKey = normalizeLookup(baseName);
    const smallKey = normalizeLookup(`${baseName} small`);
    const largeKey = normalizeLookup(`${baseName} large`);
    const drinks = menuItems.filter((item) => normalizeCategory(item.category) === 'drink');

    const baseItem = drinks.find((item) => normalizeLookup(item.name) === baseKey) || selectedMenuItem;
    const smallItem = drinks.find((item) => normalizeLookup(item.name) === smallKey) || null;
    const largeItem = drinks.find((item) => normalizeLookup(item.name) === largeKey) || null;

    return {
      baseItem,
      smallItem,
      largeItem,
    };
  }, [menuItems, selectedMenuItem]);

  const baseRecipeMenuId = selectedMenuItem?.menu_id ?? null;
  const smallRecipeMenuId = selectedDrinkFamily?.smallItem?.menu_id ?? null;
  const largeRecipeMenuId = selectedDrinkFamily?.largeItem?.menu_id ?? null;

  const addBaseIngredientMutation = useMutate(
    baseRecipeMenuId != null
      ? `/api/recipes/add-ingredient?menuID=${baseRecipeMenuId}`
      : '/api/recipes/add-ingredient',
    'POST',
    ['manager-recipes']
  );

  const addSmallIngredientMutation = useMutate(
    smallRecipeMenuId != null
      ? `/api/recipes/add-ingredient?menuID=${smallRecipeMenuId}`
      : '/api/recipes/add-ingredient',
    'POST',
    ['manager-recipes']
  );

  const addLargeIngredientMutation = useMutate(
    largeRecipeMenuId != null
      ? `/api/recipes/add-ingredient?menuID=${largeRecipeMenuId}`
      : '/api/recipes/add-ingredient',
    'POST',
    ['manager-recipes']
  );

  const removeBaseIngredientMutation = useMutate(
    baseRecipeMenuId != null
      ? `/api/recipes/remove-ingredient?menuID=${baseRecipeMenuId}`
      : '/api/recipes/remove-ingredient',
    'DELETE',
    ['manager-recipes']
  );

  const removeSmallIngredientMutation = useMutate(
    smallRecipeMenuId != null
      ? `/api/recipes/remove-ingredient?menuID=${smallRecipeMenuId}`
      : '/api/recipes/remove-ingredient',
    'DELETE',
    ['manager-recipes']
  );

  const removeLargeIngredientMutation = useMutate(
    largeRecipeMenuId != null
      ? `/api/recipes/remove-ingredient?menuID=${largeRecipeMenuId}`
      : '/api/recipes/remove-ingredient',
    'DELETE',
    ['manager-recipes']
  );

  const filteredMenuItems = useMemo(() => {
    const searchValue = recipeSearch.trim().toLowerCase();

    if (!searchValue) {
      return sortedMenuItems;
    }

    return sortedMenuItems.filter((item) => {
      const recipe = recipesByMenuId.get(String(item.menu_id));
      const ingredientNames = recipe?.ingredients?.map((ingredient) => ingredient.name).join(' ') || '';
      const haystack = [item.menu_id, item.name, item.category, ingredientNames].join(' ').toLowerCase();
      return haystack.includes(searchValue);
    });
  }, [recipeSearch, recipesByMenuId, sortedMenuItems]);

  const sortedIngredients = useMemo(
    () =>
      [...ingredients].sort((a, b) => {
        const aId = Number(a.ingredient_id);
        const bId = Number(b.ingredient_id);

        if (Number.isFinite(aId) && Number.isFinite(bId) && aId !== bId) {
          return aId - bId;
        }

        return String(a.name || '').localeCompare(String(b.name || ''));
      }),
    [ingredients]
  );

  useEffect(() => {
    if (!selectedMenuId && filteredMenuItems.length > 0) {
      setSelectedMenuId(String(filteredMenuItems[0].menu_id));
      return;
    }

    if (selectedMenuId && !sortedMenuItems.some((item) => String(item.menu_id) === String(selectedMenuId))) {
      setSelectedMenuId(sortedMenuItems.length > 0 ? String(sortedMenuItems[0].menu_id) : '');
    }
  }, [selectedMenuId, filteredMenuItems, sortedMenuItems]);

  useEffect(() => {
    setSelectedIngredientId('');
    setIngredientQuantity('');
  }, [selectedMenuId]);

  const isLoading = menuLoading || recipesLoading || ingredientsLoading;
  const isBusy =
    addBaseIngredientMutation.isPending ||
    addSmallIngredientMutation.isPending ||
    addLargeIngredientMutation.isPending ||
    removeBaseIngredientMutation.isPending ||
    removeSmallIngredientMutation.isPending ||
    removeLargeIngredientMutation.isPending;
  const combinedError = menuError || recipesError || ingredientsError;
  const selectedIngredients = selectedRecipe?.ingredients || [];
  const addIngredientError =
    addBaseIngredientMutation.error ||
    addSmallIngredientMutation.error ||
    addLargeIngredientMutation.error;
  const removeIngredientError =
    removeBaseIngredientMutation.error ||
    removeSmallIngredientMutation.error ||
    removeLargeIngredientMutation.error;

  const getScaledQuantity = (quantity, size) => Number((Number(quantity) * DRINK_SIZE_MULTIPLIERS[size]).toFixed(2));

  const getIngredientForSize = (ingredient, size) => {
    const family = getIngredientFamily(ingredient.name);

    if (!family) {
      return ingredient;
    }

    return findIngredientVariant(ingredients, family, size) || ingredient;
  };

  const getMatchingRecipeIngredient = (recipe, ingredient) => {
    if (!recipe) {
      return null;
    }

    const family = getIngredientFamily(ingredient.name);

    if (family) {
      return recipe.ingredients.find((recipeIngredient) => normalizeLookup(recipeIngredient.name).includes(family)) || null;
    }

    return recipe.ingredients.find(
      (recipeIngredient) => String(recipeIngredient.ingredient_id) === String(ingredient.ingredient_id)
    ) || null;
  };

  const syncRecipeIngredient = async ({ recipeMenuId, size, ingredient, mutationAdd, mutationRemove }) => {
    if (recipeMenuId == null || !ingredient) {
      return;
    }

    const targetIngredient = getIngredientForSize(ingredient, size);
    const recipe = recipesByMenuId.get(String(recipeMenuId));
    const existingIngredient = getMatchingRecipeIngredient(recipe, targetIngredient);

    if (existingIngredient?.ingredient_id != null) {
      await mutationRemove.mutateAsync({
        ingredientID: Number(existingIngredient.ingredient_id),
      });
    }

    await mutationAdd.mutateAsync({
      ingredientID: Number(targetIngredient.ingredient_id),
      quantity: getScaledQuantity(ingredientQuantity, size),
    });
  };

  const removeRecipeIngredient = async ({ recipeMenuId, ingredient, mutationRemove }) => {
    if (recipeMenuId == null || !ingredient) {
      return;
    }

    const recipe = recipesByMenuId.get(String(recipeMenuId));
    const existingIngredient = getMatchingRecipeIngredient(recipe, ingredient);

    if (existingIngredient?.ingredient_id == null) {
      return;
    }

    await mutationRemove.mutateAsync({
      ingredientID: Number(existingIngredient.ingredient_id),
    });
  };

  const handleSelectRecipe = (menuId) => {
    setSelectedMenuId(String(menuId));
  };

  const handleRecipeSearchChange = (event) => {
    setRecipeSearch(event.target.value);
  };

  const handleAddIngredient = async (event) => {
    event.preventDefault();

    if (selectedMenuItem?.menu_id == null || !selectedIngredientId || !ingredientQuantity) {
      return;
    }

    const selectedIngredient = ingredientsById.get(String(selectedIngredientId));

    if (!selectedIngredient) {
      return;
    }

    const selectedQuantity = Number(ingredientQuantity);

    if (!Number.isFinite(selectedQuantity)) {
      return;
    }

    const isBaseDrink = Boolean(selectedDrinkFamily);

    if (isBaseDrink) {
      await syncRecipeIngredient({
        recipeMenuId: selectedMenuItem.menu_id,
        size: 'base',
        ingredient: selectedIngredient,
        mutationAdd: addBaseIngredientMutation,
        mutationRemove: removeBaseIngredientMutation,
      });

      if (selectedDrinkFamily.smallItem?.menu_id != null) {
        await syncRecipeIngredient({
          recipeMenuId: selectedDrinkFamily.smallItem.menu_id,
          size: 'small',
          ingredient: selectedIngredient,
          mutationAdd: addSmallIngredientMutation,
          mutationRemove: removeSmallIngredientMutation,
        });
      }

      if (selectedDrinkFamily.largeItem?.menu_id != null) {
        await syncRecipeIngredient({
          recipeMenuId: selectedDrinkFamily.largeItem.menu_id,
          size: 'large',
          ingredient: selectedIngredient,
          mutationAdd: addLargeIngredientMutation,
          mutationRemove: removeLargeIngredientMutation,
        });
      }
    } else {
      await addBaseIngredientMutation.mutateAsync({
        ingredientID: Number(selectedIngredient.ingredient_id),
        quantity: selectedQuantity,
      });
    }

    setSelectedIngredientId('');
    setIngredientQuantity('');
    await refetchRecipes();
  };

  const handleRemoveIngredient = async (ingredientId) => {
    if (selectedMenuItem?.menu_id == null) {
      return;
    }

    const selectedIngredient = selectedIngredients.find(
      (ingredient) => String(ingredient.ingredient_id) === String(ingredientId)
    );

    if (!selectedIngredient) {
      return;
    }

    const isBaseDrink = Boolean(selectedDrinkFamily);

    if (isBaseDrink) {
      await removeRecipeIngredient({
        recipeMenuId: selectedMenuItem.menu_id,
        ingredient: selectedIngredient,
        mutationRemove: removeBaseIngredientMutation,
      });

      if (selectedDrinkFamily.smallItem?.menu_id != null) {
        await removeRecipeIngredient({
          recipeMenuId: selectedDrinkFamily.smallItem.menu_id,
          ingredient: selectedIngredient,
          mutationRemove: removeSmallIngredientMutation,
        });
      }

      if (selectedDrinkFamily.largeItem?.menu_id != null) {
        await removeRecipeIngredient({
          recipeMenuId: selectedDrinkFamily.largeItem.menu_id,
          ingredient: selectedIngredient,
          mutationRemove: removeLargeIngredientMutation,
        });
      }
    } else {
      await removeBaseIngredientMutation.mutateAsync({
        ingredientID: Number(ingredientId),
      });
    }

    await refetchRecipes();
  };

  const handleRefresh = async () => {
    await Promise.all([refetchMenu(), refetchRecipes(), refetchIngredients()]);
  };

  return (
    <Row className="mb-4">
      <Col md={4}>
        <Card className="h-100">
          <Card.Header className="d-flex justify-content-between align-items-center py-2">
            <h5 className="mb-0">Recipe Management</h5>
            <Button variant="outline-primary" size="sm" onClick={handleRefresh} disabled={isBusy || isLoading}>
              {isBusy && <Spinner animation="border" size="sm" className="me-1" />}
              Refresh
            </Button>
          </Card.Header>
          <Card.Body>
            {combinedError && (
              <Alert variant="danger" className="mb-3">
                {combinedError.message || 'Failed to load recipe data'}
              </Alert>
            )}

            <Form.Group controlId="recipeSearch" className="mb-3">
              <Form.Label>Search Recipe</Form.Label>
              <Form.Control
                type="text"
                value={recipeSearch}
                onChange={handleRecipeSearchChange}
                placeholder="Type a name, category, or ID..."
              />
            </Form.Group>

            <div className="mb-2 text-muted small">
              Showing {filteredMenuItems.length} of {sortedMenuItems.length} recipes
            </div>

            {isLoading ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
              </div>
            ) : (
              <Table striped hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Drink Name</th>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMenuItems.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-2">
                        No recipes match your search
                      </td>
                    </tr>
                  ) : (
                    filteredMenuItems.map((item) => {
                      const recipe = recipesByMenuId.get(String(item.menu_id));
                      const ingredientCount = recipe?.ingredients?.length || 0;
                      const isSelected = String(item.menu_id) === String(selectedMenuId);

                      return (
                        <tr
                          key={item.rowKey}
                          role="button"
                          onClick={() => handleSelectRecipe(item.menu_id)}
                          style={{ cursor: 'pointer' }}
                          className={isSelected ? 'table-active' : ''}
                        >
                          <td>{item.name}</td>
                          <td>{item.category}</td>
                          <td>
                            <Badge bg={ingredientCount > 0 ? 'success' : 'secondary'}>
                              {ingredientCount > 0 ? `${ingredientCount} ingredients` : 'No recipe yet'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Col>

      <Col md={8}>
        <Card className="h-100">
          <Card.Header className="d-flex justify-content-between align-items-center py-2">
            <h5 className="mb-0">Recipe Ingredients</h5>
            {selectedMenuItem && (
              <Badge bg="info" className="text-uppercase">
                {selectedMenuItem.category}
              </Badge>
            )}
          </Card.Header>
          <Card.Body>
            {!selectedMenuItem ? (
              <Alert variant="secondary" className="mb-0">
                Select a menu item to view or edit its recipe.
              </Alert>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h6 className="mb-1">{selectedMenuItem.name}</h6>
                    <div className="text-muted">Menu ID: {selectedMenuItem.menu_id}</div>
                  </div>
                  <Badge bg={selectedIngredients.length > 0 ? 'success' : 'secondary'}>
                    {selectedIngredients.length > 0 ? 'Recipe Active' : 'No ingredients yet'}
                  </Badge>
                </div>

                {selectedIngredients.length > 0 ? (
                  <Table striped hover className="mb-3">
                    <thead>
                      <tr>
                        <th>Ingredient</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedIngredients.map((ingredient) => (
                        <tr key={ingredient.ingredient_id}>
                          <td>{ingredient.name}</td>
                          <td>{ingredient.quantity}</td>
                          <td>{ingredient.unit}</td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleRemoveIngredient(ingredient.ingredient_id)}
                              disabled={isBusy}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="light" className="mb-3">
                    This recipe does not have any ingredients yet.
                  </Alert>
                )}

                {removeIngredientError && (
                  <Alert variant="danger" className="mb-3">
                    {removeIngredientError.message || 'Failed to remove ingredient from recipe'}
                  </Alert>
                )}
                {addIngredientError && (
                  <Alert variant="danger" className="mb-3">
                    {addIngredientError.message || 'Failed to add ingredient to recipe'}
                  </Alert>
                )}

                <Form onSubmit={handleAddIngredient}>
                  <Row className="g-2 align-items-end">
                    <Col md={5}>
                      <Form.Group controlId="ingredientSelect">
                        <Form.Label>Ingredient</Form.Label>
                        <Form.Select
                          value={selectedIngredientId}
                          onChange={(event) => setSelectedIngredientId(event.target.value)}
                          disabled={ingredientsLoading || isBusy}
                          required
                        >
                          <option value="">Select ingredient...</option>
                          {sortedIngredients.map((ingredient) => (
                            <option key={ingredient.rowKey} value={ingredient.ingredient_id}>
                              {ingredient.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group controlId="ingredientQuantity">
                        <Form.Label>Amount</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.1"
                          min="0"
                          value={ingredientQuantity}
                          onChange={(event) => setIngredientQuantity(event.target.value)}
                          disabled={isBusy}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Button
                        variant="success"
                        type="submit"
                        className="w-100"
                        disabled={isBusy || ingredientsLoading}
                      >
                        {addBaseIngredientMutation.isPending || addSmallIngredientMutation.isPending || addLargeIngredientMutation.isPending
                          ? 'Adding...'
                          : 'Add Ingredient'}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}