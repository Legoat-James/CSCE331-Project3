import React, { useState, useEffect, useContext } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import './Cashier.css';
import Menuitems from './components/cashier/MenuItems';
import OrderSummary from './components/cashier/OrderSummary';
import { useIsAuthenticated, logoutUser } from './api/authAPI.js';
import apiClient from './api/client_config.js';

import ChatBot from './components/customer/Chatbot.jsx';
import { ThemeContext } from './contexts/ThemeContext';

export default function Cashier() {
    const { theme, setTheme } = useContext(ThemeContext);

    useEffect(() => {
        // This code runs once when the component mounts
        console.log("Page loaded!");
        setTheme('standard');
    }, []);

    const { user, isSuccess: authSuccess, isPending: authPending } = useIsAuthenticated();
    const isLoggedIn = authSuccess && !!user;

    const [isLoading, setLoading] = useState(false);
    const [orderItems, setOrderItems] = useState([]); // this will hold the items in the current order, we can use this to display the order summary and calculate the total
    
    // Compute total dynamically from orderItems to prevent delta-math desync bugs
    const total = Math.round(orderItems.reduce((acc, item) => {
        let unitCost = parseFloat(item.cost || 0);
        if (item.modifications_array) {
            item.modifications_array.forEach(mod => {
                unitCost += parseFloat(mod.cost || 0);
            });
        }
        return acc + (unitCost * (item.quantity || 1));
    }, 0) * 100) / 100;

    const [menuView, setMenuView] = useState(() => {
        const savedView = localStorage.getItem('menuView');
        return savedView ? savedView : '';
    })
    const [customerName, setCustomerName] = useState('');
    const [error, setError] = useState(null);
    const [editingItemIndex, setEditingItemIndex] = useState(null);

    // Helper function to check if two items are exactly identical
    const areItemsIdentical = (item1, item2) => {
        if (item1.menu_id !== item2.menu_id) return false;

        const mods1 = item1.modifications_array || [];
        const mods2 = item2.modifications_array || [];

        if (mods1.length !== mods2.length) return false;

        // Sort by menu_id to ensure order doesn't matter, though usually it's consistent
        const sorted1 = [...mods1].sort((a, b) => a.menu_id - b.menu_id);
        const sorted2 = [...mods2].sort((a, b) => a.menu_id - b.menu_id);

        for (let i = 0; i < sorted1.length; i++) {
            if (sorted1[i].menu_id !== sorted2[i].menu_id) return false;
            // If they have distinct names like "Ice 0.5x", name diff matters
            if (sorted1[i].name !== sorted2[i].name) return false;
        }

        return true;
    };

    const handleEditComplete = (updatedItem, quantity = 1) => {
        if (updatedItem && editingItemIndex !== null) {
            setOrderItems(prevItems => {
                const newItems = [...prevItems];
                // Construct the updated item
                const newItem = { ...updatedItem, quantity };

                // Check if another identical item already exists (other than the one we are editing)
                // If it does, we can merge into it, but it might mess up indices a little bit if we do it inline.
                // Simple approach: replace the old item. If it matches something else, just let it be a new line 
                // OR we can explicitly scan and merge.
                // Let's just replace in place to keep stability, EXCEPT when they change it to an identical existing item

                let foundMatch = -1;
                for (let i = 0; i < newItems.length; i++) {
                    if (i !== editingItemIndex && areItemsIdentical(newItems[i], newItem)) {
                        foundMatch = i;
                        break;
                    }
                }

                if (foundMatch !== -1) {
                    // Merge with the existing identical item
                    newItems[foundMatch].quantity = (newItems[foundMatch].quantity || 1) + quantity;
                    newItems.splice(editingItemIndex, 1); // remove the old one entirely
                } else {
                    // Just replace it inline
                    newItems[editingItemIndex] = newItem;
                }

                return newItems;
            });
        }
        setEditingItemIndex(null);
    };

    const triggerEditItem = (index) => {
        const item = orderItems[index];
        if (!item.modifications_array || item.modifications_array.length === 0) return;
        setEditingItemIndex(index);
    };

    const handleAddItem = (cost, name, menu_id, modifications_array, quantity = 1) => {
        setOrderItems(prevItems => {
            const newItemObject = { name, cost, menu_id, modifications_array, quantity };
            const newItems = [...prevItems];

            // Check if identical item exists
            let foundMatch = -1;
            for (let i = 0; i < newItems.length; i++) {
                if (areItemsIdentical(newItems[i], newItemObject)) {
                    foundMatch = i;
                    break;
                }
            }

            if (foundMatch !== -1) {
                // Merge quantity
                newItems[foundMatch] = {
                    ...newItems[foundMatch],
                    quantity: (newItems[foundMatch].quantity || 1) + quantity
                };
            } else {
                newItems.push(newItemObject);
            }

            return newItems;
        });
    };

    const handleRemoveItem = (itemIndex, modIndex = null) => {
        if (modIndex === null) {
            // Remove entire item and all its modifications
            setOrderItems(prevItems => prevItems.filter((_, index) => index !== itemIndex));
        } else {
            // Remove or reset specific modification
            setOrderItems(prevItems => {
                const newItems = [...prevItems];
                const updatedItem = { ...newItems[itemIndex], modifications_array: [...newItems[itemIndex].modifications_array] };
                const mod = updatedItem.modifications_array[modIndex];

                const isIceLevel = mod.menu_id === 65;
                const isSugarLevel = mod.menu_id === 64;

                if (isIceLevel || isSugarLevel) {
                    const modType = isIceLevel ? 'Ice' : 'Sugar';
                    updatedItem.modifications_array[modIndex] = {
                        ...mod,
                        name: `${modType} 1x`,
                        cost: 0
                    };
                } else {
                    updatedItem.modifications_array.splice(modIndex, 1);
                }

                newItems[itemIndex] = updatedItem;
                return newItems;
            });
        }
    };

    const sanitizeOrderItems = (orderItems) => {
        //for now we do not have an epmployee ID so we will assume the employee ID is 1, and customer name is "guest"
        // const employeeId = 1;
        const employeeId = user ? user.employee_id : null;

        const unrolledItems = [];
        orderItems.forEach(item => {
            const toppings = item.modifications_array ? Object.values(item.modifications_array.reduce((acc, mod) => {
                const isIceOrSugar = mod.name.toLowerCase().includes("ice") || mod.name.toLowerCase().includes("sugar");
                if (isIceOrSugar) {
                    acc[mod.menu_id] = {
                        id: mod.menu_id,
                        quantity: parseFloat(mod.name.replace(/x/g, '').split(' ').at(-1))
                    };
                } else {
                    if (acc[mod.menu_id]) {
                        acc[mod.menu_id].quantity += 1;
                    } else {
                        acc[mod.menu_id] = {
                            id: mod.menu_id,
                            quantity: 1
                        };
                    }
                }
                return acc;
            }, {})) : [];

            const itemQty = item.quantity || 1;
            // Unroll items to ensure the kitchen & inventory correctly maps modifiers to EACH distinct drink instance
            for (let i = 0; i < itemQty; i++) {
                unrolledItems.push({
                    menuId: item.menu_id,
                    quantity: 1,
                    toppings: toppings
                });
            }
        });

        return {
            employeeId: employeeId,
            customerName: customerName,
            items: unrolledItems
        }
        // "toppings": [
        // {
        //   "id": 61,
        //   "quantity": 1
        // }
        //   ]
    }

    const handleCheckout = async () => {
        console.log("checkout confirmed, order items:", orderItems);
        let sanatizedOrderItems = sanitizeOrderItems(orderItems);
        console.log("sanitized order items:", sanatizedOrderItems);
        try {
            if (!isLoading) {
                setLoading(true);
                const response = await apiClient('/api/orders/create', { method: 'POST', body: sanatizedOrderItems });
                //the following line produces an error to test api errors and page alerts. 
                // it should not be deleted or uncommented unless testing error handling
                // const response = await apiClient('/api/orders/create', sanatizedOrderItems); 
                console.log('order submission response:', response);
                //reset order on successful submission
                setOrderItems([]);
                setError(null);
                setLoading(false);
                setCustomerName('');
            }

        } catch (error) {
            console.error('error submitting order:', error);
            setError('Error failed to submit. Check console for details.');
        }
    }

    const handleCancel = () => {
        setOrderItems([]);
        setError(null);
    }

    const changeMenuView = (view) => {
        setMenuView(view);
        localStorage.setItem('menuView', view);
    }

    if (!isLoggedIn) {
        return (
            <div className="cashier-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Alert variant="danger">
                    <Alert.Heading>Access Denied</Alert.Heading>
                    <p>You must be logged in to access the Cashier view.</p>
                    <hr />
                    <div className="d-flex justify-content-end">
                        <Button onClick={() => window.location.href = '/'}>Back to Portal</Button>
                    </div>
                </Alert>
            </div>
        );
    }

    return (
        <div className="cashier-page">
            <div className="cashier-shell">
                {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                <div className="cashier-layout">
                    <div className="cashier-menu-panel">
                        <h2 className="cashier-panel-title">Customer name</h2>
                        <Form>
                            <Form.Group className="mb-3" controlId="customerName">
                                <Form.Control
                                    type="text"
                                    placeholder="type here..."
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="cashier-order-total"
                                />
                            </Form.Group>

                        </Form>
                        <h1 className="cashier-panel-title">Menu</h1>
                        <div className="cashier-category-group">
                            <Button
                                onClick={() => changeMenuView('')}
                                className={`cashier-category-btn ${menuView === '' ? 'active' : ''}`}
                            >
                                All Items
                            </Button>
                            <Button
                                onClick={() => changeMenuView('drink')}
                                className={`cashier-category-btn ${menuView === 'drink' ? 'active' : ''}`}
                            >
                                Drinks
                            </Button>
                            <Button
                                onClick={() => changeMenuView('food')}
                                className={`cashier-category-btn ${menuView === 'food' ? 'active' : ''}`}
                            >
                                Food
                            </Button>
                        </div>
                        <Menuitems
                            onAddItem={handleAddItem}
                            menuView={menuView}
                            editingItem={editingItemIndex !== null ? orderItems[editingItemIndex] : null}
                            onEditComplete={(updatedItem, quantity = 1) => {
                                if (updatedItem) {
                                    handleEditComplete(updatedItem, quantity);
                                } else {
                                    setEditingItemIndex(null);
                                }
                            }}
                        />
                    </div>
                    <div className="cashier-order-panel">
                        <h2 className="cashier-panel-title">Order Summary</h2>
                        <OrderSummary
                            orderItems={orderItems}
                            onRemoveItem={handleRemoveItem}
                            onEditItem={triggerEditItem}
                        />
                        <div className="cashier-order-total">Total: ${total.toFixed(2)}</div>
                        <div className="cashier-action-group">
                            <Button onClick={handleCheckout} className="cashier-btn-confirm">
                                Confirm Checkout
                            </Button>
                            <Button onClick={handleCancel} className="cashier-btn-cancel">
                                Cancel Order
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}