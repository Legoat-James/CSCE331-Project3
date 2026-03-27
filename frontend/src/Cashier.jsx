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

    const handleAddItem = (cost, name, menu_id) => {
        setTotal(prevTotal => {
            const newTotal = prevTotal + parseFloat(cost);
            return Math.round(newTotal * 100) / 100; //this prevents floating point issues
        });

        setOrderItems(prevItems => [...prevItems, { name, cost, menu_id }]);
    };

    const handleCheckout = () => {
        //for testing purposes this does not reset the order yet
        console.log("checkout confirmed, order items:", orderItems);
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
                            <Button variant='secondary'> Cancel Order </Button>
                        </ButtonGroup>
                    </Container>
                </Col>
            </Row>
        </Container>
    );
}