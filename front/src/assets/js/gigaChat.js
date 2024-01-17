let selected_conv = null


document.getElementById('profile-btn').addEventListener('click', function () {
    checkTokenAndRedirect();
    window.location.href = 'profile.html';
})

const writting_input = document.getElementById('writting_space_input')
const writting_button = document.getElementById('writting_space_button')

writting_button.addEventListener('click', (event) => {
    const text = writting_input.value;
    const copiedText = text;
    writting_input.value = '';
    console.log(copiedText);


    
    


                
                // // API CONNEXION
                // const apiUrl = 'http://localhost:4568/chats/user/'+selected_conv;
                // const headers = {
                //     'Content-Type': 'application/json',
                //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
                //     'message': copiedText
                // };

                // // Requête
                // const requestOptions = {
                //     method: 'POST',
                //     headers: headers,
                // };

                // // Appel de l'API en utilisant fetch
                // fetch(apiUrl, requestOptions)
                //     .then(response => {
                //         if (!response.ok) {
                //             throw new Error('ERROR when request to api');
                //         }
                //         return response.json(); // Renvoie les données de la réponse sous forme de JSON
                //     })
                //     .then(data => {
                //         let user_list = [];
                //         console.log(data);
                //     })
                //     .catch(error => {
                //         // Gestion des erreurs
                //         console.error('Erreur:', error);
                //     });

 });



window.onload = function () {
    let my_name = "";
    let my_mail = "";


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
            if (!response.ok) {
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
            if (!response.ok) {
                throw new Error('ERROR when request to api');
            }
            return response.json(); // Renvoie les données de la réponse sous forme de JSON
        })
        .then(data => {
            let user_list = [];
            // console.log(data);
            data.forEach(chat => {
                if (my_mail == chat.userA) {
                    // console.log(chat.userB);
                    user_list.push(chat.userB);
                }
                else{
                    // console.log(chat.userA);
                    user_list.push(chat.userA);
                }
                
            });

            const conv_list = document.getElementById("conv_list_space");
            user_list.forEach(user => {
                const listItem = document.createElement("button"); // Utilisez des boutons au lieu de list items
                listItem.textContent = user;
                listItem.setAttribute("user_mail", user);
                conv_list.appendChild(listItem);
            })

            // Gestionnaire d'événements pour les éléments de la liste du calendrier
            conv_list.addEventListener("click", function (event) {


                // // Create WebSocket connection.
                // const socket = new WebSocket('http://localhost:4568/chats/user/'+selected_conv);

                // // // Connection opened
                // // socket.addEventListener("open", (event) => {
                // // socket.send("Hello Server!");
                // // });

                // // Listen for messages
                // socket.addEventListener("message", (event) => {
                //     console.log("Message from server ", event.data);
                // });

                var ws = new WebSocket('ws://127.0.0.1:4568/ws/chat/user/'+selected_conv + '?token=' + localStorage.getItem('token'));
                ws.onmessage = function(event) {
                    console.log("Message from server ", event.data);
                };

                
                selected_conv = event.target.getAttribute("user_mail");
                // console.log(selected_conv);
                
                // API CONNEXION
                const apiUrl2 = 'http://localhost:4568/chat/user/'+selected_conv;
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
                        if (!response.ok) {
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
                            const listItem = document.createElement("p"); // Utilisez des boutons au lieu de list items
                            listItem.textContent = msg.message;
                            listItem.setAttribute("name", msg.name);
                            chat_list.appendChild(listItem);
                        })

                                })
                    .catch(error => {
                        // Gestion des erreurs
                        console.log("error : ");
                        console.log(error);
                    });


            });
        })
        .catch(error => {
            // Gestion des erreurs
            console.error('Erreur:', error);
        });
}
