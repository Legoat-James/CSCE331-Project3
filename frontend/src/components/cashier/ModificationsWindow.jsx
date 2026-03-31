import React, { useState } from 'react';
import { Modal, Button, ListGroup, Form } from 'react-bootstrap';

export default function ModificationsWindow({ show, onHide, item, modifications, onAddItem, menuItems }) {
    const [selectedMods, setSelectedMods] = useState([]);
    const [iceLevel, setIceLevel] = useState('1x');
    const [sugarLevel, setSugarLevel] = useState('1x');
    const [itemSize, setItemSize] = useState('medium');
    const levelOptions = ['0.5x', '0.75x', '1x', '1.25x', '1.5x']
    const sizeOptions = ['small', 'medium', 'large'];

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
        //check for item size here,
        let finalItem = item;
        if(item.category === 'drink' && itemSize !== 'medium') {
            //small and large items contain the substring 'small' or 'large' in their name
            finalItem = menuItems.find(
                menuItem => menuItem.name.includes(item.name) && menuItem.name.includes(itemSize));

            if (finalItem) {
                console.log(`found size variant for item: `, finalItem);
            }
            else {
                console.error(`could not find size variant for item: ${item.name}`);
                
            }
        }
        console.log(`selected size:`, itemSize);
        console.log('selected item:', item);
        console.log(`modification array is:`, selectedMods);
        onAddItem(+finalItem.cost, finalItem.name, finalItem.menu_id, selectedMods);
        // Add ice and sugar levels as modifications
        // onAddItem(0, `Ice: ${iceLevel}`, 'ice-level', 'level');
        // onAddItem(0, `Sugar: ${sugarLevel}`, 'sugar-level', 'level');
        // Reset and close
        setSelectedMods([]);
        setIceLevel('1x');
        setSugarLevel('1x');
        onHide();

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
                    {/* only show size modification if the item is a drink */}
                    {item.category === 'drink' && ( 
                        <Form.Group className="mb-3">
                            <Form.Label as="h5">Size</Form.Label>
                            {sizeOptions.map(size => (
                                <Form.Check
                                    key={`size-${size}`}
                                    type="radio"
                                    id={`size-${size}`}
                                    label={size}
                                    name="itemSize"
                                    value={size}
                                    checked={itemSize === size}
                                    onChange={(e) => setItemSize(e.target.value)}
                                />
                            ))}
                        </Form.Group>
                    )}
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