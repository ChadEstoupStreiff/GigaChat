signupForm = document.getElementById('signup_form')
signupForm.addEventListener('submit', function (event) {

    var recaptchaResponse = grecaptcha.getResponse();
    event.preventDefault();
    const formData = new FormData(signupForm);
    const userData = {
        user_mail: formData.get('email'),
        user_password: formData.get('password'),
        user_name: formData.get('username'),
        recaptcha_response: recaptchaResponse,
    };

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
