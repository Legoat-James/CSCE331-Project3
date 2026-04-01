import React from 'react';
import './OrderSummary.css';

export default function OrderSummary({ orderItems, onRemoveItem }) {
    if (!orderItems || orderItems.length === 0) {
        return <div className="order-empty">No items in order.</div>;
    }

    const getButtonLabel = (mod) => {
        const isIceOrSugar = mod.menu_id === 65 || mod.menu_id === 64;
        return isIceOrSugar ? '↻' : '×';
    };

    return (
        <div className="order-list">
            {orderItems.map((item, index) => (
                <div key={index} className="order-line-item">
                    <div className="order-line-header">
                        <span className="order-line-name">{item.name}</span>
                        <div className="order-line-actions">
                            <span className="order-line-price">${parseFloat(item.cost).toFixed(2)}</span>
                            <button 
                                className="order-remove-btn"
                                onClick={() => onRemoveItem(index)}
                                title="Remove from order"
                                aria-label="Remove item"
                            >
                                <span>×</span>
                            </button>
                        </div>
                    </div>
                    {item.modifications_array && item.modifications_array.length > 0 && (
                        <div className="order-line-details">
                            {item.modifications_array.map((mod, modIndex) => (
                                <div key={modIndex} className="order-mod-row">
                                    <span className="order-mod-name">• {mod.name}</span>
                                    <div className="order-mod-actions">
                                        <span className="order-mod-price">${parseFloat(mod.cost).toFixed(2)}</span>
                                        <button 
                                            className={mod.menu_id === 65 || mod.menu_id === 64 ? "order-reset-btn" : "order-mod-remove-btn"}
                                            onClick={() => onRemoveItem(index, modIndex)}
                                            title={mod.menu_id === 65 || mod.menu_id === 64 ? "Reset to 1x" : "Remove modification"}
                                            aria-label={mod.menu_id === 65 || mod.menu_id === 64 ? "Reset modification" : "Remove modification"}
                                        >
                                            <span>{getButtonLabel(mod)}</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}