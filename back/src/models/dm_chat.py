import json
from datetime import datetime
from typing import Any, Dict, Union

from db.users import get_user_info


class DMChatManager:
    __instance = None

    @staticmethod
    def __new__(cls, *args, **kwargs):
        if DMChatManager.__instance is None:
            DMChatManager.__instance = super(DMChatManager, cls).__new__(
                cls, *args, **kwargs
            )

            DMChatManager.__instance.chats = []
            DMChatManager.__instance.sockets = {}

        return DMChatManager.__instance

    def register_chat(self, user: str, target: str) -> Union[Dict[str, Any], None]:
        if user != target:
            chat = {
                "users": [user, target],
                "messages": [],
            }
            self.chats.append(chat)
            return chat
        return None

    def get_chat(self, user: str, target: str):
        for chat in self.chats:
            if user in chat["users"] and target in chat["users"]:
                return chat
        return self.register_chat(user, target)

    def register_message(self, user: str, target: str, name: str, message: str) -> bool:
        chat = self.get_chat(user, target)
        if chat is None:
            return False

        message = {
            "user": name,
            "msg": message,
            "date": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        }
        chat["messages"].append(message)

        message = json.dumps(message)
        try:
            map(lambda s: s.send_text(message), self.get_sockets(target))
            map(lambda s: s.send_text(message), self.get_sockets(user))
        except Exception as _:
            pass
        return message

    def get_sockets(self, user):
        if user not in self.sockets:
            self.sockets[user] = []
        sockets = self.sockets[user]
        # TODO check if websocket still active
        # for s in copy.copy(sockets):
        #     if s.application_state != WebSocketState.CONNECTED or s.client_state != WebSocketState.CONNECTED:
        #         sockets.remove(s)
        return sockets

    async def register_socket(self, socket, user, target):
        if self.get_chat(user, target):
            self.get_sockets(user).append(socket)

            while True:
                data = await socket.receive_text()
                self.register_message(user, target, get_user_info(user)["name"], data)
        socket.send_text("!!!CLOSING!!!")
        return None
