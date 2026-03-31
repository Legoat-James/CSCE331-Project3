import apiClient from '../../api/client_config.js';
import React, { useState, useEffect } from 'react';
import {Button } from 'react-bootstrap';
import ModificationsWindow from './ModificationsWindow';

export default function Menuitems({ onAddItem }) {
    const [menuItems, setMenuItems] = useState([]);
    const [modifications, setModifications] = useState([]);
    const [showModWindow, setShowModWindow] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
    const fetchMenuItems = async () => {
        try {
            const data = await apiClient('/api/menu/all');
            console.log('Menu items data:', data); // Debug log
            if (Array.isArray(data)) {
                setMenuItems(data.filter(item => (item.category === 'food' || item.category === 'drink')));
                setModifications(data.filter(item => (item.category === 'modifications' || item.category === 'topping')));
            } else {
                console.error('Expected array but got:', typeof data, data);
                setMenuItems([]); // Fallback to empty array
            }
        } catch (error) {
            console.error('Error fetching menu items:', error);
            setMenuItems([]); // Ensure it's always an array
        }
    };
    
    fetchMenuItems();
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
                {menuItems
                .filter(item => (!item.name.includes('large') && !item.name.includes('small')))
                .map(item => (
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
                menuItems={menuItems}
                onAddItem={onAddItem}
            />
        </div>
    );
}