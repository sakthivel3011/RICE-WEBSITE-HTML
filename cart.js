document.addEventListener('DOMContentLoaded', function() {
  const productCatalog = JSON.parse(localStorage.getItem('productCatalog')) || {};
  let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

  // Clean up cart items on load
  cartItems = cartItems.filter(item => {
    const product = productCatalog[item.productId];
    return product && product.weightOptions && 
           product.weightOptions.includes(item.weight + 'kg');
  });
  localStorage.setItem('cartItems', JSON.stringify(cartItems));

  renderCartItems(cartItems, productCatalog);
  calculateTotals(cartItems, productCatalog);

  window.addEventListener('productCatalogUpdated', () => {
    const updatedCatalog = JSON.parse(localStorage.getItem('productCatalog')) || {};
    cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    renderCartItems(cartItems, updatedCatalog);
    calculateTotals(cartItems, updatedCatalog);
  });

  document.querySelector('.clear-cart')?.addEventListener('click', function() {
    localStorage.removeItem('cartItems');
    cartItems = [];
    renderCartItems([], productCatalog);
    calculateTotals([], productCatalog);
  });

  document.querySelector('.continue-btn')?.addEventListener('click', function() {
    window.location.href = 'order.html';
  });

  document.querySelector('.checkout-btn')?.addEventListener('click', function() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items before checkout.');
      return;
    }
    
    window.location.href = 'payment.html';
  });
});

function renderCartItems(cartItems, productCatalog) {
  const container = document.getElementById('cart-items-list');
  container.innerHTML = '';

  if (cartItems.length === 0) {
    container.innerHTML = '<p>Your cart is empty</p>';
    document.getElementById('item-count').textContent = '0';
    return;
  }

  let totalItems = 0;
  cartItems.forEach((item, index) => {
    const product = productCatalog[item.productId] || {
      name: item.originalName || 'Unknown Product',
      pricePerKg: 0,
      image: item.image || '../images/default.jpg' // Fallback to item.image if available
    };

    const weightValue = parseInt(item.weight);
    const itemPrice = product.pricePerKg * weightValue;
    const itemTotalPrice = itemPrice * item.quantity;
    totalItems += item.quantity;

    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <div class="item-details">
        <img src="${product.image}" alt="${product.name}" class="cart-item-image">
        <div>
          <h3>${product.name}</h3>
          <p>${weightValue}kg bag x ${item.quantity}</p>
          <p class="price-per-kg">Rs. ${product.pricePerKg.toFixed(2)}/kg</p>
        </div>
      </div>
      <div class="item-price">Rs. ${itemTotalPrice.toFixed(2)}</div>
      <div class="item-actions">
        <button class="quantity-btn decrease" data-index="${index}">-</button>
        <span>${item.quantity}</span>
        <button class="quantity-btn increase" data-index="${index}">+</button>
        <button class="remove-btn" data-index="${index}">
          <i class="fas fa-trash"></i> Remove
        </button>
      </div>
    `;
    container.appendChild(itemElement);
  });

  document.getElementById('item-count').textContent = totalItems;

  document.querySelectorAll('.quantity-btn').forEach(button => {
    button.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      const action = this.classList.contains('increase') ? 'increase' : 'decrease';
      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      
      if (action === 'increase') {
        cartItems[index].quantity += 1;
      } else if (cartItems[index].quantity > 1) {
        cartItems[index].quantity -= 1;
      }
      
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      renderCartItems(cartItems, productCatalog);
      calculateTotals(cartItems, productCatalog);
    });
  });

  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      cartItems.splice(index, 1);
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      renderCartItems(cartItems, productCatalog);
      calculateTotals(cartItems, productCatalog);
    });
  });
}

// ... rest of the cart.js code remains the same ...

function calculateTotals(cartItems, productCatalog) {
  let subtotal = cartItems.reduce((sum, item) => {
    const product = productCatalog[item.productId] || { pricePerKg: 0 };
    const weightValue = parseInt(item.weight);
    const itemPrice = product.pricePerKg * weightValue;
    return sum + (itemPrice * item.quantity);
  }, 0);
  
  const tax = subtotal * 0.05;
  const delivery = 50;
  const total = subtotal + tax + delivery;

  document.getElementById('products-total').textContent = `Rs. ${subtotal.toFixed(2)}`;
  document.getElementById('tax').textContent = `Rs. ${tax.toFixed(2)}`;
  document.getElementById('final-total').textContent = `Rs. ${total.toFixed(2)}`;
}

function showCheckoutNotification() {
  const notification = document.createElement('div');
  notification.className = 'checkout-notification';
  notification.textContent = 'Order placed successfully! Thank you for shopping with us.';
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 3000);
}