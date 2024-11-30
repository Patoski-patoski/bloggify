// public/javascript/auth.js
async function signupBlog() {
    // Clear previous error messages
    document.querySelectorAll('.error-message').forEach(elem => elem.textContent = '');

    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        bio: document.getElementById('bio').value
    };

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (!response.ok) {
            if (response.status === HTTP_STATUS.CONFLICT) {
                // Handle existing user error
                const errorElem = document.querySelector('#email').nextElementSibling;
                errorElem.textContent = data.message;
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } else {
            // Successful registration
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error:', error);
        const errorMsg = document.getElementById('error-message');
        if (errorMsg) {
            errorMsg.textContent = error || 'An error occured during login';
        }
    }
}

document.getElementById('signupForm').addEventListener('submit', (event) => {
    event.preventDefault();
    signupBlog(event);
});


// Login User function
async function loginBlog() {
    // Clear previous error messages
    document.querySelectorAll('.error-message').forEach(
        elem => elem.textContent = '');

    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401) {
                // Handle invalid credentials
                const emailErrorElem = document.querySelector('#email').nextElementSibling;
                const passwordErrorElem = document.querySelector('#password').nextElementSibling;
                if (emailErrorElem) {
                    emailErrorElem.textContent = data.message;
                }
                if (passwordErrorElem) {
                    passwordErrorElem.textContent = data.message;
                }
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } else {
            // Successful login
            window.location.href = '/blog';
        }
    } catch (error) {
        console.error('Error:', error);
        const errorMsg = document.getElementById('error-message');
        if (errorMsg) {
            errorMsg.textContent = error || 'An error occured during login';
        }
    }
}

document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    loginBlog(event);
});