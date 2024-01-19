let selected_conv = null;
var ws = null;
const writting_input = document.getElementById('writting_space_input')
const writting_button = document.getElementById('writting_space_button')
const new_chat_receiver_input = document.getElementById('new_chat_receiver_input')
var new_chat_mode = null;
const conv_list = document.getElementById("conv_list_space");
let my_name = "";
let my_mail = "";

document.getElementById('profile-btn').addEventListener('click', function () {
    checkTokenAndRedirect();
    window.location.href = 'profile.html';
})


document.getElementById('add_user_button').addEventListener('click', (event) => {
    remove_display_none_right_space();
    remove_display_none_new_receiver_space();
    new_chat_mode = true;

    const chat_list = document.getElementById("chat_list_space");
    try {
        const childElements = chat_list.children;

        for (let i = childElements.length - 1; i >= 0; i--) {
            chat_list.removeChild(childElements[i]);
        }
    } catch (error) {
        console.log("error : ");
        console.log(error);
    }
});



writting_button.addEventListener('click', (event) => {
    const text = writting_input.value;
    const copiedText = text;
    writting_input.value = '';

    var destinary = "";
    if (new_chat_mode) {
        destinary = new_chat_receiver_input.value;
        new_chat_receiver_input.value = "";
    } else {
        destinary = selected_conv;
    }
    const apiUrlSendMsg = 'http://localhost:4568/chat/user/' + destinary + '?message=' + copiedText;
    const headersSendMsg = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };

    // Requête
    const requestOptionsSendMsg = {
        method: 'POST',
        headers: headersSendMsg,
    };

    // Appel de l'API en utilisant fetch
    fetch(apiUrlSendMsg, requestOptionsSendMsg)
        .then(response => {
            if (response.status==401) {
                reconnect_token_expire();
            }
            else if (!response.ok) {
                throw new Error('ERROR when request to api');
            }
            return response.json(); // Renvoie les données de la réponse sous forme de JSON
        })
        .catch(error => {
            // Gestion des erreurs
            console.error('Erreur:', error);
        });

    request_conv();

    onclick_on_conv_name(destinary);
});



window.onload = function () {

    // API CONNEXION
    const apiUrl1 = 'http://localhost:4568/user';
    const headers1 = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };

    // Requête
    const requestOptions1 = {
        method: 'GET',
        headers: headers1,
    };

    // Appel de l'API en utilisant fetch
    fetch(apiUrl1, requestOptions1)
        .then(response => {
            if (response.status==401) {
                reconnect_token_expire();
            }
            else if (!response.ok) {
                throw new Error('ERROR when request to api');
            }
            return response.json(); // Renvoie les données de la réponse sous forme de JSON
        })
        .then(data => {
            my_name = data["name"];
            my_mail = data["mail"];
        })
        .catch(error => {
            // Gestion des erreurs
            console.error('Erreur:', error);
        });


    request_conv();


}



function request_conv() {

    const conv_list = document.getElementById("conv_list_space");
    try {
        const childElements = conv_list.children;

        for (let i = childElements.length - 1; i >= 0; i--) {
            conv_list.removeChild(childElements[i]);
        }
    } catch (error) {
        console.log("error : ");
        console.log(error);
    }

    // API CONNEXION
    const apiUrl = 'http://localhost:4568/chats/user';
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
            if (response.status==401) {
                reconnect_token_expire();
            }
            else if (!response.ok) {
                throw new Error('ERROR when request to api');
            }
            return response.json(); // Renvoie les données de la réponse sous forme de JSON
        })
        .then(data => {
            let user_list = [];

            data.forEach(chat => {
                if (my_mail == chat.userA) {
                    user_list.push(chat.userB);
                }
                else {
                    user_list.push(chat.userA);
                }

            });

            user_list.forEach(user => {
                const listItem = document.createElement("button");
                listItem.textContent = user;
                listItem.setAttribute("user_mail", user);
                conv_list.appendChild(listItem);
            })

            // Gestionnaire d'événements pour les éléments de la liste du calendrier
            conv_list.addEventListener("click", function (event) {
                selected_conv = event.target.getAttribute("user_mail");
                onclick_on_conv_name(selected_conv);

            });
        })
        .catch(error => {
            console.error('Unexpected error:', error);
        });
}



function onclick_on_conv_name(selected_conv) {
    remove_display_none_right_space();
    set_display_none_new_receiver_space();
    new_chat_mode = false;

    if (ws != null) {
        ws.close();
    }
    ws = new WebSocket('ws://127.0.0.1:4568/ws/chat/user/' + selected_conv + '?token=' + localStorage.getItem('token'));
    ws.onmessage = function (event) {
        data = JSON.parse(event.data)
        let lItem = document.createElement("p");
        lItem.textContent = data.msg;
        lItem.setAttribute("name", data.name);
        let c_list = document.getElementById("chat_list_space");
        c_list.appendChild(lItem);
    };


    // API CONNEXION
    const apiUrl2 = 'http://localhost:4568/chat/user/' + selected_conv;
    const headers2 = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };

    // Requête
    const requestOptions2 = {
        method: 'GET',
        headers: headers2,
    };

    // Appel de l'API en utilisant fetch
    fetch(apiUrl2, requestOptions2)
        .then(response => {
            if (response.status==401) {
                reconnect_token_expire();
            }
            else if (!response.ok) {
                throw new Error('ERROR when request to api');
            }
            return response.json(); // Renvoie les données de la réponse sous forme de JSON
        })
        .then(data => {
            // console.log(data);
            messages = data["messages"];

            const chat_list = document.getElementById("chat_list_space");
            console.log(chat_list);
            try {
                const childElements = chat_list.children;

                for (let i = childElements.length - 1; i >= 0; i--) {
                    chat_list.removeChild(childElements[i]);
                }
            } catch (error) {
                console.log("error : ");
                console.log(error);
            }

            messages.forEach(msg => {
                const message_div = document.createElement("div");
                message_div.className = "chat_message";
                const listItem = document.createElement("p"); // Utilisez des boutons au lieu de list items
                listItem.textContent = msg.message;
                listItem.setAttribute("name", msg.name);
                message_div.appendChild(listItem);
                chat_list.appendChild(message_div);
            })

        })
        .catch(error => {
            // Gestion des erreurs
            console.log("error : ");
            console.log(error);
        });
}



function remove_display_none_right_space() {
    document.getElementById("right_space").style.display = "block";
}


function remove_display_none_new_receiver_space() {
    document.getElementById("new_chat_receiver_space").style.display = "block";
}


function set_display_none_new_receiver_space() {
    document.getElementById("new_chat_receiver_space").style.display = "none";
}

function reconnect_token_expire() {
    window.location.href = window.location.origin + '/login.html';
}