import apiClient from '../../api/client_config.js';
import React, { useState, useEffect } from 'react';
import {Button } from 'react-bootstrap';

export default function Menuitems({ onAddItem }) {
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
    const fetchMenuItems = async () => {
        try {
            const data = await apiClient('/api/menu-items');
            setMenuItems(data);
        } catch (error) {
            console.error('Error fetching menu items:', error);
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