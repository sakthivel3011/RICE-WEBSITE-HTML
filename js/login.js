const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});
loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// Smooth transition effect
document.addEventListener("DOMContentLoaded", () => {
    container.style.transition = "transform 0.6s ease-in-out";
});

// Button hover animation
document.querySelectorAll("button").forEach(button => {
    button.addEventListener("mouseover", () => {
        button.style.transform = "scale(1.1)";
        button.style.transition = "transform 0.3s ease-in-out";
    });
    button.addEventListener("mouseout", () => {
        button.style.transform = "scale(1)";
    });
});

// Input field fade-in animation
document.querySelectorAll("input").forEach(input => {
    input.style.opacity = "0";
    input.style.transition = "opacity 0.5s ease-in-out, transform 0.5s ease-in-out";
    input.style.transform = "translateY(-10px)";
    setTimeout(() => {
        input.style.opacity = "1";
        input.style.transform = "translateY(0)";
    }, 500);
});

// Toggle panel slide animation
document.querySelectorAll(".toggle-panel button").forEach(button => {
    button.addEventListener("click", () => {
        container.classList.add("animate");
        setTimeout(() => {
            container.classList.remove("animate");
        }, 600);
    });
});

// Sign-up route
app.post('/signup', async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        // Save the user to the database
        await newUser.save();

        // Send success response
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});