import apiClient from '../../api/client_config.js';
import React, { useState, useEffect } from 'react';
import {Button } from 'react-bootstrap';

export default function Menuitems({ onAddItem }) {
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
    const fetchMenuItems = async () => {
        try {
            const data = await apiClient('/api/menu-items');
            console.log('Menu items data:', data); // Debug log
            if (Array.isArray(data)) {
                setMenuItems(data);
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

    return (
        <div>
            <h1>Menu Items</h1>
            <ul>
                {menuItems.map(item => (
                    <Button onClick={() => onAddItem(+item.cost)}  variant='secondary' key={item.menu_id}>
                        {item.name} - ${item.cost}
                    </Button>
                ))}
            </ul>
        </div>
    );
}