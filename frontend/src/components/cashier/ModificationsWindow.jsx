import React, { useState } from 'react';
import { Modal, Button, ListGroup, Form } from 'react-bootstrap';

export default function ModificationsWindow({ show, onHide, item, modifications, onAddItem }) {
    const [selectedMods, setSelectedMods] = useState([]);
    const [iceLevel, setIceLevel] = useState('1x');
    const [sugarLevel, setSugarLevel] = useState('1x');
    const levelOptions = ['0.5x', '0.75x', '1x', '1.25x', '1.5x'];

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
        // let item_total_cost = parseFloat(item.cost);
        // selectedMods.forEach(mod => {
        //     item_total_cost += parseFloat(mod.cost);
        // });
        selectedMods.push({menu_id: 65, name: `Ice ${iceLevel}`, category: 'modifications' ,cost: 0});
        selectedMods.push({menu_id: 64, name: `Sugar ${sugarLevel}`, category: 'modifications' ,cost: 0});
        onAddItem(+item.cost, item.name, item.menu_id, selectedMods);
        // Add ice and sugar levels as modifications
        // onAddItem(0, `Ice: ${iceLevel}`, 'ice-level', 'level');
        // onAddItem(0, `Sugar: ${sugarLevel}`, 'sugar-level', 'level');
        // Reset and close
        setSelectedMods([]);
        setIceLevel('1x');
        setSugarLevel('1x');
        onHide();
        console.log(selectedMods);
    };

    const handleClose = () => {
        setSelectedMods([]);
        setIceLevel('1x');
        setSugarLevel('1x');
        onHide();
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add Modifications for {item.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label as="h5">Ice Level</Form.Label>
                        {levelOptions.map(level => (
                            <Form.Check
                                key={`ice-${level}`}
                                type="radio"
                                id={`ice-${level}`}
                                label={level}
                                name="iceLevel"
                                value={level}
                                checked={iceLevel === level}
                                onChange={(e) => setIceLevel(e.target.value)}
                            />
                        ))}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label as="h5">Sugar Level</Form.Label>
                        {levelOptions.map(level => (
                            <Form.Check
                                key={`sugar-${level}`}
                                type="radio"
                                id={`sugar-${level}`}
                                label={level}
                                name="sugarLevel"
                                value={level}
                                checked={sugarLevel === level}
                                onChange={(e) => setSugarLevel(e.target.value)}
                            />
                        ))}
                    </Form.Group>
                </Form>

                <hr />

                <h5>Select toppings and modifications:</h5>
                <ListGroup>
                    {modifications
                    .filter(mod => mod.category === 'topping')
                    .map(mod => (
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