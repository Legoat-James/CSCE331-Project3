import { useEffect, useRef } from 'react';
import { Button, Spinner, Form } from 'react-bootstrap';
import { useTranslate } from '../../contexts/TranslationContext';

function OrderSummary({ 
  orderItems = [], 
  subtotal = 0,
  isError = false,
  errorMessage = '',
  menuItemCount = 0,
  submitMessage = '',
  submitError = '',
  isPending = false,
  sugarMenuId,
  iceMenuId,
  onEditItem,
  onRemoveItem,
  onFinishOrder,
  customerName,
  setCustomerName
}) {
  const { translate } = useTranslate();
  const bottomRef = useRef(null);

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  },[orderItems])

  return (
    <aside className="order-panel" aria-label="Current order">
      <h1 
      font-size="1.0rem"
      className="panel-title"
      >{translate('Current Order')}</h1>
      <p className="order-subtitle">{translate('Your selected drinks and snacks will appear here.')}</p>

      {/* {!isError && (
        <div className="backend-status">
          Loaded {menuItemCount} active item{menuItemCount === 1 ? '' : 's'} from the menu database.
        </div>
      )} */}
      {isError && <div className="backend-status error">{errorMessage}</div>}

      <div className="order-list brown-scroll" tabindex="0" >
        {orderItems.length === 0 && (
          <p className="order-empty">{translate('No items in order yet.')}</p>
        )}

        {orderItems.map((item) => {
          const modifications = Array.isArray(item.modifications_array) ? item.modifications_array : [];
          const sugarMod = modifications.find((mod) => mod.menu_id === sugarMenuId);
          const iceMod = modifications.find((mod) => mod.menu_id === iceMenuId);
          const toppings = modifications.filter((mod) => mod.category === 'topping');
          const hasDrinkCoreMods = Boolean(sugarMod || iceMod);
          const swapSugarSelected = modifications.some((mod) => String(mod.name || '').toLowerCase() === 'swap sugar');
          const oatMilkSelected = modifications.some((mod) => {
            const lower = String(mod.name || '').toLowerCase();
            return lower === 'oat milk' || lower === 'oak milk';
          });
          const hotSelected = modifications.some((mod) => String(mod.name || '').toLowerCase() === 'hot');

          return (
          <div key={item.id} className="order-line-item">
            <div className="order-line-header">
              <span className="order-line-name">{translate(item.name)}</span>
              <div className="order-line-actions">
                <span className="order-line-price">${item.totalPrice.toFixed(2)}</span>
                {hasDrinkCoreMods && (
                  <button
                    type="button"
                    className="order-edit-btn"
                    aria-label={`Edit ${item.name}`}
                    onClick={() => onEditItem(item)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.06-9.06.92.92L5.92 19.58zM20.7 7.04a1 1 0 0 0 0-1.42l-2.32-2.32a1 1 0 0 0-1.42 0l-1.42 1.42 3.75 3.75 1.41-1.43z" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  className="order-remove-btn"
                  aria-label={`Remove ${item.name} from order`}
                  onClick={() => onRemoveItem(item.id)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm-3 6h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 9zm4 2v8h2v-8h-2zm4 0v8h2v-8h-2z" />
                  </svg>
                </button>
              </div>
            </div>
             
            {hasDrinkCoreMods && (
              <div className="order-line-details">
                {sugarMod && <div>{translate(sugarMod.name)}</div>}
                {iceMod && <div>{translate(iceMod.name)}</div>}
                {swapSugarSelected && <div>{translate('Swap Sugar: selected')}</div>}
                {oatMilkSelected && <div>{translate('Oat Milk: selected')}</div>}
                {hotSelected && <div>{translate('Hot: selected')}</div>}
                {toppings.length > 0 && (
                  <div>
                    {translate('Toppings:')} {toppings.map((topping) => translate(topping.name)).join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        );
        })}
        {/* bottom scroll anchor */}
        <div ref={bottomRef} />
      </div>

      <div className='mt-auto'>

        <p className="order-subtotal">{translate('Subtotal:')} ${subtotal.toFixed(2)}</p>

        {submitMessage && <div className="order-submit-message success">{submitMessage}</div>}
        {submitError && <div className="order-submit-message error">{submitError}</div>}
        <Form className='order-name'>
          <Form.Group className="mb-3" controlId="customerName">
              <Form.Control
              type="text"
              placeholder={translate('enter name here...')}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="cashier-order-total"
              />
          </Form.Group>

      </Form>

        <Button
          size="sm"
          className="tea-btn-finish w-100 py-4 mt-2"
          onClick={onFinishOrder}
          disabled={isPending || orderItems.length === 0 || customerName===''}
        >
          {isPending ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              {translate('Submitting...')}
            </>
          ) : (
            translate('Checkout')
          )}
        </Button>
      </div>
    </aside>
  );
}

export default OrderSummary;
