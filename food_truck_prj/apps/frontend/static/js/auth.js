document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Make an AJAX request for login
    fetch('/api/foodtruck/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.result.token) {
            // Save the token in localStorage
            localStorage.setItem('auth_token', data.result.token);

            window.location.href = 'main/';

        } else {
            console.error('Login failed:', data ? data.message : 'Unknown error');
            // Handle login failure (display error message, etc.)
        }
    })
    .catch(error => {
        console.error('Error during login:', error);
        // Handle AJAX request error
    });
});

document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();

    var regUsername = document.getElementById('reg-username').value;
    var regEmail = document.getElementById('reg-email').value;
    var regPassword = document.getElementById('reg-password').value;

    // Make an AJAX request for registration
    fetch('/api/foodtruck/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: regUsername,
            email: regEmail,
            password: regPassword,
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Check if registration was successful
        if (data.success) {
            // Redirect to the main page
            window.location.href = '/streetfood/main/';
        } else {
            // Handle registration failure (display error message, etc.)
            console.error('Registration failed:', data.message);
        }
    })
    .catch(error => {
        console.error('Error during registration:', error);
        // Handle AJAX request error
    });
});
