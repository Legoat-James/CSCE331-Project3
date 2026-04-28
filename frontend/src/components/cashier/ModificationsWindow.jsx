import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
// import './Cashier.css';
import './ModificationsWindow.css';

export default function ModificationsWindow({ show, onHide, item, modifications, onAddItem, menuItems, ingredients, initialMods, initialQuantity = 1 }) {
    useEffect(() => {
        console.log('ingredients received by modifications window:', ingredients);
    }, [ingredients]);

    const [selectedMods, setSelectedMods] = useState([]);
    const [iceLevel, setIceLevel] = useState('1x');
    const [sugarLevel, setSugarLevel] = useState('1x');
    const [itemSize, setItemSize] = useState('medium');
    const levelOptions = ['0.0x', '0.5x', '0.75x', '1x', '1.25x', '1.5x']
    const sizeOptions = ['small', 'medium', 'large'];
    const [hotSelected, setHotSelected] = useState(false);
    const [drinkQuantity, setDrinkQuantity] = useState(1);

    // Initial setup when modal opens
    useEffect(() => {
        if (show) {
            if (initialMods && initialMods.length > 0) {
                // We're editing an existing item
                const newSelectedMods = [];
                let newIceLevel = '1x';
                let newSugarLevel = '1x';
                let newHotSelected = false;

                initialMods.forEach(mod => {
                    if (mod.menu_id === 65) {
                        newIceLevel = mod.name.replace('Ice ', '');
                    } else if (mod.menu_id === 64) {
                        newSugarLevel = mod.name.replace('Sugar ', '');
                    } else if (mod.menu_id === 71) {
                        newHotSelected = true;
                    } else {
                        newSelectedMods.push(mod);
                    }
                });

                setIceLevel(newIceLevel);
                setSugarLevel(newSugarLevel);
                setHotSelected(newHotSelected);
                setSelectedMods(newSelectedMods);
                setDrinkQuantity(initialQuantity); // Use passed quantity when editing
                
                // Decode size from name if possible
                if (item && item.name) {
                    if(item.name.toLowerCase().includes('large')) setItemSize('large');
                    else if(item.name.toLowerCase().includes('small')) setItemSize('small');
                    else setItemSize('medium');
                }
            } else {
                // Resetting for a fresh item
                setSelectedMods([]);
                setIceLevel('1x');
                setSugarLevel('1x');
                setItemSize('medium');
                setHotSelected(false);
                setDrinkQuantity(initialQuantity);
            }
        }
    }, [show, initialMods, item, initialQuantity]);

    if (!item || !show) {
        return null;
    }

    const handleModSelection = (mod, action) => {
        if (action === 1) {//add item to order
            if(mod.menu_id === 63 || mod.menu_id === 66) {
                //if we already have swap sugar or oat milk, we cannot add a second one
                if(selectedMods.some(selected => selected.menu_id === mod.menu_id)) {
                    return;
                }
            }
            setSelectedMods(prevMods => {
                // if (prevMods.find(m => m.menu_id === mod.menu_id)) {
                //     return prevMods.filter(m => m.menu_id !== mod.menu_id);
                // } else {
                return [...prevMods, mod];
                // }
            });
        }
        else {
            setSelectedMods(prevMods => {
                const index = prevMods.findIndex(m => m.menu_id === mod.menu_id); //returns -1 if not found
                if (index !== -1) {
                    const newMods = [...prevMods];
                    newMods.splice(index, 1);
                    return newMods;
                }
                return prevMods;
            });
        }
    };

    const handleConfirm = () => {
        const finalMods = [...selectedMods];
        finalMods.push({menu_id: 65, name: `Ice ${iceLevel}`, category: 'modifications' ,cost: 0});
        finalMods.push({menu_id: 64, name: `Sugar ${sugarLevel}`, category: 'modifications' ,cost: 0});
        if (hotSelected) finalMods.push({menu_id: 71, name: 'hot', category: 'modifications', cost: 0});
        
        let finalItem = item;
        if(item.category === 'drink') {
            const baseName = item.name.replace(/ small| large/i, '').trim();
            if (itemSize === 'medium') {
                const found = menuItems.find(m => m.name.toLowerCase() === baseName.toLowerCase());
                if (found) finalItem = found;
            } else {
                const found = menuItems.find(m => m.name.toLowerCase() === `${baseName.toLowerCase()} ${itemSize}`);
                if (found) finalItem = found;
            }
        }
        console.log(`selected size:`, itemSize);
        console.log('selected item:', item);
        console.log('final item after size adjustment:', finalItem);
        console.log(`modification array is:`, finalMods);

        // Pass the quantity directly back up via onAddItem instead of looping internally
        onAddItem(parseFloat(finalItem.cost || 0), finalItem.name, finalItem.menu_id, finalMods, drinkQuantity);
        
        // Reset and close
        setSelectedMods([]);
        setIceLevel('1x');
        setSugarLevel('1x');
        setItemSize('medium');
        setHotSelected(false);
        setDrinkQuantity(1);
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
                                    const toppingIngredient = ingredients.find(i => (i.name.toLowerCase() === mod.name) && i.is_active)
                                    console.log('ingredient is: ' ,toppingIngredient);
                                    if (mod.name === 'swap sugar' || mod.name === 'Oak Milk') {
                                        return (
                                            <button
                                                key={mod.menu_id}
                                                className={`tea-topping-btn ${isSelected ? 'is-selected' : ''}`}
                                                onClick={() => handleModSelection(mod, isSelected ? -1 : 1)}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px', width: '100%' }}
                                            >
                                                <span className="tea-topping-btn-name">{mod.name}</span>
                                                <span className="tea-topping-btn-price">+${parseFloat(mod.cost).toFixed(2)}</span>
                                            </button>
                                        );
                                    }

                                    return (
                                        <div key={mod.menu_id} className={`tea-topping-row`} >
                                            
                                            <span className="tea-topping-btn-name">{mod.name} , ({toppingIngredient?.unit || 'N/A'})</span>
                                            <span className="tea-topping-btn-price">+${parseFloat(mod.cost).toFixed(2)}</span>

                                            <button
                                            className={`tea-topping-btn`}
                                            onClick={() => handleModSelection(mod, -1)}
                                            >
                                            -
                                            </button>

                                            <span>{selectedMods.filter(selMod => selMod.menu_id === mod.menu_id).length}</span>
                                            
                                            <button
                                            className={`tea-topping-btn`}
                                            onClick={() => handleModSelection(mod, +1)}
                                            >
                                            +
                                            </button>
                                            
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                    <div>
                        <button
                            type="button"
                            className={`tea-topping-btn ${hotSelected ? 'is-selected' : ''}`}
                            onClick={() => setHotSelected(prev => !prev)}
                        >
                            Hot Drink {hotSelected ? '✅' : '❌'}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }} >
                            <b>Quantity </b>
                            <Button
                            type="button"
                            className={`tea-topping-btn`}
                            style={{color: 'black'}}
                            onClick={() => setDrinkQuantity(Math.max(1, drinkQuantity - 1))}
                            >
                            −
                            </Button>
                            <span className="tea-qty-value">{drinkQuantity}</span>
                            <Button
                            type="button"
                            className={`tea-topping-btn`}
                            style={{color: 'black'}}
                            onClick={() => setDrinkQuantity(drinkQuantity + 1)}
                            >
                            +
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="tea-modal-actions">
                    <button className="tea-modal-btn-secondary" onClick={handleClose}>
                        Cancel
                    </button>
                    <button className="tea-modal-btn-primary" onClick={handleConfirm}>
                        {initialMods && initialMods.length > 0 ? "Update Order" : "Add to Order"}
                    </button>
                </div>
            </div>
        </div>
    );
}