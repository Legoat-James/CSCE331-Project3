import React, { useState } from 'react';
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

export default function InventoryTable() {
  const [showRemoveItemModal, setShowRemoveItemModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEnableItemModal, setShowEnableItemModal] = useState(false);
  const [itemIdToEnable, setItemIdToEnable] = useState('');
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [itemToRestock, setItemToRestock] = useState(null);
  const [restockAmount, setRestockAmount] = useState('');
  const [showUpdateItemModal, setShowUpdateItemModal] = useState(false);
  const [itemToUpdate, setItemToUpdate] = useState(null);
  const [updateItemId, setUpdateItemId] = useState('');
  const [updateItemName, setUpdateItemName] = useState('');
  const [updateItemStock, setUpdateItemStock] = useState('');
  const [updateItemUnit, setUpdateItemUnit] = useState('');
  const [updateItemCost, setUpdateItemCost] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemStock, setNewItemStock] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newItemCost, setNewItemCost] = useState('');

  const { data: inventory = [], isLoading, error, refetch } = useGet(
    ['Inventory'],
    '/api/ingredients/all'
  );

  const removeItemMutation = useMutate(
    itemToRemove?.ingredient_id != null
      ? `/api/ingredients/disable?ingredientID=${itemToRemove.ingredient_id}`
      : '/api/ingredients/disable',
    'DELETE',
    ['Inventory']
  );

  const createItemMutation = useMutate(
    '/api/ingredients/create',
    'POST',
    ['Inventory']
  );

  const enableItemMutation = useMutate(
    itemIdToEnable
      ? `/api/ingredients/enable?ingredientID=${itemIdToEnable}`
      : '/api/ingredients/enable',
    'PATCH',
    ['Inventory']
  );

  const restockItemMutation = useMutate(
    itemToRestock?.ingredient_id != null
      ? `/api/ingredients/restock?ingredientID=${itemToRestock.ingredient_id}`
      : '/api/ingredients/restock',
    'PATCH',
    ['Inventory']
  );

  const updateItemMutation = useMutate(
    itemToUpdate?.ingredient_id != null
      ? `/api/ingredients/update?ingredientID=${itemToUpdate.ingredient_id}`
      : '/api/ingredients/update',
    'PUT',
    ['Inventory']
  );

  const handleRemoveItem = (itemId) => {
    const item = inventory.find((inv) => inv.ingredient_id === itemId) || { id: itemId };
    setItemToRemove(item);
    setShowRemoveItemModal(true);
  };

  const confirmRemoveItem = () => {
    if (itemToRemove?.ingredient_id == null) {
      return;
    }

    removeItemMutation.mutate(
      undefined,
      {
        onSuccess: () => {
          setShowRemoveItemModal(false);
          setItemToRemove(null);
        },
      }
    );
  };

  const closeRemoveItemModal = () => {
    setShowRemoveItemModal(false);
    setItemToRemove(null);
  };

  const handleCreateItem = (event) => {
    event.preventDefault();

    createItemMutation.mutate(
      {
        name: newItemName,
        stock: newItemStock,
        unit: newItemUnit,
        cost: newItemCost,
      },
      {
        onSuccess: () => {
          setShowAddItemModal(false);
          setNewItemName('');
          setNewItemStock('');
          setNewItemUnit('');
          setNewItemCost('');
        },
      }
    );
  };

  const handleOpenEnableItemModal = () => {
    setItemIdToEnable('');
    setShowEnableItemModal(true);
  };

  const closeEnableItemModal = () => {
    setShowEnableItemModal(false);
    setItemIdToEnable('');
  };

  const handleEnableItem = (event) => {
    event.preventDefault();

    const normalizedItemId = String(itemIdToEnable).trim();

    if (!normalizedItemId) {
      return;
    }

    const selectedItem = inventory.find(
      (item) => String(item.ingredient_id) === normalizedItemId
    );

    if (selectedItem) {
      closeEnableItemModal();
      return;
    }

    enableItemMutation.mutate(undefined, {
      onSuccess: () => {
        closeEnableItemModal();
      },
    });
  };

  const handleOpenRestockModal = (itemId) => {
    const item = inventory.find((inv) => inv.ingredient_id === itemId);
    if (!item) {
      return;
    }
    setItemToRestock(item);
    setRestockAmount('');
    setShowRestockModal(true);
  };

  const closeRestockModal = () => {
    setShowRestockModal(false);
    setItemToRestock(null);
    setRestockAmount('');
  };

  const handleRestockItem = (event) => {
    event.preventDefault();

    if (itemToRestock?.ingredient_id == null || !restockAmount) {
      return;
    }

    restockItemMutation.mutate(
      {
        stock: restockAmount,
      },
      {
        onSuccess: () => {
          closeRestockModal();
        },
      }
    );
  };

  const handleOpenUpdateItemModal = (itemId) => {
    const selectedItem = inventory.find((item) => item.ingredient_id === itemId);
    if (!selectedItem) {
      return;
    }

    setItemToUpdate(selectedItem);
    setUpdateItemId(String(selectedItem.ingredient_id ?? ''));
    setUpdateItemName(selectedItem.name || '');
    setUpdateItemUnit(selectedItem.unit || '');
    setUpdateItemCost(String(selectedItem.cost ?? ''));
    setShowUpdateItemModal(true);
  };

  const closeUpdateItemModal = () => {
    setShowUpdateItemModal(false);
    setItemToUpdate(null);
    setUpdateItemId('');
    setUpdateItemName('');
    setUpdateItemUnit('');
    setUpdateItemCost('');
  };

  const handleUpdateItem = (event) => {
    event.preventDefault();

    if (itemToUpdate?.ingredient_id == null) {
      return;
    }

    updateItemMutation.mutate(
      {
        name: updateItemName,
        unit: updateItemUnit,
        cost: updateItemCost,
      },
      {
        onSuccess: () => {
          closeUpdateItemModal();
        },
      }
    );
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center py-2">
        <h6 className="mb-0">Inventory Management</h6>
        <div className="d-flex gap-2">
          <Button
            variant="outline-warning"
            size="sm"
            onClick={handleOpenEnableItemModal}
          >
            Re-enable Item
          </Button>
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => setShowAddItemModal(true)}
          >
            Add Ingredient
          </Button>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || removeItemMutation.isPending || createItemMutation.isPending || enableItemMutation.isPending || restockItemMutation.isPending || updateItemMutation.isPending}
          >
            {(removeItemMutation.isPending || createItemMutation.isPending || enableItemMutation.isPending || restockItemMutation.isPending || updateItemMutation.isPending) && <Spinner animation="border" size="sm" className="me-1" />}
            Refresh
          </Button>
        </div>
      </Card.Header>
      <Card.Body className="p-3">
        {error && <Alert variant="danger" className="mb-2">{error.message || 'Failed to load inventory'}</Alert>}
        {removeItemMutation.error && <Alert variant="danger" className="mb-2">{removeItemMutation.error.message || 'Failed to remove item'}</Alert>}
        {createItemMutation.error && <Alert variant="danger" className="mb-2">{createItemMutation.error.message || 'Failed to create item'}</Alert>}
        {enableItemMutation.error && <Alert variant="danger" className="mb-2">{enableItemMutation.error.message || 'Failed to re-enable item'}</Alert>}
        {restockItemMutation.error && <Alert variant="danger" className="mb-2">{restockItemMutation.error.message || 'Failed to restock item'}</Alert>}
        {updateItemMutation.error && <Alert variant="danger" className="mb-2">{updateItemMutation.error.message || 'Failed to update item'}</Alert>}
        
        {isLoading ? (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" />
          </div>
        ) : (
          <Table hover size="sm" className="mb-0">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Id</th>
                <th>Stock</th>
                <th>Unit</th>
                <th>Cost</th>
                <th>Remove</th>
                <th>Restock</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-2">
                    No inventory items found
                  </td>
                </tr>
              ) : inventory.map((item) => (
                <tr key={item.ingredient_id}>
                  <td>{item.name || 'N/A'}</td>
                  <td>{item.ingredient_id ?? 'N/A'}</td>
                  <td>{item.stock ?? 'N/A'}</td>
                  <td>{item.unit || 'N/A'}</td>
                  <td>${(+item.cost).toFixed(2)}</td>
                  <td>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveItem(item.ingredient_id)}
                      disabled={removeItemMutation.isPending}
                    >
                      Remove
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleOpenRestockModal(item.ingredient_id)}
                      disabled={restockItemMutation.isPending}
                    >
                      Restock
                    </Button>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      onClick={() => handleOpenUpdateItemModal(item.ingredient_id)}
                      disabled={updateItemMutation.isPending}
                    >
                      Update
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>

      <Modal show={showAddItemModal} onHide={() => setShowAddItemModal(false)} centered>
        <Form onSubmit={handleCreateItem}>
          <Modal.Header closeButton>
            <Modal.Title>Add Ingredient</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="newItemName">
              <Form.Label>Ingredient Name</Form.Label>
              <Form.Control
                type="text"
                value={newItemName}
                onChange={(event) => setNewItemName(event.target.value)}
                placeholder="e.g., Chicken Breast"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="newItemStock">
              <Form.Label>Initial Stock</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={newItemStock}
                onChange={(event) => setNewItemStock(event.target.value)}
                placeholder="e.g., 100"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="newItemUnit">
              <Form.Label>Unit</Form.Label>
              <Form.Control
                type="text"
                value={newItemUnit}
                onChange={(event) => setNewItemUnit(event.target.value)}
                placeholder="e.g., lbs, oz, pieces"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="newItemCost">
              <Form.Label>Cost per Unit ($)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={newItemCost}
                onChange={(event) => setNewItemCost(event.target.value)}
                placeholder="e.g., 5.99"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddItemModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={createItemMutation.isPending}
            >
              {createItemMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showRemoveItemModal} onHide={closeRemoveItemModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Remove Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            Are you sure you want to remove{' '}
            <strong>{itemToRemove?.name || 'this item'}</strong>?
          </p>
          <p className="mb-0 text-muted">
            Item ID: {itemToRemove?.ingredient_id ?? 'N/A'}
          </p>
          <p className="mb-0 text-muted">
            Stock: {itemToRemove?.stock ?? 'N/A'} {itemToRemove?.unit || ''}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeRemoveItemModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmRemoveItem}
            disabled={removeItemMutation.isPending}
          >
            {removeItemMutation.isPending ? 'Removing...' : 'Remove'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEnableItemModal} onHide={closeEnableItemModal} centered>
        <Form onSubmit={handleEnableItem}>
          <Modal.Header closeButton>
            <Modal.Title>Re-enable Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="enableItemId">
              <Form.Label>Item ID</Form.Label>
              <Form.Control
                type="number"
                value={itemIdToEnable}
                onChange={(event) => setItemIdToEnable(event.target.value)}
                placeholder="Enter item ID"
                required
              />
            </Form.Group>
            <p className="mb-0 text-muted">
              If the item is already active, this will do nothing.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeEnableItemModal}>
              Cancel
            </Button>
            <Button
              variant="success"
              type="submit"
              disabled={enableItemMutation.isPending}
            >
              {enableItemMutation.isPending ? 'Re-enabling...' : 'Re-enable'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showRestockModal} onHide={closeRestockModal} centered>
        <Form onSubmit={handleRestockItem}>
          <Modal.Header closeButton>
            <Modal.Title>Restock Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-3">
              <strong>Item:</strong> {itemToRestock?.name || 'N/A'}
            </p>
            <p className="mb-3 text-muted">
              Current Stock: {itemToRestock?.stock ?? 'N/A'} {itemToRestock?.unit || ''}
            </p>
            <Form.Group className="mb-3" controlId="restockAmount">
              <Form.Label>Restock Amount</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={restockAmount}
                onChange={(event) => setRestockAmount(event.target.value)}
                placeholder="Enter amount to add"
                required
              />
              <Form.Text className="text-muted">
                Enter the amount to add to the current stock.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeRestockModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={restockItemMutation.isPending}
            >
              {restockItemMutation.isPending ? 'Restocking...' : 'Restock'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showUpdateItemModal} onHide={closeUpdateItemModal} centered>
        <Form onSubmit={handleUpdateItem}>
          <Modal.Header closeButton>
            <Modal.Title>Update Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="updateItemId">
              <Form.Label>Item ID</Form.Label>
              <Form.Control
                type="text"
                value={updateItemId}
                disabled
                readOnly
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="updateItemName">
              <Form.Label>Ingredient Name</Form.Label>
              <Form.Control
                type="text"
                value={updateItemName}
                onChange={(event) => setUpdateItemName(event.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="updateItemUnit">
              <Form.Label>Unit</Form.Label>
              <Form.Control
                type="text"
                value={updateItemUnit}
                onChange={(event) => setUpdateItemUnit(event.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="updateItemCost">
              <Form.Label>Cost per Unit ($)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={updateItemCost}
                onChange={(event) => setUpdateItemCost(event.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeUpdateItemModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={updateItemMutation.isPending}
            >
              {updateItemMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
}
