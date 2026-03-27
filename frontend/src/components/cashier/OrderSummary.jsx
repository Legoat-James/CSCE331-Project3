import React, { useState, useEffect } from 'react';
import { Row, Col, Container, ButtonGroup, Button } from 'react-bootstrap';

export default function OrderSummary({ orderItems }) {
    //we want each item listed with the price to its right, and then a button to the right of the price
    //clicking the button should remove the item and any of its modifications from the order and order summary
    //modifications should be placed indented and beneath each item it applies to
    

    if (!orderItems || orderItems.length === 0) {
        return <Container>No items in order.</Container>;
    }

    return (
        <Container>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {orderItems.map((item, index) => (
                    <li key={index}>
                        {item.name} - ${item.cost}
                    </li>
                ))}
            </ul>
        </Container>
    );
}