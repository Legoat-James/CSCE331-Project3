import React from 'react';
import { Button } from 'react-bootstrap';

function FoodConfirmModal({ show = false, selectedFood = null, onClose, onConfirm }) {
  if (!show || !selectedFood) {
    return null;
  }

  return (
    <div
      className="tea-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="food-confirm-title"
    >
      <div className="tea-modal-card">
        <div className="tea-modal-header">
          <h3 id="food-confirm-title" className="tea-modal-title">
            Confirm Add
          </h3>
          <button
            type="button"
            className="tea-modal-close"
            onClick={onClose}
            aria-label="Close add confirmation"
          >
            ×
          </button>
        </div>

        <p className="tea-modal-price">
          Add <strong>{selectedFood?.name}</strong> to your order for <strong>${selectedFood?.price?.toFixed(2)}</strong>?
        </p>

        <div className="tea-modal-body">
          <p className="tea-modal-note">Food items are added directly and do not need customization.</p>
        </div>

        <div className="tea-modal-actions">
          <Button className="tea-modal-btn-secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button className="tea-modal-btn-primary" onClick={onConfirm}>
            Confirm Add
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FoodConfirmModal;
