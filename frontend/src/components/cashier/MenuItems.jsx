import React, { useState, useEffect } from 'react';
import {Button } from 'react-bootstrap';

export default function Menuitems({ onAddItem }) {
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/menu-items')
            .then(response => response.json())
            .then(data => setMenuItems(data)) //stores the response data into the menuItems state variable
            .catch(error => console.error('Error fetching menu items:', error));
    }, []); //runs only once on initial render

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