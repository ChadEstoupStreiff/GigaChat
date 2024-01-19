// Function to check if the token is initialized
function checkTokenAndRedirect() {
    // Check if the token is in localStorage
    var token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'login.html';
    }
}

function loginUser(userData) {
    // Convert the user data object into a query string
    const queryString = Object.entries(userData)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    // Make an API request to send the user's information
    const apiUrl = `http://localhost:4568/auth?${queryString}`;

    return fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        },
        body: JSON.stringify(userData)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error during login: ' + response.status);
            }
        });
}

function signupUser(userData) {
    // Convert the user data object into a query string
    console.log(userData)
    const queryString = Object.entries(userData)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    // Make an API request to send the user's information
    const apiUrl = `http://localhost:4568/user?${queryString}`;

    return fetch(apiUrl, {
        method: 'POST',
        headers: {
            'accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json(); // Parse and return the response data if successful
        } else {
            alert("Bad informations (probably mail)")
        }
    })
    .catch(error => {
        console.error('Unexpected error:', error);
    });
    
}

function disconnectUser() {
    localStorage.removeItem('token'); // Remove the token from localStorage
    checkTokenAndRedirect(); // Redirect to the login page after disconnection
}