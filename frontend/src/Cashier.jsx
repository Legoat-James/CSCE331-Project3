import React, { useState, useEffect } from 'react';
import { Row, Col, Container, ButtonGroup, Button } from 'react-bootstrap';
import './Cashier.css';
import Menuitems from './components/cashier/MenuItems';
import OrderSummary from './components/cashier/OrderSummary';

export default function Cashier() {
    const [total, setTotal] = useState(0.00);
    const [orderItems, setOrderItems] = useState([]); // this will hold the items in the current order, we can use this to display the order summary and calculate the total

    useEffect(() => {
        // this is just a placeholder until we implement the backend, 
        
    }, []); //becuase i used empty brace [] it will render only once, on the initial render

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

    const sanitizeOrderItems = (orderItems) => {
        //for now we do not have an epmployee ID so we will assume the employee ID is 1, and customer name is "guest"
        // const employeeId = 1;
        const user = JSON.parse(localStorage.getItem('user'));
        const employeeId = user ? user.employee_id : null;
        const customerName = "guest";

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

    return (
        <Container>
            <Row className='g-10'>
                <Col md={7} id="cashier-left-container" className="d-flex flex-column align-items-center red-border m-1">
                    <h1>Cashier</h1>
                    <h2>menu</h2>
                    <Container>
                        <ButtonGroup>
                            <Button variant='secondary'> Default </Button>
                            <Button variant='secondary'> Drinks </Button>
                            <Button variant='secondary'> Food </Button>
                        </ButtonGroup>
                        {/* this will fetch all of our menu items and display them */}
                        <Menuitems onAddItem={handleAddItem} /> 
                    </Container>
                </Col>
                <Col md={4} id="cashier-right-container" className="d-flex flex-column align-items-center red-border m-1">
                    <Container>
                        <h2>Order Summary</h2>
                        {/* this is where we add code to load the order summary */} 
                        {/* we likely will want the order summary as a component. i.e.: <Ordersummary /> */}
                        <OrderSummary orderItems={orderItems} />
                        <h3>Total: ${total}</h3>
                        <ButtonGroup>
                            <Button onClick={handleCheckout} variant='secondary'> Confirm Checkout </Button>
                            <Button onClick={handleCancel} variant='secondary'> Cancel Order </Button>
                        </ButtonGroup>
                    </Container>
                </Col>
            </Row>
        </Container>
    );
}