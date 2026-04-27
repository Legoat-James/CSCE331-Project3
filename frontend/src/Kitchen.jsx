import { useGet } from './hooks/useApi.js';
import {useMutate} from './hooks/useApi.js';
import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
// Import any custom hooks or API utility functions here once they are created
// import { useApi } from './hooks/useApi.js';

export default function Kitchen() {
    // We use react-query (useGet) instead of manual useEffect fetching.
    const { data: pendingOrders = [], isPending, error: oError } = useGet(['fetch-orders'], '/api/orders/fetch', {
        // You might want to use refetchInterval to routinely get new orders!
        refetchInterval: 500, 
        retry: true,
    });
    // Use state to track current time so the UI re-renders every second
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Helper to determine the color class based on time elapsed
    const getOrderColorClass = (orderTimestamp) => {
        const orderTime = new Date(orderTimestamp).getTime();
        const diffInSeconds = (currentTime - orderTime) / 1000;
        
        if (diffInSeconds >= 60) {
            return 'bg-danger text-white'; // Red for >= 1 min
        } else if (diffInSeconds >= 30) {
            return 'bg-warning text-dark'; // Yellow for >= 30 secs
        } else {
            return 'bg-success text-white'; // Green for new orders
        }
    };

    // Define the mutation to fill the transaction
    const fillTransaction = useMutate(
        '/api/transactions/fill',
        'PUT',
        ['fetch-orders'] // Invalidate 'fetch-orders' to instantly update the Kitchen screen
    );
    // Placeholder for when a kitchen staff member marks an order as completed
    const handleMarkCompleted = (orderId) => {
        // Trigger the mutation and pass the orderId in the request body
        fillTransaction.mutate(
            { transactionId: orderId },
            {
                onSuccess: () => {
                    console.log(`Successfully marked order ${orderId} as ready!`);
                },
                onError: (error) => {
                    console.error(`Failed to mark order ${orderId} as ready:`, error);
                    alert(`Could not mark order ${orderId} as ready. Please try again.`);
                }
            }
        );
    };

    if (isPending) {
        return (
            <Container className="d-flex justify-content-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading pending orders...</span>
                </Spinner>
            </Container>
        );
    }

    if (oError) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">Failed to fetch orders: {oError.message}</Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="kitchen-container mt-4">
            <h2 className="mb-4 text-center">Kitchen View - Pending Orders</h2>
            
            <Row xs={1} md={2} lg={3} className="g-4">
                {pendingOrders.map((order) => (
                    <Col key={order.transaction_id || order.id}>
                        <Card className="h-100 shadow-sm">
                            <Card.Header className={`d-flex justify-content-between align-items-center ${getOrderColorClass(order.timestamp)}`}>
                                <strong>Order #{order.transaction_id || order.id}</strong>
                                <span>{new Date(order.timestamp).toLocaleTimeString()}</span>
                            </Card.Header>
                            <Card.Body>
                                <Card.Title>Customer: {order.customerName || 'Guest'}</Card.Title>
                                <hr />
                                <div className="order-items">
                                    {order.items && order.items.map((item, index) => (
                                        <div key={index} className="mb-3">
                                            <strong>{item.quantity || 1}x {item.name}</strong>
                                            
                                            {/* Render item modifications if any */}
                                            {item.modifications && item.modifications.length > 0 && (
                                                <ul className="text-danger small mb-1 list-unstyled ms-3">
                                                    {item.modifications
                                                        .filter(mod => {
                                                            const modName = (mod.ingredient_name || mod.name || '').toLowerCase();
                                                            const isSugarOrIce = modName === 'sugar' || modName === 'ice';
                                                            const qty = parseFloat(mod.quantity);
                                                            // Hide if it's sugar or ice and quantity is 1 (default amount)
                                                            if (isSugarOrIce && qty === 1) return false;
                                                            return true;
                                                        })
                                                        .map((mod, modIndex) => {
                                                            const modName = mod.ingredient_name || mod.name;
                                                            const nameLower = (modName || '').toLowerCase();
                                                            const isSugarOrIce = nameLower === 'sugar' || nameLower === 'ice';
                                                            const qty = parseFloat(mod.quantity);

                                                            // If sugar/ice quantity is 0, display "No sugar"/"No ice"
                                                            if (isSugarOrIce && qty === 0) {
                                                                return (
                                                                    <li key={modIndex}>
                                                                        - No {modName}
                                                                    </li>
                                                                );
                                                            }

                                                            return (
                                                                <li key={modIndex}>
                                                                    - {mod.action === 'remove' ? 'NO' : 'ADD'} {`${mod.quantity}x `}{modName}
                                                                </li>
                                                            );
                                                        })}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                            <Card.Footer className="bg-transparent border-top-0 d-grid">
                                <button 
                                    className="btn btn-success" 
                                    onClick={() => handleMarkCompleted(order.transaction_id || order.id)}
                                >
                                    Mark as Ready
                                </button>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}

                {pendingOrders.length === 0 && !isPending && (
                    <Col xs={12}>
                        <Alert variant="info" className="text-center">
                            No pending orders at this time.
                        </Alert>
                    </Col>
                )}
            </Row>
        </Container>
    );
}
