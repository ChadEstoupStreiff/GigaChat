const loginForm = document.getElementById('login_form');
loginForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission to handle it with JavaScript

    // Get form data
    const formData = new FormData(loginForm);
    const userData = {
        user_mail: formData.get('email'),
        user_password: formData.get('password')
    };

    // Call the loginUser function from auth.js
    loginUser(userData)
        .then(responseData => {
            if (responseData != null) {
                const token = responseData;
                localStorage.setItem('token', token);
                // Redirect to the main page after successful logging in
                window.location.href = 'index.html'; // Replace 'index.html' with the actual login page URL
            }
        })
        .catch(error => {
            // Handle any errors that occurred during logging in
            alert("Connection failure : wrong email or password !");
        });
});