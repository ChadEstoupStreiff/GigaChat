import json
from datetime import datetime

from db.chats import create_chat, create_message, get_chat, get_chats, get_messages
from db.users import get_user_info
import logging


class DMChatManager:
    __instance = None

    @staticmethod
    def __new__(cls, *args, **kwargs):
        if DMChatManager.__instance is None:
            DMChatManager.__instance = super(DMChatManager, cls).__new__(
                cls, *args, **kwargs
            )

            DMChatManager.__instance.sockets = {}

        return DMChatManager.__instance

    def get_chat(self, user: str, target: str):
        chat = get_chat(user, target)
        if chat is None:
            create_chat(user, target)
            chat = get_chat(user, target)
        chat["messages"] = get_messages(chat["chat_id"])
        if chat["messages"] is None:
            chat["messages"] = []
        return chat

    def get_chats(self, user: str):
        return get_chats(user)

    async def register_message(self, user: str, target: str, name: str, message: str) -> bool:
        
        chat = self.get_chat(user, target)
        if chat is None:
            return False
        date = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

        create_message(chat["chat_id"], name, message, date)

        try:
            message = {
                "user": name,
                "msg": message,
                "date": date,
            }
            message_json = json.dumps(message)
            for s in self.get_sockets(target):
                await s.send_text(message_json)
            for s in self.get_sockets(user):
                await s.send_text(message_json)
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
            await socket.accept()

            while True:
                data = await socket.receive_text()
                await self.register_message(user, target, get_user_info(user)["name"], data)
        return None
