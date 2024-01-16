from typing import Dict, List, Union

from db.drivers import DB
from fastapi import HTTPException


def delete_user(user_mail: str) -> bool:
    data = DB().commit(
        """DELETE FROM Users
WHERE user_mail=%s""",
        (user_mail,),
    )
    if data is not None:
        return data
    raise HTTPException(400, "Can't delete user")


def update_user(
    old_user_mail: str,
    user_mail: str = None,
    user_password: bytes = None,
    user_name: str = None,
) -> bool:
    if user_password is not None:
        if not DB().commit(
            """UPDATE Users
SET user_password=%s WHERE user_mail=%s""",
            (user_password, old_user_mail),
        ):
            raise HTTPException(400, "Can't update user password")

    if user_name is not None:
        if not DB().commit(
            """UPDATE Users
SET user_name=%s WHERE user_mail=%s""",
            (user_name, old_user_mail),
        ):
            raise HTTPException(400, "Can't update user name")

    if user_mail is not None:
        if not DB().commit(
            """UPDATE Users
SET user_mail=%s WHERE user_mail=%s""",
            (user_mail, old_user_mail),
        ):
            raise HTTPException(400, "Can't update user")

    return True


def create_user(user_mail: str, user_password: bytes, user_name: str) -> bool:
    data = DB().commit(
        """INSERT INTO Users
(user_mail, user_password, user_name)
VALUES (%s,%s,%s)""",
        (user_mail, user_password, user_name),
    )
    if data is not None:
        return data
    raise HTTPException(400, "Invalid variables")


def get_user_password(email: str) -> Union[bytes, None]:
    data = DB().execute_single(
        """SELECT user_password FROM Users WHERE user_mail=%s""", (email,)
    )
    if data is not None:
        return data[0]
    raise HTTPException(400, "Invalid credentials")


def get_users() -> Union[List, None]:
    return DB().execute(
        """SELECT user_mail, user_name FROM Users""", keys=("mail", "name")
    )


def get_user_info(user_mail: str) -> Dict[str, str]:
    data = DB().execute_single(
        """SELECT user_mail, user_name FROM Users WHERE user_mail=%s""",
        (user_mail,),
        ("mail", "name"),
    )
    return data
