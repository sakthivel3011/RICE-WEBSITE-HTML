// Ensure the event listener is added only once
if (!window.loginFormListenerAdded) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/login1', { // Ensure the route is `/login1`
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Show success message and redirect only once
                alert('Login successful!');
                window.location.replace('index.html'); // Use replace to avoid reloading the script
            } else {
                alert(data.message || 'Login failed!');
            }
        } catch (err) {
            console.error('Error during login:', err);
            alert('An error occurred. Please try again.');
        }
    });

    // Set a flag to indicate the listener has been added
    window.loginFormListenerAdded = true;
}