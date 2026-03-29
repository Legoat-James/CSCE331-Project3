import React, { useState, useEffect } from 'react';
import {Button } from 'react-bootstrap';
import ModificationsWindow from './ModificationsWindow';

export default function Menuitems({ onAddItem }) {
    const [menuItems, setMenuItems] = useState([]);
    const [modifications, setModifications] = useState([]);
    const [showModWindow, setShowModWindow] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://project3-backend.duckdns.org';
        fetch(`${apiUrl}/api/menu-items`)
            .then(response => response.json())
            .then(data => {
                setMenuItems(data.filter(item => item.category !== 'topping' && item.category !== 'modifications'));
                setModifications(data.filter(item => item.category === 'topping' || item.category === 'modifications'));
            })
            .catch(error => console.error('Error fetching menu items:', error));
    }, []);

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setShowModWindow(true);
    };

    const handleCloseModWindow = () => {
        setShowModWindow(false);
        setSelectedItem(null);
    };

    return (
        <div>
            <h1>Menu Items</h1>
            <ul>
                {menuItems.map(item => (
                    <Button onClick={() => handleItemClick(item)}  variant='secondary' key={item.menu_id}>
                        {item.name} - ${item.cost}
                    </Button>
                ))}
            </ul>

            <ModificationsWindow 
                show={showModWindow}
                onHide={handleCloseModWindow}
                item={selectedItem}
                modifications={modifications}
                onAddItem={onAddItem}
            />
        </div>
    );
}