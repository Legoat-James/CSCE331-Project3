import React, { useMemo, useState } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { useGet, useMutate } from '../../hooks/useApi';

const MENU_CATEGORIES = ['food', 'drink', 'modifications', 'topping'];

const normalizeName = (value) => String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
const stripDrinkSizeSuffix = (value) => String(value || '').trim().replace(/\s+/g, ' ').replace(/\s+(small|large)$/i, '').trim();
const roundMoney = (amount) => Number(Number(amount).toFixed(2));
const isDrinkSizeVariant = (item) =>
  String(item?.category || '').toLowerCase() === 'drink' && /\s+(small|large)$/i.test(String(item?.name || '').trim());
const DISPLAY_CATEGORY_ORDER = {
  drink: 0,
  food: 1,
  topping: 2,
  toppings: 2,
  modifications: 3,
};

export default function MenuEditor() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showEnableModal, setShowEnableModal] = useState(false);

  const [menuItemToDisable, setMenuItemToDisable] = useState(null);
  const [menuItemToUpdate, setMenuItemToUpdate] = useState(null);
  const [menuIdToEnable, setMenuIdToEnable] = useState('');
  const [relatedUpdateItemIds, setRelatedUpdateItemIds] = useState({ smallId: null, largeId: null });
  const [relatedDisableItemIds, setRelatedDisableItemIds] = useState({ smallId: null, largeId: null });
  const [relatedEnableItemIds, setRelatedEnableItemIds] = useState({ baseId: null, smallId: null, largeId: null });

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('food');
  const [newItemCost, setNewItemCost] = useState('');

  const [updateItemName, setUpdateItemName] = useState('');
  const [updateItemCategory, setUpdateItemCategory] = useState('food');
  const [updateItemCost, setUpdateItemCost] = useState('');

  const {
    data: menuItemsRaw = [],
    isLoading,
    error,
    refetch,
  } = useGet(['menu-items-manager'], '/api/menu/manager-all', {
    retry: false,
  });

  const menuItems = useMemo(
    () =>
      menuItemsRaw.map((item, index) => ({
        ...item,
        menu_id: item.menu_id ?? item.id ?? null,
        rowKey: item.menu_id ?? item.id ?? `${item.name || 'item'}-${index}`,
      })),
    [menuItemsRaw]
  );

  const disabledItems = useMemo(
    () => menuItems.filter((item) => !item.is_active),
    [menuItems]
  );

  const visibleMenuItems = useMemo(
    () => menuItems.filter((item) => !isDrinkSizeVariant(item)),
    [menuItems]
  );

  const visibleActiveMenuItems = useMemo(
    () => visibleMenuItems.filter((item) => item.is_active),
    [visibleMenuItems]
  );

  const sortedVisibleActiveMenuItems = useMemo(
    () =>
      [...visibleActiveMenuItems].sort((a, b) => {
        const aCategory = String(a.category || '').toLowerCase();
        const bCategory = String(b.category || '').toLowerCase();
        const aRank = DISPLAY_CATEGORY_ORDER[aCategory] ?? Number.MAX_SAFE_INTEGER;
        const bRank = DISPLAY_CATEGORY_ORDER[bCategory] ?? Number.MAX_SAFE_INTEGER;

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
    [visibleActiveMenuItems]
  );

  const visibleDisabledItems = useMemo(
    () => disabledItems.filter((item) => !isDrinkSizeVariant(item)),
    [disabledItems]
  );

  const findDrinkFamily = (rawName) => {
    const baseName = stripDrinkSizeSuffix(rawName);
    const baseKey = normalizeName(baseName);
    const smallKey = normalizeName(`${baseName} small`);
    const largeKey = normalizeName(`${baseName} large`);

    const drinks = menuItems.filter((item) => String(item.category || '').toLowerCase() === 'drink');
    const baseItem = drinks.find((item) => normalizeName(item.name) === baseKey) || null;
    const smallItem = drinks.find((item) => normalizeName(item.name) === smallKey) || null;
    const largeItem = drinks.find((item) => normalizeName(item.name) === largeKey) || null;

    return { baseName, baseItem, smallItem, largeItem };
  };

  const createMenuItemMutation = useMutate(
    '/api/menu/create',
    'POST',
    ['menu-items-manager']
  );

  const updateMenuItemMutation = useMutate(
    menuItemToUpdate?.menu_id != null
      ? `/api/menu/update?menuID=${menuItemToUpdate.menu_id}`
      : '/api/menu/update',
    'PUT',
    ['menu-items-manager']
  );

  const updateSmallDrinkMutation = useMutate(
    relatedUpdateItemIds.smallId != null
      ? `/api/menu/update?menuID=${relatedUpdateItemIds.smallId}`
      : '/api/menu/update',
    'PUT',
    ['menu-items-manager']
  );

  const updateLargeDrinkMutation = useMutate(
    relatedUpdateItemIds.largeId != null
      ? `/api/menu/update?menuID=${relatedUpdateItemIds.largeId}`
      : '/api/menu/update',
    'PUT',
    ['menu-items-manager']
  );

  const disableMenuItemMutation = useMutate(
    menuItemToDisable?.menu_id != null
      ? `/api/menu/disable?menuID=${menuItemToDisable.menu_id}`
      : '/api/menu/disable',
    'DELETE',
    ['menu-items-manager']
  );

  const disableSmallDrinkMutation = useMutate(
    relatedDisableItemIds.smallId != null
      ? `/api/menu/disable?menuID=${relatedDisableItemIds.smallId}`
      : '/api/menu/disable',
    'DELETE',
    ['menu-items-manager']
  );

  const disableLargeDrinkMutation = useMutate(
    relatedDisableItemIds.largeId != null
      ? `/api/menu/disable?menuID=${relatedDisableItemIds.largeId}`
      : '/api/menu/disable',
    'DELETE',
    ['menu-items-manager']
  );

  const enableMenuItemMutation = useMutate(
    relatedEnableItemIds.baseId != null
      ? `/api/menu/enable?menuID=${relatedEnableItemIds.baseId}`
      : '/api/menu/enable',
    'PATCH',
    ['menu-items-manager']
  );

  const enableSmallDrinkMutation = useMutate(
    relatedEnableItemIds.smallId != null
      ? `/api/menu/enable?menuID=${relatedEnableItemIds.smallId}`
      : '/api/menu/enable',
    'PATCH',
    ['menu-items-manager']
  );

  const enableLargeDrinkMutation = useMutate(
    relatedEnableItemIds.largeId != null
      ? `/api/menu/enable?menuID=${relatedEnableItemIds.largeId}`
      : '/api/menu/enable',
    'PATCH',
    ['menu-items-manager']
  );

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewItemName('');
    setNewItemCategory('food');
    setNewItemCost('');
  };

  const handleCreateMenuItem = async (event) => {
    event.preventDefault();

    const trimmedName = newItemName.trim();
    const parsedCost = Number(newItemCost);
    if (!trimmedName || !Number.isFinite(parsedCost)) {
      return;
    }

    try {
      if (newItemCategory === 'drink') {
        const baseName = stripDrinkSizeSuffix(trimmedName);
        const baseCost = roundMoney(parsedCost);

        await createMenuItemMutation.mutateAsync({
          name: baseName,
          category: 'drink',
          cost: baseCost,
        });

        await createMenuItemMutation.mutateAsync({
          name: `${baseName} small`,
          category: 'drink',
          cost: roundMoney(baseCost * 0.7),
        });

        await createMenuItemMutation.mutateAsync({
          name: `${baseName} large`,
          category: 'drink',
          cost: roundMoney(baseCost * 1.5),
        });
      } else {
        await createMenuItemMutation.mutateAsync({
          name: trimmedName,
          category: newItemCategory,
          cost: roundMoney(parsedCost),
        });
      }

      closeAddModal();
    } catch {
      // Error state is surfaced by react-query mutation objects.
    }
  };

  const handleOpenUpdateModal = (menuId) => {
    const selectedItem = menuItems.find((item) => item.menu_id === menuId);
    if (!selectedItem) {
      return;
    }

    let updateTarget = selectedItem;
    let updateName = selectedItem.name || '';
    let updateCost = Number(selectedItem.cost ?? 0);
    let relatedSmallId = null;
    let relatedLargeId = null;

    if (String(selectedItem.category || '').toLowerCase() === 'drink') {
      const { baseName, baseItem, smallItem, largeItem } = findDrinkFamily(selectedItem.name);
      const selectedNameKey = normalizeName(selectedItem.name);
      const isSelectedSmall = selectedNameKey.endsWith(' small');
      const isSelectedLarge = selectedNameKey.endsWith(' large');

      updateTarget = baseItem || selectedItem;
      updateName = baseName;

      if (baseItem && Number.isFinite(Number(baseItem.cost))) {
        updateCost = Number(baseItem.cost);
      } else if (isSelectedSmall && Number.isFinite(Number(selectedItem.cost))) {
        updateCost = Number(selectedItem.cost) / 0.7;
      } else if (isSelectedLarge && Number.isFinite(Number(selectedItem.cost))) {
        updateCost = Number(selectedItem.cost) / 1.5;
      }

      relatedSmallId = smallItem?.menu_id != null && smallItem.menu_id !== updateTarget.menu_id
        ? smallItem.menu_id
        : null;
      relatedLargeId = largeItem?.menu_id != null && largeItem.menu_id !== updateTarget.menu_id
        ? largeItem.menu_id
        : null;
    }

    setMenuItemToUpdate(updateTarget);
    setRelatedUpdateItemIds({ smallId: relatedSmallId, largeId: relatedLargeId });
    setUpdateItemName(updateName);
    setUpdateItemCategory((selectedItem.category || 'food').toLowerCase());
    setUpdateItemCost(Number.isFinite(updateCost) ? String(roundMoney(updateCost)) : String(selectedItem.cost ?? ''));
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setMenuItemToUpdate(null);
    setRelatedUpdateItemIds({ smallId: null, largeId: null });
    setUpdateItemName('');
    setUpdateItemCategory('food');
    setUpdateItemCost('');
  };

  const handleUpdateMenuItem = async (event) => {
    event.preventDefault();

    if (menuItemToUpdate?.menu_id == null) {
      return;
    }

    const parsedCost = Number(updateItemCost);
    if (!Number.isFinite(parsedCost)) {
      return;
    }

    try {
      if (updateItemCategory === 'drink') {
        const baseName = stripDrinkSizeSuffix(updateItemName.trim());
        const baseCost = roundMoney(parsedCost);

        await updateMenuItemMutation.mutateAsync({
          name: baseName,
          category: 'drink',
          cost: baseCost,
        });

        if (relatedUpdateItemIds.smallId != null) {
          await updateSmallDrinkMutation.mutateAsync({
            name: `${baseName} small`,
            category: 'drink',
            cost: roundMoney(baseCost * 0.7),
          });
        }

        if (relatedUpdateItemIds.largeId != null) {
          await updateLargeDrinkMutation.mutateAsync({
            name: `${baseName} large`,
            category: 'drink',
            cost: roundMoney(baseCost * 1.5),
          });
        }
      } else {
        await updateMenuItemMutation.mutateAsync({
          name: updateItemName.trim(),
          category: updateItemCategory,
          cost: roundMoney(parsedCost),
        });
      }

      closeUpdateModal();
    } catch {
      // Error state is surfaced by react-query mutation objects.
    }
  };

  const handleOpenDisableModal = (menuId) => {
    const selectedItem = menuItems.find((item) => item.menu_id === menuId);
    if (!selectedItem) {
      return;
    }

    let disableTarget = selectedItem;
    let relatedSmallId = null;
    let relatedLargeId = null;

    if (String(selectedItem.category || '').toLowerCase() === 'drink') {
      const { baseItem, smallItem, largeItem } = findDrinkFamily(selectedItem.name);
      disableTarget = baseItem || selectedItem;
      relatedSmallId = smallItem?.menu_id != null && smallItem.menu_id !== disableTarget.menu_id
        ? smallItem.menu_id
        : null;
      relatedLargeId = largeItem?.menu_id != null && largeItem.menu_id !== disableTarget.menu_id
        ? largeItem.menu_id
        : null;
    }

    setMenuItemToDisable(disableTarget);
    setRelatedDisableItemIds({ smallId: relatedSmallId, largeId: relatedLargeId });
    setShowDisableModal(true);
  };

  const closeDisableModal = () => {
    setShowDisableModal(false);
    setMenuItemToDisable(null);
    setRelatedDisableItemIds({ smallId: null, largeId: null });
  };

  const handleDisableMenuItem = async () => {
    if (menuItemToDisable?.menu_id == null) {
      return;
    }

    try {
      await disableMenuItemMutation.mutateAsync();

      if (relatedDisableItemIds.smallId != null) {
        await disableSmallDrinkMutation.mutateAsync();
      }

      if (relatedDisableItemIds.largeId != null) {
        await disableLargeDrinkMutation.mutateAsync();
      }

      closeDisableModal();
    } catch {
      // Error state is surfaced by react-query mutation objects.
    }
  };

  const handleOpenEnableModal = () => {
    setMenuIdToEnable('');
    setShowEnableModal(true);
  };

  const closeEnableModal = () => {
    setShowEnableModal(false);
    setMenuIdToEnable('');
    setRelatedEnableItemIds({ baseId: null, smallId: null, largeId: null });
  };

  const handleEnableSelectionChange = (value) => {
    setMenuIdToEnable(value);

    const selectedItem = menuItems.find((item) => String(item.menu_id) === String(value));
    if (!selectedItem) {
      setRelatedEnableItemIds({ baseId: null, smallId: null, largeId: null });
      return;
    }

    if (String(selectedItem.category || '').toLowerCase() !== 'drink') {
      setRelatedEnableItemIds({
        baseId: selectedItem.menu_id,
        smallId: null,
        largeId: null,
      });
      return;
    }

    const { baseItem, smallItem, largeItem } = findDrinkFamily(selectedItem.name);
    const enableTarget = baseItem || selectedItem;

    setRelatedEnableItemIds({
      baseId: enableTarget?.menu_id ?? null,
      smallId: smallItem?.menu_id != null && smallItem.menu_id !== enableTarget?.menu_id
        ? smallItem.menu_id
        : null,
      largeId: largeItem?.menu_id != null && largeItem.menu_id !== enableTarget?.menu_id
        ? largeItem.menu_id
        : null,
    });
  };

  const handleEnableMenuItem = async (event) => {
    event.preventDefault();

    const normalizedId = String(menuIdToEnable).trim();
    if (!normalizedId) {
      return;
    }

    if (relatedEnableItemIds.baseId == null) {
      return;
    }

    try {
      await enableMenuItemMutation.mutateAsync();

      if (relatedEnableItemIds.smallId != null) {
        await enableSmallDrinkMutation.mutateAsync();
      }

      if (relatedEnableItemIds.largeId != null) {
        await enableLargeDrinkMutation.mutateAsync();
      }

      closeEnableModal();
    } catch {
      // Error state is surfaced by react-query mutation objects.
    }
  };

  const isAnyMutationPending =
    createMenuItemMutation.isPending ||
    updateMenuItemMutation.isPending ||
    updateSmallDrinkMutation.isPending ||
    updateLargeDrinkMutation.isPending ||
    disableMenuItemMutation.isPending ||
    disableSmallDrinkMutation.isPending ||
    disableLargeDrinkMutation.isPending ||
    enableMenuItemMutation.isPending ||
    enableSmallDrinkMutation.isPending ||
    enableLargeDrinkMutation.isPending;

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center py-2">
        <h6 className="mb-0">Menu Management</h6>
        <div className="d-flex gap-2">
          <Button variant="outline-warning" size="sm" onClick={handleOpenEnableModal}>
            Re-enable Item
          </Button>
          <Button variant="outline-success" size="sm" onClick={() => setShowAddModal(true)}>
            Add Menu Item
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isAnyMutationPending}
          >
            {isAnyMutationPending && (
              <Spinner animation="border" size="sm" className="me-1" />
            )}
            Refresh
          </Button>
        </div>
      </Card.Header>

      <Card.Body className="p-3">
        {error && (
          <Alert variant="danger" className="mb-2">
            {error.message || 'Failed to load menu items'}
          </Alert>
        )}
        {createMenuItemMutation.error && (
          <Alert variant="danger" className="mb-2">
            {createMenuItemMutation.error.message || 'Failed to create menu item'}
          </Alert>
        )}
        {updateMenuItemMutation.error && (
          <Alert variant="danger" className="mb-2">
            {updateMenuItemMutation.error.message || 'Failed to update menu item'}
          </Alert>
        )}
        {updateSmallDrinkMutation.error && (
          <Alert variant="danger" className="mb-2">
            {updateSmallDrinkMutation.error.message || 'Failed to update small drink variant'}
          </Alert>
        )}
        {updateLargeDrinkMutation.error && (
          <Alert variant="danger" className="mb-2">
            {updateLargeDrinkMutation.error.message || 'Failed to update large drink variant'}
          </Alert>
        )}
        {disableMenuItemMutation.error && (
          <Alert variant="danger" className="mb-2">
            {disableMenuItemMutation.error.message || 'Failed to disable menu item'}
          </Alert>
        )}
        {disableSmallDrinkMutation.error && (
          <Alert variant="danger" className="mb-2">
            {disableSmallDrinkMutation.error.message || 'Failed to disable small drink variant'}
          </Alert>
        )}
        {disableLargeDrinkMutation.error && (
          <Alert variant="danger" className="mb-2">
            {disableLargeDrinkMutation.error.message || 'Failed to disable large drink variant'}
          </Alert>
        )}
        {enableMenuItemMutation.error && (
          <Alert variant="danger" className="mb-2">
            {enableMenuItemMutation.error.message || 'Failed to re-enable menu item'}
          </Alert>
        )}
        {enableSmallDrinkMutation.error && (
          <Alert variant="danger" className="mb-2">
            {enableSmallDrinkMutation.error.message || 'Failed to re-enable small drink variant'}
          </Alert>
        )}
        {enableLargeDrinkMutation.error && (
          <Alert variant="danger" className="mb-2">
            {enableLargeDrinkMutation.error.message || 'Failed to re-enable large drink variant'}
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" />
          </div>
        ) : (
          <Table hover size="sm" className="mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Category</th>
                <th>Price</th>
                <th>Disable</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {sortedVisibleActiveMenuItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-2">
                    No menu items found
                  </td>
                </tr>
              ) : (
                sortedVisibleActiveMenuItems.map((item) => (
                  <tr key={item.rowKey}>
                    <td>{item.name || 'N/A'}</td>
                    <td>{item.menu_id ?? 'N/A'}</td>
                    <td>{item.category || 'N/A'}</td>
                    <td>{Number.isFinite(Number(item.cost)) ? `$${Number(item.cost).toFixed(2)}` : 'N/A'}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleOpenDisableModal(item.menu_id)}
                        disabled={!item.is_active || isAnyMutationPending}
                      >
                        Disable
                      </Button>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        onClick={() => handleOpenUpdateModal(item.menu_id)}
                        disabled={isAnyMutationPending}
                      >
                        Update
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Card.Body>

      <Modal show={showAddModal} onHide={closeAddModal} centered>
        <Form onSubmit={handleCreateMenuItem}>
          <Modal.Header closeButton>
            <Modal.Title>Add Menu Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="newMenuItemName">
              <Form.Label>Item Name</Form.Label>
              <Form.Control
                type="text"
                value={newItemName}
                onChange={(event) => setNewItemName(event.target.value)}
                placeholder="e.g., Thai Milk Tea"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="newMenuItemCategory">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={newItemCategory}
                onChange={(event) => setNewItemCategory(event.target.value)}
                required
              >
                {MENU_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="newMenuItemCost">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                value={newItemCost}
                onChange={(event) => setNewItemCost(event.target.value)}
                placeholder="e.g., 5.49"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeAddModal}>
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={createMenuItemMutation.isPending}>
              {createMenuItemMutation.isPending ? 'Adding...' : 'Add Item'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showUpdateModal} onHide={closeUpdateModal} centered>
        <Form onSubmit={handleUpdateMenuItem}>
          <Modal.Header closeButton>
            <Modal.Title>Update Menu Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="updateMenuItemName">
              <Form.Label>Item Name</Form.Label>
              <Form.Control
                type="text"
                value={updateItemName}
                onChange={(event) => setUpdateItemName(event.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="updateMenuItemCategory">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                value={updateItemCategory}
                readOnly
                className="text-capitalize text-muted"
                style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="updateMenuItemCost">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                value={updateItemCost}
                onChange={(event) => setUpdateItemCost(event.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeUpdateModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={
                updateMenuItemMutation.isPending ||
                updateSmallDrinkMutation.isPending ||
                updateLargeDrinkMutation.isPending
              }
            >
              {(updateMenuItemMutation.isPending ||
                updateSmallDrinkMutation.isPending ||
                updateLargeDrinkMutation.isPending)
                ? 'Saving...'
                : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showDisableModal} onHide={closeDisableModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Disable Menu Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {menuItemToDisable?.name
            ? `Disable "${menuItemToDisable.name}" and any matching size variants?`
            : 'Disable this menu item?'}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDisableModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDisableMenuItem}
            disabled={
              disableMenuItemMutation.isPending ||
              disableSmallDrinkMutation.isPending ||
              disableLargeDrinkMutation.isPending
            }
          >
            {(disableMenuItemMutation.isPending ||
              disableSmallDrinkMutation.isPending ||
              disableLargeDrinkMutation.isPending)
              ? 'Disabling...'
              : 'Disable'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEnableModal} onHide={closeEnableModal} centered>
        <Form onSubmit={handleEnableMenuItem}>
          <Modal.Header closeButton>
            <Modal.Title>Re-enable Menu Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="enableMenuItemId">
              <Form.Label>Select disabled item</Form.Label>
              <Form.Select
                value={menuIdToEnable}
                onChange={(event) => handleEnableSelectionChange(event.target.value)}
                required
              >
                <option value="">Choose an item...</option>
                {visibleDisabledItems.map((item) => (
                  <option key={item.rowKey} value={item.menu_id}>
                    {item.menu_id} - {item.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeEnableModal}>
              Cancel
            </Button>
            <Button
              variant="warning"
              type="submit"
              disabled={
                enableMenuItemMutation.isPending ||
                enableSmallDrinkMutation.isPending ||
                enableLargeDrinkMutation.isPending
              }
            >
              {(enableMenuItemMutation.isPending ||
                enableSmallDrinkMutation.isPending ||
                enableLargeDrinkMutation.isPending)
                ? 'Re-enabling...'
                : 'Re-enable'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
}
