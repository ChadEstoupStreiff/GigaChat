import copy
import json
from datetime import datetime
from typing import Dict, List

from db.chats import create_chat, create_message, get_chat, get_chats, get_messages
from db.users import get_user_info
from fastapi import WebSocket, WebSocketDisconnect


class ConnectionManager:
    __instance = None

    @staticmethod
    def __new__(cls, *args, **kwargs):
        if ConnectionManager.__instance is None:
            ConnectionManager.__instance = super(ConnectionManager, cls).__new__(
                cls, *args, **kwargs
            )

            ConnectionManager.__instance.active_connections: Dict[
                str, List[WebSocket]
            ] = {}

        return ConnectionManager.__instance

    def get_connections(self, user):
        if user not in self.active_connections:
            self.active_connections[user] = []
        return self.active_connections[user]

    async def connect(self, user, websocket: WebSocket):
        await websocket.accept()
        self.get_connections(user).append(websocket)

    def disconnect(self, user, websocket: WebSocket):
        self.get_connections(user).remove(websocket)

    async def broadcast(self, user, message: str):
        for connection in copy.copy(self.get_connections(user)):
            try:
                await connection.send_text(message)
            except WebSocketDisconnect:
                self.disconnect(user, connection)


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

    async def register_message(
        self, user: str, target: str, name: str, message: str
    ) -> bool:
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
            await ConnectionManager().broadcast(target, message_json)
            await ConnectionManager().broadcast(user, message_json)
        except Exception as _:
            pass
        return message

    async def register_socket(self, socket, user, target):
        if self.get_chat(user, target):
            await ConnectionManager().connect(user, socket)

            while True:
                try:
                    data = await socket.receive_text()
                    await self.register_message(
                        user, target, get_user_info(user)["name"], data
                    )
                except WebSocketDisconnect:
                    ConnectionManager().disconnect(user, socket)
                    break
        return None
