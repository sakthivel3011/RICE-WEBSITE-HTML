let cartCount = 0;
let cartItems = [];

function generateProductCatalog() {
  const productCatalog = {};
  document.querySelectorAll('.product').forEach(productElement => {
    const productName = productElement.querySelector('h3').textContent;
    const priceText = productElement.querySelector('.price').textContent;
    const pricePerKg = parseFloat(priceText.replace('Rs. ', '').replace('/kg', ''));
    const productId = productName.toLowerCase().replace(/\s+/g, '-');
    const image = productElement.querySelector('img').src; // Get current image src
    const weightOptions = Array.from(productElement.querySelectorAll('.add-to-cart'))
      .map(btn => btn.getAttribute('data-weight'));

    productCatalog[productId] = {
      name: productName,
      pricePerKg: pricePerKg,
      image: image,
      originalName: productName,
      weightOptions: weightOptions,
      productElement: productElement // Reference to DOM element
    };
  });
  return productCatalog;
}

function updateCartItemsOnProductChange(oldCatalog, newCatalog) {
  cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const updatedCartItems = [];
  
  cartItems.forEach(item => {
    // Find matching product by original name and weight
    const oldProduct = oldCatalog[item.productId];
    if (oldProduct) {
      const matchingProduct = Object.values(newCatalog).find(p => 
        p.originalName === oldProduct.originalName && 
        p.weightOptions.includes(item.weight + 'kg')
      );
      
      if (matchingProduct) {
        const newId = Object.keys(newCatalog).find(id => 
          newCatalog[id].name === matchingProduct.name
        );
        if (newId) {
          updatedCartItems.push({ 
            ...item, 
            productId: newId,
            image: matchingProduct.image // Update image reference
          });
        }
      }
    }
  });
  
  cartItems = updatedCartItems;
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
  window.dispatchEvent(new Event('productCatalogUpdated'));
}

document.addEventListener('DOMContentLoaded', () => {
  const productCatalog = generateProductCatalog();
  localStorage.setItem('productCatalog', JSON.stringify(productCatalog));

  cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').textContent = cartCount;

  document.querySelectorAll('.product').forEach(productElement => {
    const nameElement = productElement.querySelector('h3');
    const priceElement = productElement.querySelector('.price');
    const imgElement = productElement.querySelector('img');

    const observer = new MutationObserver(() => {
      const oldCatalog = JSON.parse(localStorage.getItem('productCatalog')) || {};
      const newCatalog = generateProductCatalog();
      localStorage.setItem('productCatalog', JSON.stringify(newCatalog));
      
      // Update data-product attributes on buttons
      productElement.querySelectorAll('.add-to-cart').forEach(button => {
        const currentName = productElement.querySelector('h3').textContent;
        button.setAttribute('data-product', currentName);
      });
      
      updateCartItemsOnProductChange(oldCatalog, newCatalog);
    });

    observer.observe(nameElement, { childList: true, characterData: true, subtree: true });
    observer.observe(priceElement, { childList: true, characterData: true, subtree: true });
    observer.observe(imgElement, { attributes: true, attributeFilter: ['src'] });
  });
});

// ... rest of the order.js code remains the same ...

document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', () => {
    const productElement = button.closest('.product');
    const productName = productElement.querySelector('h3').textContent;
    const weight = button.getAttribute('data-weight');
    const weightValue = parseInt(weight);

    // Ensure button's data-product matches current name
    button.setAttribute('data-product', productName);

    const productId = productName.toLowerCase().replace(/\s+/g, '-');

    const existingItem = cartItems.find(item => 
      item.productId === productId && item.weight === weightValue
    );
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartItems.push({ 
        productId, 
        weight: weightValue, 
        quantity: 1,
        originalName: productName // Store original name for reference
      });
    }

    cartCount++;
    document.getElementById('cart-count').textContent = cartCount;
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    showCartNotification(productName, weight);
  });
});

document.querySelector('.cart')?.addEventListener('click', () => {
  showCartContainer();
});

function showCartContainer() {
  let cartContainer = document.getElementById('cart-container');
  if (!cartContainer) {
    cartContainer = document.createElement('div');
    cartContainer.id = 'cart-container';
    document.body.appendChild(cartContainer);
  }

  cartContainer.innerHTML = '<h4>Cart Items</h4>';
  const closeButton = document.createElement('button');
  closeButton.className = 'close-btn';
  closeButton.textContent = 'X';
  closeButton.addEventListener('click', () => {
    cartContainer.remove();
  });
  cartContainer.appendChild(closeButton);

  const productCatalog = JSON.parse(localStorage.getItem('productCatalog')) || {};
  cartItems.forEach((item, index) => {
    const product = productCatalog[item.productId] || { 
      name: item.originalName || 'Unknown Product', 
      image: '../images/default.jpg' 
    };
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';

    const itemText = document.createElement('span');
    itemText.textContent = `${item.weight}kg of ${product.name} (x${item.quantity})`;
    itemDiv.appendChild(itemText);

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-btn';
    removeButton.textContent = '-';
    removeButton.addEventListener('click', () => {
      cartCount -= item.quantity;
      cartItems.splice(index, 1);
      document.getElementById('cart-count').textContent = cartCount;
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      showCartContainer();
    });
    itemDiv.appendChild(removeButton);

    cartContainer.appendChild(itemDiv);
  });

  const orderButton = document.createElement('button');
  orderButton.className = 'order-btn';
  orderButton.textContent = 'Order Now';
  orderButton.addEventListener('click', () => {
    showConfirmationModal();
    cartContainer.remove();
  });
  cartContainer.appendChild(orderButton);
}

function showConfirmationModal() {
  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  document.body.appendChild(overlay);

  const modal = document.createElement('div');
  modal.id = 'confirmation-modal';

  const message = document.createElement('h4');
  message.textContent = 'Proceed to cart to complete your order!';
  modal.appendChild(message);

  const closeButton = document.createElement('button');
  closeButton.textContent = 'OK';
  closeButton.addEventListener('click', () => {
    window.location.href = 'cart.html';
  });
  modal.appendChild(closeButton);

  document.body.appendChild(modal);
}

function showCartNotification(product, weight) {
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.textContent = `${weight} of ${product} has been added to your cart!`;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

document.getElementById('contact-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Thank you for contacting us! We will get back to you soon.');
  e.target.reset();
});