from typing import Dict

import bcrypt
from auth.auth_handler import decode_jwt, sign_jwt
from db.users import create_user, get_user_password
from dotenv import dotenv_values
import platform
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


def register_user(user_mail: str, user_password: str, user_name: str, user_confirm_password: str) -> str:
    if is_mail(user_mail):
        if is_password_confirmed(user_password, user_confirm_password):
            user_password = encrypt(user_password)
            if create_user(user_mail, user_password, user_name):
                return get_token(user_mail)
        else:
            raise HTTPException(400, detail="The password and confirmation are different")
    else:
        raise HTTPException(400, detail=f"{user_mail} is not a mail")


def check_user(user_mail: str, user_password: str) -> bool:
    user_encrypted_password = get_user_password(user_mail)
    if platform.machine() in ['arm', 'arm64', 'aarch64']:  # Add other ARM-related identifiers if needed
        # ARM architecture - encode
        user_encrypted_password = user_encrypted_password.encode("ASCII", "utf8")
    return user_encrypted_password is not None and bcrypt.checkpw(
        user_password.encode(), bytes(user_encrypted_password)
    )


def get_user_login_info(token: str) -> Dict[str, str]:
    return decode_jwt(token)


def get_user_id(token: str) -> str:
    return get_user_login_info(token)["user_id"]


def is_password_confirmed(password: str, confirm_password: str) -> bool:
    isConfirmed = False
    if password == confirm_password:
        isConfirmed = True
    return isConfirmed