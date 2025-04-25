document.addEventListener('DOMContentLoaded', function() {
    // Load cart items and product catalog
    const productCatalog = JSON.parse(localStorage.getItem('productCatalog')) || {};
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Render payment items
    renderPaymentItems(cartItems, productCatalog);
    
    // Calculate and display totals
    calculatePaymentTotals(cartItems, productCatalog);
    
    // Handle payment method selection
    document.querySelectorAll('.method-option input').forEach(radio => {
        radio.addEventListener('change', function() {
            // Update active class for method options
            document.querySelectorAll('.method-option').forEach(option => {
                option.classList.remove('active');
            });
            this.closest('.method-option').classList.add('active');
            
            // Show/hide payment details sections
            const cardDetails = document.getElementById('card-details');
            const upiDetails = document.getElementById('upi-details');
            
            cardDetails.style.display = 'none';
            upiDetails.style.display = 'none';
            
            if (this.id === 'card') {
                cardDetails.style.display = 'block';
            } else if (this.id === 'upi') {
                upiDetails.style.display = 'block';
            }
        });
    });
    
    // Initialize with COD selected by default
    document.getElementById('cod').checked = true;
    
    // Handle form submission
    document.getElementById('confirm-order-btn').addEventListener('click', function(e) {
        e.preventDefault();
        processOrder();
    });
    
    // Format card number input
    document.getElementById('card-number')?.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s+/g, '');
        if (value.length > 0) {
            value = value.match(new RegExp('.{1,4}', 'g')).join(' ');
        }
        e.target.value = value;
    });
    
    // Format expiry date input
    document.getElementById('card-expiry')?.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D+/g, '');
        if (value.length > 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });
});

function renderPaymentItems(cartItems, productCatalog) {
    const container = document.getElementById('payment-items-list');
    container.innerHTML = '';
    
    if (cartItems.length === 0) {
        container.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        return;
    }
    
    cartItems.forEach(item => {
        const product = productCatalog[item.productId] || {
            name: item.originalName || 'Product',
            pricePerKg: 0,
            image: '../images/default-product.jpg'
        };
        
        const weightValue = parseInt(item.weight);
        const itemPrice = product.pricePerKg * weightValue;
        const itemTotalPrice = itemPrice * item.quantity;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'payment-item';
        itemElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="item-info">
                <h4>${product.name}</h4>
                <p>${weightValue}kg × ${item.quantity}</p>
                <p>Rs. ${product.pricePerKg.toFixed(2)}/kg</p>
            </div>
            <div class="item-price">Rs. ${itemTotalPrice.toFixed(2)}</div>
        `;
        container.appendChild(itemElement);
    });
}

function calculatePaymentTotals(cartItems, productCatalog) {
    let subtotal = cartItems.reduce((sum, item) => {
        const product = productCatalog[item.productId] || { pricePerKg: 0 };
        const weightValue = parseInt(item.weight);
        const itemPrice = product.pricePerKg * weightValue;
        return sum + (itemPrice * item.quantity);
    }, 0);
    
    const tax = subtotal * 0.05;
    const delivery = 50;
    const total = subtotal + tax + delivery;
    
    document.getElementById('payment-subtotal').textContent = `Rs. ${subtotal.toFixed(2)}`;
    document.getElementById('payment-tax').textContent = `Rs. ${tax.toFixed(2)}`;
    document.getElementById('payment-total').textContent = `Rs. ${total.toFixed(2)}`;
}

function processOrder() {
    // Validate form
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').id;
    
    if (!name || !email || !phone || !address) {
        showErrorMessage('Please fill in all required fields');
        return;
    }
    
    // Additional validation for card payment
    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('card-number').value.trim();
        const cardName = document.getElementById('card-name').value.trim();
        const cardExpiry = document.getElementById('card-expiry').value.trim();
        const cardCvv = document.getElementById('card-cvv').value.trim();
        
        if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
            showErrorMessage('Please fill in all card details');
            return;
        }
        
        if (cardNumber.replace(/\s/g, '').length !== 16) {
            showErrorMessage('Please enter a valid 16-digit card number');
            return;
        }
        
        if (cardCvv.length < 3 || cardCvv.length > 4) {
            showErrorMessage('Please enter a valid CVV (3 or 4 digits)');
            return;
        }
    }
    
    // Additional validation for UPI payment
    if (paymentMethod === 'upi') {
        const upiId = document.getElementById('upi-id').value.trim();
        if (!upiId || !upiId.includes('@')) {
            showErrorMessage('Please enter a valid UPI ID (e.g., name@upi)');
            return;
        }
    }
    
    // Create order object
    const order = {
        id: 'ORD-' + Date.now(),
        date: new Date().toISOString(),
        items: JSON.parse(localStorage.getItem('cartItems')) || [],
        customer: { name, email, phone, address },
        paymentMethod,
        subtotal: parseFloat(document.getElementById('payment-subtotal').textContent.replace('Rs. ', '')),
        tax: parseFloat(document.getElementById('payment-tax').textContent.replace('Rs. ', '')),
        delivery: 50,
        total: parseFloat(document.getElementById('payment-total').textContent.replace('Rs. ', ''))
    };
    
    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    localStorage.removeItem('cartItems');
    
    // Show success message instead of redirecting
    showSuccessMessage(order);
}

function showSuccessMessage(order) {
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.order-success-popup, .success-overlay');
    existingMessages.forEach(msg => msg.remove());

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    
    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'order-success-popup';
    popup.innerHTML = `
        <div class="success-content">
            <div class="success-message">
                <h2>Order Placed Successfully!</h2>
                <div class="order-details">
                    <p><strong>Order ID:</strong> ${order.id}</p>
                    <p><strong>Total Amount:</strong> Rs. ${order.total.toFixed(2)}</p>
                    <p class="thank-you">Thank you for your purchase!</p>
                </div>
            </div>
            <div class="copyright">
                <p>© ${new Date().getFullYear()} SRI ANNAKAMATCHI TRADERS. All Rights Reserved.</p>
            </div>
            <button class="ok-button">OK</button>
        </div>
    `;

    // Add to page
    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    // Handle OK button click - CLEARS FORM AND CART
    popup.querySelector('.ok-button').addEventListener('click', function() {
        // 1. Clear the payment form
        const form = document.getElementById('payment-form');
        if (form) {
            form.reset();
            
            // Clear any custom formatted fields
            const cardNumber = document.getElementById('card-number');
            if (cardNumber) cardNumber.value = '';
            
            const cardExpiry = document.getElementById('card-expiry');
            if (cardExpiry) cardExpiry.value = '';
        }
        
        // 2. Clear the cart from localStorage
        localStorage.removeItem('cartItems');
        
        // 3. Clear any displayed cart items
        const cartContainer = document.getElementById('payment-items-list');
        if (cartContainer) {
            cartContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        }
        
        // 4. Reset totals display
        document.getElementById('payment-subtotal').textContent = 'Rs. 0.00';
        document.getElementById('payment-tax').textContent = 'Rs. 0.00';
        document.getElementById('payment-total').textContent = 'Rs. 0.00';
        
        // 5. Remove the popup and overlay
        overlay.remove();
        popup.remove();
        
        // 6. Optional: Redirect to home page after 1 second
        setTimeout(() => {
            window.location.href = 'index.html'; // Change to your home page URL
        }, 1000);
    });

    // Add styles if not already present (same as before)
    if (!document.getElementById('success-popup-styles')) {
        const style = document.createElement('style');
        style.id = 'success-popup-styles';
        document.head.appendChild(style);
    }
}
function processOrder() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').id;

    if (!name || !email || !phone || !address) {
        alert('Please fill in all required fields');
        return;
    }

    const order = {
        id: 'ORD-' + Date.now(),
        date: new Date().toISOString(),
        items: JSON.parse(localStorage.getItem('cartItems')) || [],
        customer: { name, email, phone, address },
        paymentMethod,
        subtotal: parseFloat(document.getElementById('payment-subtotal').textContent.replace('Rs. ', '')),
        tax: parseFloat(document.getElementById('payment-tax').textContent.replace('Rs. ', '')),
        delivery: 50,
        total: parseFloat(document.getElementById('payment-total').textContent.replace('Rs. ', ''))
    };

    fetch('http://localhost:5000/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            showSuccessMessage(order);
        } else {
            alert('Order submission failed');
        }
    })
    .catch(err => {
        console.error('Error submitting order:', err);
        alert('Error submitting order');
    });
}
