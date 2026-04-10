import apiClient from '../../api/client_config.js';
import React, { useState, useEffect } from 'react';
import ModificationsWindow from './ModificationsWindow';
import './MenuItems.css';

export default function Menuitems({ onAddItem, menuView }) {
    const [menuItems, setMenuItems] = useState([]);
    const [modifications, setModifications] = useState([]);
    const [showModWindow, setShowModWindow] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
    const fetchMenuItems = async () => {
        try {
            const data = await apiClient('/api/menu/all');
            // console.log('Menu items data:', data); // Debug log
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
        if (item.category === 'drink'){
            setShowModWindow(true);
        }
        //food items have no modifications so we directly add them to the order
        else { setShowModWindow(false); onAddItem(+item.cost, item.name, item.menu_id, []); }
    };

    const handleCloseModWindow = () => {
        setShowModWindow(false);
        setSelectedItem(null);
    };

    return (
        <div className="menu-container">
            <div className="menu-grid">
                {menuItems
                .filter(item => (!item.name.includes('large') && !item.name.includes('small') && item.category.includes(menuView)))
                .map(item => (
                    <button 
                        onClick={() => handleItemClick(item)} 
                        className="menu-item-btn"
                        key={item.menu_id}
                    >
                        <div className="menu-item-name">{item.name}</div>
                        <div className="menu-item-price">${parseFloat(item.cost).toFixed(2)}</div>
                    </button>
                ))}
            </div>

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