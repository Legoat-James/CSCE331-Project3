import React, { useState } from 'react';
import './ModificationsWindow.css';

export default function ModificationsWindow({ show, onHide, item, modifications, onAddItem, menuItems }) {
    const [selectedMods, setSelectedMods] = useState([]);
    const [iceLevel, setIceLevel] = useState('1x');
    const [sugarLevel, setSugarLevel] = useState('1x');
    const [itemSize, setItemSize] = useState('medium');
    const levelOptions = ['0.5x', '0.75x', '1x', '1.25x', '1.5x']
    const sizeOptions = ['small', 'medium', 'large'];

    if (!item || !show) {
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
        selectedMods.push({menu_id: 65, name: `Ice ${iceLevel}`, category: 'modifications' ,cost: 0});
        selectedMods.push({menu_id: 64, name: `Sugar ${sugarLevel}`, category: 'modifications' ,cost: 0});
        
        let finalItem = item;
        if(item.category === 'drink' && itemSize !== 'medium') {
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
        
        // Reset and close
        setSelectedMods([]);
        setIceLevel('1x');
        setSugarLevel('1x');
        setItemSize('medium');
        onHide();
    };

    const handleClose = () => {
        setSelectedMods([]);
        setIceLevel('1x');
        setSugarLevel('1x');
        setItemSize('medium');
        onHide();
    }

    return (
        <div className="tea-modal-overlay" onClick={handleClose}>
            <div className="tea-modal-card tea-modal-card--drink" onClick={(e) => e.stopPropagation()}>
                <div className="tea-modal-header">
                    <h3 className="tea-modal-title">Add Modifications for {item.name}</h3>
                    <button className="tea-modal-close" onClick={handleClose} aria-label="Close">
                        ×
                    </button>
                </div>

                <div className="tea-modal-price">
                    <strong>Base Price:</strong> ${parseFloat(item.cost).toFixed(2)}
                </div>

                <div className="tea-modal-body">
                    {/* Size Selection */}
                    {item.category === 'drink' && (
                        <div className="tea-mod-section">
                            <h4 className="tea-mod-heading">Size</h4>
                            <div className="tea-size-options">
                                {sizeOptions.map(size => (
                                    <button
                                        key={size}
                                        className={`tea-size-btn ${itemSize === size ? 'is-active' : ''}`}
                                        onClick={() => setItemSize(size)}
                                    >
                                        {size.charAt(0).toUpperCase() + size.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ice Level */}
                    <div className="tea-mod-section">
                        <h4 className="tea-mod-heading">Ice Level</h4>
                        <div className="tea-size-options">
                            {levelOptions.map(level => (
                                <button
                                    key={`ice-${level}`}
                                    className={`tea-size-btn ${iceLevel === level ? 'is-active' : ''}`}
                                    onClick={() => setIceLevel(level)}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sugar Level */}
                    <div className="tea-mod-section">
                        <h4 className="tea-mod-heading">Sugar Level</h4>
                        <div className="tea-size-options">
                            {levelOptions.map(level => (
                                <button
                                    key={`sugar-${level}`}
                                    className={`tea-size-btn ${sugarLevel === level ? 'is-active' : ''}`}
                                    onClick={() => setSugarLevel(level)}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toppings */}
                    <div className="tea-mod-section">
                        <h4 className="tea-mod-heading">Toppings & Add-ons</h4>
                        <div className="tea-toppings-grid">
                            {modifications
                                .filter(mod => mod.category === 'topping' || mod.name ==='swap sugar' || mod.name === 'Oak Milk')
                                .map(mod => {
                                    const isSelected = !!selectedMods.find(m => m.menu_id === mod.menu_id);
                                    return (
                                        <button
                                            key={mod.menu_id}
                                            className={`tea-topping-btn ${isSelected ? 'is-selected' : ''}`}
                                            onClick={() => handleModSelection(mod)}
                                        >
                                            <span className="tea-topping-btn-name">{mod.name}</span>
                                            <span className="tea-topping-btn-price">+${parseFloat(mod.cost).toFixed(2)}</span>
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                </div>

                <div className="tea-modal-actions">
                    <button className="tea-modal-btn-secondary" onClick={handleClose}>
                        Cancel
                    </button>
                    <button className="tea-modal-btn-primary" onClick={handleConfirm}>
                        Add to Order
                    </button>
                </div>
            </div>
        </div>
    );
}