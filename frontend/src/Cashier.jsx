import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import './Cashier.css';
import Menuitems from './components/cashier/MenuItems';
import OrderSummary from './components/cashier/OrderSummary';

export default function Cashier() {
    const [total, setTotal] = useState(0.00);
    const [orderItems, setOrderItems] = useState([]); // this will hold the items in the current order, we can use this to display the order summary and calculate the total
    const [menuView, setMenuView] = useState(() =>{
        const savedView = localStorage.getItem('menuView');
        return savedView ? savedView : '';
    })
    const [customerName, setCustomerName] = useState('');


    const handleAddItem = (cost, name, menu_id, modifications_array) => {
        setTotal(prevTotal => {
            const newTotal = prevTotal + parseFloat(cost);
            return Math.round(newTotal * 100) / 100; //this prevents floating point issues
        });
        setTotal(prevTotal => {
            let newTotal = prevTotal;
            if (modifications_array && modifications_array.length > 0) {
                modifications_array.forEach(mod => {
                    newTotal += parseFloat(mod.cost);
                });
            }
            return Math.round(newTotal * 100) / 100;
        });

        setOrderItems(prevItems => [...prevItems, { name, cost, menu_id, modifications_array }]);
    };

    const handleRemoveItem = (itemIndex, modIndex = null) => {
        if (modIndex === null) {
            // Remove entire item and all its modifications
            const item = orderItems[itemIndex];
            let totalToRemove = parseFloat(item.cost);
            
            // Add up modification costs
            if (item.modifications_array && item.modifications_array.length > 0) {
                item.modifications_array.forEach(mod => {
                    totalToRemove += parseFloat(mod.cost);
                });
            }
            
            // Update total
            setTotal(prevTotal => Math.round((prevTotal - totalToRemove) * 100) / 100);
            
            // Remove item from order
            setOrderItems(prevItems => prevItems.filter((_, index) => index !== itemIndex));
        } else {
            // Remove or reset specific modification
            setOrderItems(prevItems => {
                const newItems = [...prevItems];
                const item = newItems[itemIndex];
                const mod = item.modifications_array[modIndex];
                
                // Check if it's ice or sugar level modification
                const isIceLevel = mod.menu_id === 65; // Ice modification
                const isSugarLevel = mod.menu_id === 64; // Sugar modification
                
                if (isIceLevel || isSugarLevel) {
                    // Reset to 1x instead of removing
                    const modType = isIceLevel ? 'Ice' : 'Sugar';
                    item.modifications_array[modIndex] = {
                        menu_id: mod.menu_id,
                        name: `${modType} 1x`,
                        category: 'modifications',
                        cost: 0
                    };
                } else {
                    // Remove the modification and update total
                    const costToRemove = parseFloat(mod.cost);
                    setTotal(prevTotal => Math.round((prevTotal - costToRemove) * 100) / 100);
                    item.modifications_array.splice(modIndex, 1);
                }
                
                return newItems;
            });
        }
    };

    const sanitizeOrderItems = (orderItems) => {
        //for now we do not have an epmployee ID so we will assume the employee ID is 1, and customer name is "guest"
        // const employeeId = 1;
        const user = JSON.parse(localStorage.getItem('user'));
        const employeeId = user ? user.employee_id : null;

        return {
            employeeId: employeeId,
            customerName: customerName,
            items: orderItems.map(item => {
                return {
                    menuID: item.menu_id,
                    quantity: 1,
                    toppings: item.modifications_array ? item.modifications_array.map(mod => {
                        let quantity = 1;
                        if (mod.menu_id === 65 || mod.menu_id === 64) { // Ice or Sugar
                            const parts = mod.name.split(' ');
                            if (parts.length === 2 && parts[1].endsWith('x')) {
                                quantity = parseFloat(parts[1].slice(0, -1));
                            }
                        }
                        return { id: mod.menu_id, quantity: quantity };
                    }) : []
                }
            })
        }
        // "toppings": [
        // {
        //   "id": 61,
        //   "quantity": 1
        // }
    //   ]
    }

    const handleCheckout = () => {
        //for testing purposes this does not reset the order yet
        console.log("checkout confirmed, order items:", orderItems);
        let sanatizedOrderItems = sanitizeOrderItems(orderItems);
        console.log("sanitized order items:", sanatizedOrderItems);
    }

    const handleCancel = () => {
        setOrderItems([]);
        setTotal(0.00);
    }

    const changeMenuView = (view) => {
        setMenuView(view);
        localStorage.setItem('menuView', view);
    }

    return (
        <div className="cashier-page">
            <div className="cashier-shell">
                <div className="cashier-layout">
                    <div  className="cashier-menu-panel">
                        <h2 className="cashier-panel-title">Customer name</h2>
                        <Form>
                            <Form.Group className="mb-3" controlId="customerName">
                                <Form.Control
                                type="text"
                                placeholder="type here..."
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
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
                        <Menuitems onAddItem={handleAddItem} menuView={menuView}/> 
                    </div>
                    <div className="cashier-order-panel">
                        <h2 className="cashier-panel-title">Order Summary</h2>
                        <OrderSummary orderItems={orderItems} onRemoveItem={handleRemoveItem} />
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