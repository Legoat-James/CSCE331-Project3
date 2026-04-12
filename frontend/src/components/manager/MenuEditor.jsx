import React, { useMemo, useState } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Spinner,
  Alert,
  Badge,
} from 'react-bootstrap';
import { useGet, useMutate } from '../../hooks/useApi';

const MENU_CATEGORIES = ['food', 'drink', 'modifications', 'topping'];

export default function MenuEditor() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showEnableModal, setShowEnableModal] = useState(false);

  const [menuItemToDisable, setMenuItemToDisable] = useState(null);
  const [menuItemToUpdate, setMenuItemToUpdate] = useState(null);
  const [menuIdToEnable, setMenuIdToEnable] = useState('');

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

  const disableMenuItemMutation = useMutate(
    menuItemToDisable?.menu_id != null
      ? `/api/menu/disable?menuID=${menuItemToDisable.menu_id}`
      : '/api/menu/disable',
    'DELETE',
    ['menu-items-manager']
  );

  const enableMenuItemMutation = useMutate(
    menuIdToEnable
      ? `/api/menu/enable?menuID=${menuIdToEnable}`
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

  const handleCreateMenuItem = (event) => {
    event.preventDefault();

    createMenuItemMutation.mutate(
      {
        name: newItemName.trim(),
        category: newItemCategory,
        cost: newItemCost,
      },
      {
        onSuccess: () => {
          closeAddModal();
        },
      }
    );
  };

  const handleOpenUpdateModal = (menuId) => {
    const selectedItem = menuItems.find((item) => item.menu_id === menuId);
    if (!selectedItem) {
      return;
    }

    setMenuItemToUpdate(selectedItem);
    setUpdateItemName(selectedItem.name || '');
    setUpdateItemCategory((selectedItem.category || 'food').toLowerCase());
    setUpdateItemCost(String(selectedItem.cost ?? ''));
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setMenuItemToUpdate(null);
    setUpdateItemName('');
    setUpdateItemCategory('food');
    setUpdateItemCost('');
  };

  const handleUpdateMenuItem = (event) => {
    event.preventDefault();

    if (menuItemToUpdate?.menu_id == null) {
      return;
    }

    updateMenuItemMutation.mutate(
      {
        name: updateItemName.trim(),
        category: updateItemCategory,
        cost: updateItemCost,
      },
      {
        onSuccess: () => {
          closeUpdateModal();
        },
      }
    );
  };

  const handleOpenDisableModal = (menuId) => {
    const selectedItem = menuItems.find((item) => item.menu_id === menuId);
    if (!selectedItem) {
      return;
    }

    setMenuItemToDisable(selectedItem);
    setShowDisableModal(true);
  };

  const closeDisableModal = () => {
    setShowDisableModal(false);
    setMenuItemToDisable(null);
  };

  const handleDisableMenuItem = () => {
    if (menuItemToDisable?.menu_id == null) {
      return;
    }

    disableMenuItemMutation.mutate(undefined, {
      onSuccess: () => {
        closeDisableModal();
      },
    });
  };

  const handleOpenEnableModal = () => {
    setMenuIdToEnable('');
    setShowEnableModal(true);
  };

  const closeEnableModal = () => {
    setShowEnableModal(false);
    setMenuIdToEnable('');
  };

  const handleEnableMenuItem = (event) => {
    event.preventDefault();

    const normalizedId = String(menuIdToEnable).trim();
    if (!normalizedId) {
      return;
    }

    enableMenuItemMutation.mutate(undefined, {
      onSuccess: () => {
        closeEnableModal();
      },
    });
  };

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
            disabled={
              isLoading ||
              createMenuItemMutation.isPending ||
              updateMenuItemMutation.isPending ||
              disableMenuItemMutation.isPending ||
              enableMenuItemMutation.isPending
            }
          >
            {(createMenuItemMutation.isPending ||
              updateMenuItemMutation.isPending ||
              disableMenuItemMutation.isPending ||
              enableMenuItemMutation.isPending) && (
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
        {disableMenuItemMutation.error && (
          <Alert variant="danger" className="mb-2">
            {disableMenuItemMutation.error.message || 'Failed to disable menu item'}
          </Alert>
        )}
        {enableMenuItemMutation.error && (
          <Alert variant="danger" className="mb-2">
            {enableMenuItemMutation.error.message || 'Failed to re-enable menu item'}
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
              {menuItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-2">
                    No menu items found
                  </td>
                </tr>
              ) : (
                menuItems.map((item) => (
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
                        disabled={!item.is_active || disableMenuItemMutation.isPending}
                      >
                        Disable
                      </Button>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        onClick={() => handleOpenUpdateModal(item.menu_id)}
                        disabled={updateMenuItemMutation.isPending}
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
              <Form.Select
                value={updateItemCategory}
                onChange={(event) => setUpdateItemCategory(event.target.value)}
                required
              >
                {MENU_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
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
            <Button variant="primary" type="submit" disabled={updateMenuItemMutation.isPending}>
              {updateMenuItemMutation.isPending ? 'Saving...' : 'Save Changes'}
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
            ? `Disable "${menuItemToDisable.name}" (ID: ${menuItemToDisable.menu_id})?`
            : 'Disable this menu item?'}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDisableModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDisableMenuItem}
            disabled={disableMenuItemMutation.isPending}
          >
            {disableMenuItemMutation.isPending ? 'Disabling...' : 'Disable'}
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
                onChange={(event) => setMenuIdToEnable(event.target.value)}
                required
              >
                <option value="">Choose an item...</option>
                {disabledItems.map((item) => (
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
            <Button variant="warning" type="submit" disabled={enableMenuItemMutation.isPending}>
              {enableMenuItemMutation.isPending ? 'Re-enabling...' : 'Re-enable'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
}
