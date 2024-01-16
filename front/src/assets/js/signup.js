const signupForm = document.getElementById('signup_form');
signupForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission to handle it with JavaScript

    // Get form data
    const formData = new FormData(signupForm);
    const userData = {
        user_mail: formData.get('email'),
        user_password: formData.get('password'),
        user_name: formData.get('username')
    };

    // Call the signupUser function from auth.js
    signupUser(userData)
        .then(responseData => {
            // Redirect to the login page after successful signup
            if (responseData != null)
                window.location.href = 'login.html'; // Replace 'login.html' with the actual login page URL
        })
        .catch(error => {
            // Handle any errors that occurred during signup
            console.error('Signup error: ' + error);
        });
});