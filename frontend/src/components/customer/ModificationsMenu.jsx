import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { useTranslate } from '../../contexts/TranslationContext';

const iceLevelOptions = ['50%', '75%', '100%', '125%', '150%'];

function DrinkCustomizer({
  show = false,
  selectedDrink = null,
  selectedDrinkSize = 'medium',
  selectedDrinkPrice = 0,
  selectedDrinkTotal = 0,
  availableDrinkSizes = [],
  toppingItems = [],
  selectedToppings = {},
  sugarMultiplier = 1,
  iceLevelIndex = 2,
  swapSugar = false,
  useOatMilk = false,
  hasSugarSlider = false,
  hasIceControl = false,
  hasSwapSugar = false,
  hasOatMilkToggle = false,
  editingOrderItemId = null,
  onClose,
  onSave,
  onSizeChange,
  onToppingQuantityChange,
  onSugarChange,
  onIceChange,
  onSwapSugarChange,
  onOatMilkChange
}) {
  const { translate } = useTranslate();

  if (!show || !selectedDrink) {
    return null;
  }

  return (
    <div
      className="tea-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="toppings-modal-title"
    >
      <div className="tea-modal-card tea-modal-card--drink">
        <div className="tea-modal-header">
          <h3 id="toppings-modal-title" className="tea-modal-title">
            {translate(editingOrderItemId
              ? `Edit your ${selectedDrink?.name}`
              : `Customize your ${selectedDrink?.name}`
            )}
          </h3>
          <button
            type="button"
            className="tea-modal-close"
            onClick={onClose}
            aria-label="Close customization dialog"
          >
            ×
          </button>
        </div>

        <p className="tea-modal-price">
          {translate('Size:')} <strong>{translate(selectedDrinkSize)}</strong> | {translate('Base Price:')} <strong>${selectedDrinkPrice?.toFixed(2)}</strong>
        </p>

        <div className="tea-modal-body">
          <p className="tea-mod-heading">{translate('Select Size')}</p>
          <div className="tea-size-options">
            {availableDrinkSizes.map((size) => (
              <Button
                key={size}
                type="button"
                className={`tea-size-btn ${selectedDrinkSize === size ? 'is-active' : ''}`}
                onClick={() => onSizeChange(size)}
              >
                {translate(size.charAt(0).toUpperCase() + size.slice(1))} (${selectedDrink?.sizeOptions?.[size]?.toFixed(2)})
              </Button>
            ))}
          </div>

          <p className="tea-mod-heading">{translate('Toppings')}</p>
          <div className="tea-toppings-list">
            {toppingItems.length === 0 && (
              <p className="tea-modal-note">{translate('No toppings available from the database.')}</p>
            )}

            {toppingItems.map((topping) => (
              <div key={topping.id} className="tea-topping-row">
                <div className="tea-topping-meta">
                  <span className="tea-topping-name">{translate(topping.name)}</span>
                  <span className="tea-topping-price">+${topping.price.toFixed(2)}</span>
                </div>
                <div className="tea-topping-controls">
                  <Button
                    type="button"
                    className="tea-qty-btn"
                    onClick={() => onToppingQuantityChange(topping.id, -1)}
                  >
                    −
                  </Button>
                  <span className="tea-qty-value">{selectedToppings[topping.id] || 0}</span>
                  <Button
                    type="button"
                    className="tea-qty-btn"
                    onClick={() => onToppingQuantityChange(topping.id, 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <p className="tea-mod-heading">{translate('Modifications')}</p>

          {hasSugarSlider && (
            <div className="tea-slider-block">
              <Form.Label htmlFor="sugar-slider" className="tea-slider-label">
                {translate('Sugar Multiplier:')} <strong>{sugarMultiplier.toFixed(2)}x</strong>
              </Form.Label>
              <Form.Range
                id="sugar-slider"
                min={0.5}
                max={1.5}
                step={0.25}
                value={sugarMultiplier}
                onChange={(e) => onSugarChange(Number(e.target.value))}
              />
            </div>
          )}

          {hasIceControl && (
            <div className="tea-slider-block">
              <Form.Label htmlFor="ice-slider" className="tea-slider-label">
                {translate('Ice Level:')} <strong>{iceLevelOptions[iceLevelIndex]}</strong>
              </Form.Label>
              <Form.Range
                id="ice-slider"
                min={0}
                max={4}
                step={1}
                value={iceLevelIndex}
                onChange={(e) => onIceChange(Number(e.target.value))}
              />
            </div>
          )}

          <div className="tea-toggle-list">
            {hasSwapSugar && (
              <Form.Check
                type="checkbox"
                id="swap-sugar-check"
                label={translate('Swap Sugar')}
                checked={swapSugar}
                onChange={(e) => onSwapSugarChange(e.target.checked)}
                className="tea-toggle-item"
              />
            )}

            {hasOatMilkToggle && (
              <Form.Check
                type="checkbox"
                id="oat-milk-check"
                label={translate('Oat Milk')}
                checked={useOatMilk}
                onChange={(e) => onOatMilkChange(e.target.checked)}
                className="tea-toggle-item"
              />
            )}
          </div>

          <p className="tea-modal-note">
            {translate('Toppings can be added in any quantity. Swap sugar and oat milk are included in order submission when selected.')}
          </p>

          <p className="tea-modal-total">{translate('Current drink total:')} ${selectedDrinkTotal.toFixed(2)}</p>
        </div>

        <div className="tea-modal-actions">
          <Button className="tea-modal-btn-secondary" onClick={onClose}>
            {translate('Cancel')}
          </Button>
          <Button className="tea-modal-btn-primary" onClick={onSave}>
            {translate(editingOrderItemId ? 'Save Changes' : 'Add Drink')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DrinkCustomizer;