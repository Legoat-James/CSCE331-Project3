import React, { useState } from 'react';
import './Cashier.css';

export default function Cashier() {
    const [state, setState] = useState(null);

    return (
        <div className="cashier-container">
            <h1>Cashier</h1>
            {/* Add cashier content here */}
        </div>
    );
}