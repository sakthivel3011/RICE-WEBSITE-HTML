document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();

    // Validate form fields
    if (!name || !email || !phone || !message) {
        displayMessage('Please fill out all fields.', 'error');
        return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        displayMessage('Please enter a valid email address.', 'error');
        return;
    }

    if (!/^\d{10}$/.test(phone)) {
        displayMessage('Please enter a valid 10-digit phone number.', 'error');
        return;
    }

    try {
        // Send form data to the backend
        const response = await fetch('http://localhost:5000/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, phone, message }),
        });

        const result = await response.json();

        if (response.ok) {
            displayMessage(result.message, 'success');
            document.getElementById('contact-form').reset(); // Reset the form
        } else {
            displayMessage(`Error: ${result.message}`, 'error');
        }
    } catch (error) {
        displayMessage('Error submitting the form. Please try again.', 'error');
        console.error('Error:', error);
    }
});

// Function to display messages dynamically
function displayMessage(message, type) {
    const messageDiv = document.getElementById('form-message');
    messageDiv.textContent = message;
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.style.display = 'block';

    // Hide the message after 5 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}