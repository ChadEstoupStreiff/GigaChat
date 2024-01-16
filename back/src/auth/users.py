import time
from typing import Dict

import bcrypt
from auth.auth_handler import decode_jwt, sign_jwt
from db.users import create_user, get_user_password
from dotenv import dotenv_values
from fastapi import HTTPException


def encrypt(text: str) -> bytes:
    config = dotenv_values("/.env")
    return bcrypt.hashpw(
        text.encode(), bcrypt.gensalt(rounds=int(config["SALT_LENGTH"]))
    )


def get_token(mail: str) -> str:
    return sign_jwt(mail)


def is_mail(mail: str) -> bool:
    splitted: list = mail.split("@")
    if len(splitted) == 2 and len(splitted[0]) > 0 and len(splitted[1]) > 2:
        splitted_domain: list = splitted[1].split(".")
        return (
            len(splitted_domain) == 2
            and len(splitted_domain[0]) > 0
            and len(splitted_domain[1]) > 2
        )
    return False


def register_user(user_mail: str, user_password: str, user_name: str) -> str:
    user_password = encrypt(user_password)
    if is_mail(user_mail):
        try:
            if create_user(user_mail, user_password, user_name):
                return get_token(user_mail)
        except Exception as e:
            import logging
            logging.critical(e)
            raise HTTPException(
                400,
                detail=f"{user_mail} can't be registered. Can already be in use by another user.",
            )
    else:
        raise HTTPException(400, detail=f"{user_mail} is not a mail")


def check_user(user_mail: str, user_password: str) -> bool:
    time.sleep(0.5)
    user_encrypted_password = get_user_password(user_mail)
    return user_encrypted_password is not None and bcrypt.checkpw(
        user_password.encode(), bytes(user_encrypted_password)
    )


def get_user_login_info(token: str) -> Dict[str, str]:
    return decode_jwt(token)


def get_user_id(token: str) -> str:
    return get_user_login_info(token)["user_id"]
