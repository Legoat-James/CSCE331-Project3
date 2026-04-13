import React from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';

const fallbackCardImage = 'https://picsum.photos/id/1040/900/600';

function Menu({ 
  items, 
  activeCategory, 
  isLoading, 
  onSelectItem,
  onCardImageError 
}) {
  const handleImageError = (event) => {
    if (onCardImageError) {
      onCardImageError(event);
    } else if (event.currentTarget.src !== fallbackCardImage) {
      event.currentTarget.src = fallbackCardImage;
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" className="tea-spinner" />
      </div>
    );
  }

  return (
    <section className="menu-panel" aria-label="Menu items">
      <div className="panel-heading-row">
        <h3 className="panel-title">
          Featured {activeCategory === 'drink' ? 'Drinks' : 'Food'}
        </h3>
      </div>

      <div className="menu-grid brown-scroll">
        {items.length === 0 && (
          <Card className="h-100 text-center tea-card">
            <Card.Body>
              <Card.Title>No items yet</Card.Title>
              <Card.Text className="tea-description">
                No {activeCategory} items were returned from the database.
              </Card.Text>
            </Card.Body>
          </Card>
        )}

        {items.map((item) => (
          <Card key={item.id} className="text-center tea-card clickable-card"
          onClick={() => onSelectItem(item)}
          >
            <Card.Img
              variant="top"
              src={item.image}
              alt={item.name}
              loading="lazy"
              onError={handleImageError}
            />
            <Card.Body className="d-flex flex-column">
              <Card.Title>{item.name}</Card.Title>
              <Card.Text className="tea-description">{item.description}</Card.Text>
              <Card.Text className="tea-price mt-auto mb-0 fw-bold fs-5">${item.price.toFixed(2)}</Card.Text>
              {/* <Button
                size="sm"
                className="tea-btn-select mt-auto"
                onClick={() => onSelectItem(item)}
              >
                Select
              </Button> */}
            </Card.Body>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default Menu;