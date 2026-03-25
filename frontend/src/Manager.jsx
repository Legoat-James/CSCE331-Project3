import React, { useState } from 'react';
import './Manager.css';

export default function Manager() {
    const [state, setState] = useState(null);

    return (
        <div className="manager-container">
            <h1>Manager</h1>
            {/* Add Manager content here */}
        </div>
    );
}