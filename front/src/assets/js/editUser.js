let get_name;
let mail;
let password;

window.onload = function () {
    // API CONNEXION
    const apiUrl = getAPIUrl() + '/user';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };

    // Requête
    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    // Appel de l'API en utilisant fetch
    fetch(apiUrl, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('ERROR when request to api');
            }
            return response.json(); // Renvoie les données de la réponse sous forme de JSON
        })
        .then(data => {
            get_name = data["name"];
            mail = data["mail"];
            
            document.getElementById('name').value = get_name;
        })
        .catch(error => {
            // Gestion des erreurs
            console.error('Erreur:', error);
        });
}




const edit_user_form = document.getElementById('edit_user_form');
edit_user_form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission to handle it with JavaScript

    // Get form data
    const formData = new FormData(edit_user_form);
    const userData = {};
    if (formData.get('name') != get_name) {
        userData["user_name"] = formData.get('name');
    }
    if (formData.get('password') != password) {
        userData["user_password"] = formData.get('password');
    }

    editUser(userData)
    .then(responseData => {
        // Redirect to the login page after successful signup
        window.location.href = 'index.html'; // Replace 'login.html' with the actual login page URL
    })
    .catch(error => {
        // Handle any errors that occurred during signup
        console.error('Signup error: ' + error);
    });
});


function editUser(userData) {
    var token = localStorage.getItem('token');
    // Convert the user data object into a query string
    const queryString = Object.entries(userData)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    // Make an API request to send the user's information
    const apiUrl = getAPIUrl() + `/user?${queryString}`;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
    return fetch(apiUrl, {
        method: 'PUT',
        headers: headers
    })
        .then(response => {
            if (response.ok) {
                return response.json(); // Parse and return the response data if successful
            } else {
                throw new Error('Error during user editing: ' + response.status);
            }
        });
}

document.getElementById("cancelButton").addEventListener("click", function() {
    history.back(); // Retourne sur la page précédente
});