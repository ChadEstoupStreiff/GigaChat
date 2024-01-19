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

    if (copiedText.trim() == "") return; //Ne peut pas envoyer de messages vides

    //API Envoie le message à un utilisateur
    const apiUrlSendMsg = 'https://gigachatapi.chades.fr/chat/user/' + destinary + '?message=' + copiedText;
    const headersSendMsg = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };
    const requestOptionsSendMsg = {
        method: 'POST',
        headers: headersSendMsg,
    };
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
            console.error('Erreur:', error);
        });

    request_conv();

    onclick_on_conv_name(destinary);
});

document.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        writting_button.click();
    }
});

window.onload = function () {

    // API CONNEXION
    const apiUrl1 = 'https://gigachatapi.chades.fr/user';
    const headers1 = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };
    const requestOptions1 = {
        method: 'GET',
        headers: headers1,
    };
    fetch(apiUrl1, requestOptions1)
        .then(response => {
            if (response.status==401) {
                reconnect_token_expire();
            }
            else if (!response.ok) {
                throw new Error('ERROR when request to api');
            }
            return response.json();
        })
        .then(data => {
            my_name = data["name"];
            my_mail = data["mail"];
        })
        .catch(error => {
            console.error('Erreur:', error);
        });

    request_conv();

}

function request_conv() {
    // API récupération des conversations 
    const apiUrl = 'https://gigachatapi.chades.fr/chats/user/';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };
    const requestOptions = {
        method: 'GET',
        headers: headers,
    };
    fetch(apiUrl, requestOptions)
        .then(response => {
            if (response.status==401) {
                reconnect_token_expire();
            }
            else if (!response.ok) {
                throw new Error('ERROR when request to api');
            }
            return response.json();
        })
        .then(data => {
            const conv_btns = conv_list.children;
            let user_list = [];
            let user_list_btn = [];

            for (const conv of conv_btns) {
                user_list_btn.push(conv.getAttribute("user_mail"));
            }

            data.forEach(chat => {
                if (my_mail == chat.userA) {
                    user_list.push(chat.userB);
                }
                else {
                    user_list.push(chat.userA);
                }
            });

            user_list.forEach(user => {
                if (!user_list_btn.includes(user)) {
                    const listItem = document.createElement("button");
                    listItem.textContent = user;
                    listItem.setAttribute("user_mail", user);
                    conv_list.appendChild(listItem);
                }
            })

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
    ws = new WebSocket('wss://gigachatapi.chades.fr/ws/chat/user/' + selected_conv + '?token=' + localStorage.getItem('token'));
    ws.onmessage = function (event) {
        data = JSON.parse(event.data)
        let lItem = document.createElement("p");
        lItem.textContent = data.msg;
        lItem.setAttribute("name", data.name);
        let c_list = document.getElementById("chat_list_space");
        c_list.appendChild(lItem);
    };


    // API CONNEXION
    const apiUrl2 = 'https://gigachatapi.chades.fr/chat/user/' + selected_conv;
    const headers2 = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };
    const requestOptions2 = {
        method: 'GET',
        headers: headers2,
    };
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
            try {
                const childElements = chat_list.children;

                for (let i = childElements.length - 1; i >= 0; i--) {
                    chat_list.removeChild(childElements[i]);
                }
            } catch (error) {
                console.log("error : " + error);
            }

            messages.forEach(msg => {
                /*
                const message_div = document.createElement("div");
                message_div.className = "chat_message";
                const listItem = document.createElement("p"); // Utilisez des boutons au lieu de list items
                listItem.textContent = msg.message;
                listItem.setAttribute("name", msg.name);
                message_div.appendChild(listItem);
                chat_list.appendChild(message_div);
                */
                const listItem = document.createElement("p");
                
                listItem.textContent = msg.message;
                if(msg.name == my_name){
                    listItem.setAttribute("class", "me");
                }else{
                    listItem.setAttribute("class", "you");
                }
                chat_list.appendChild(listItem);
            })

        })
        .catch(error => {
            console.log("error : " + error);
        });
    
    // Supposons que "chatListSpace" est l'ID de ta div
    var chatListSpace = document.getElementById('chat_list_space');

    // Fait défiler la div vers le bas
    chatListSpace.scrollTop = chatListSpace.scrollHeight;

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