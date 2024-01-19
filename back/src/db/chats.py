from typing import List, Union

from db.drivers import DB
from fastapi import HTTPException


def create_chat(userA: str, userB: str) -> bool:
    users = [userA, userB]
    users.sort()
    data = DB().execute(
        """INSERT INTO Chats
(userA, userB)
VALUES (%s,%s)""",
        (users[0], users[1]),
    )
    if data is not None:
        return data
    raise HTTPException(400, "Invalid variables")


def get_chat(userA: str, userB: str) -> Union[List, None]:
    users = [userA, userB]
    users.sort()
    return DB().execute_single(
        """SELECT chat_id, userA, userB FROM Chats WHERE userA=%s AND userB=%s""",
        (users[0], users[1]),
        keys=("chat_id", "userA", "userB"),
    )


def get_chats(user: str) -> Union[List, None]:
    return DB().execute(
        """SELECT chat_id, userA, userB FROM Chats WHERE userA=%s OR userB=%s""",
        (user, user),
        keys=("chat_id", "userA", "userB"),
    )


def create_message(chat_id: str, name: str, message: str, date: str):
    data = DB().execute(
        """INSERT INTO ChatMessages
(chat_id, name, message, date)
VALUES (%s,%s, %s, %s)""",
        (chat_id, name, message, date),
    )
    if data is not None:
        return data
    raise HTTPException(400, "Invalid variables")


def get_messages(chat_id: str) -> Union[List, None]:
    return DB().execute(
        """SELECT name, message, date FROM ChatMessages WHERE chat_id=%s""",
        (chat_id,),
        keys=("name", "message", "date"),
    )
