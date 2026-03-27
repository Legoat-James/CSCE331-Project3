import React, { useState } from 'react';
import { Modal, Button, ListGroup } from 'react-bootstrap';

export default function ModificationsWindow({ show, onHide, item, modifications, onAddItem }) {
    const [selectedMods, setSelectedMods] = useState([]);

    if (!item) {
        return null;
    }

    const handleModSelection = (mod) => {
        setSelectedMods(prevMods => {
            if (prevMods.find(m => m.menu_id === mod.menu_id)) {
                return prevMods.filter(m => m.menu_id !== mod.menu_id);
            } else {
                return [...prevMods, mod];
            }
        });
    };

    const handleConfirm = () => {
        // Add the main item
        onAddItem(+item.cost, item.name, item.menu_id);
        // Add all selected modifications
        selectedMods.forEach(mod => {
            onAddItem(+mod.cost, mod.name, mod.menu_id);
        });
        // Reset and close
        setSelectedMods([]);
        onHide();
    };

    const handleClose = () => {
        setSelectedMods([]);
        onHide();
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add Modifications for {item.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5>Select toppings and modifications:</h5>
                <ListGroup>
                    {modifications.map(mod => (
                        <ListGroup.Item 
                            key={mod.menu_id} 
                            action 
                            onClick={() => handleModSelection(mod)}
                            active={!!selectedMods.find(m => m.menu_id === mod.menu_id)}
                        >
                            {mod.name} - ${mod.cost}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                    Add to Order
                </Button>
            </Modal.Footer>
        </Modal>
    );
}