from typing import Any, Dict, Union

from auth.auth_bearer import JWTBearer
from auth.users import (
    check_user,
    encrypt,
    get_token,
    get_user_id,
    get_user_login_info,
    register_user,
)
from db.users import delete_user, get_user_info, update_user
from fastapi import Depends, FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from models.dm_chat import DMChatManager
from security import Shield

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# AUTH
@app.get("/auth", tags=["auth"])
async def endpoint_auth_info(
    token: str = Depends(JWTBearer()),
) -> Union[Dict[str, Any], None]:
    return get_user_login_info(token)


@app.post("/auth", tags=["auth"])
async def endpoint_auth_login(user_mail: str, user_password: str) -> Union[str, None]:
    Shield().shield_login(user_mail)
    if check_user(user_mail, user_password):
        Shield().success_login(user_mail)
        return get_token(user_mail)
    raise HTTPException(403, "Invalid credentials")


# user


@app.get("/user", tags=["user"])
async def endpoint_user_login_info(
    token: str = Depends(JWTBearer()),
) -> Union[Dict[str, Any], None]:
    return get_user_info(get_user_id(token))


@app.post("/user", tags=["user"])
async def endpoint_create_user(
    user_mail: str, user_password: str, user_name: str, user_confirm_password: str, recaptcha_response: str
) -> str:
    if await Shield().verify_captcha(user_mail, recaptcha_response):
        return register_user(user_mail, user_password, user_name, user_confirm_password)
    raise HTTPException(403, "Invalid captcha")


@app.put("/user", tags=["user"])
async def endpoint_update_user(
    user_mail: str = None,
    user_password: str = None,
    user_name: str = None,
    token: str = Depends(JWTBearer()),
):
    if user_password is not None:
        user_password = encrypt(user_password)
    return update_user(get_user_id(token), user_mail, user_password, user_name)


@app.delete("/user", tags=["user"])
async def endpoint_delete_user(token: str = Depends(JWTBearer())):
    return delete_user(get_user_id(token))


# Chat


@app.get("/chat/user/{target}", tags=["chat"])
async def chat_user(target: str, token: str = Depends(JWTBearer())) -> None:
    if get_user_info(target) is not None:
        user = get_user_id(token)
        return DMChatManager().get_chat(user, target)
    return None


@app.get("/chats/user/", tags=["chat"])
async def chats_user(token: str = Depends(JWTBearer())) -> None:
    user = get_user_id(token)
    return DMChatManager().get_chats(user)


@app.post("/chat/user/{target}", tags=["chat"])
async def chat_user_msg(
    target: str, message, token: str = Depends(JWTBearer())
) -> None:
    if get_user_info(target) is not None:
        user = get_user_id(token)
        name = get_user_info(user)["name"]
        return await DMChatManager().register_message(user, target, name, message)
    return None


@app.websocket("/ws/chat/user/{target}")
async def chat_user_ws(websocket: WebSocket, target: str, token: str):
    if get_user_info(target) is not None:
        await DMChatManager().register_socket(websocket, get_user_id(token), target)
    return None


# @app.get("/chat/group/{group_id}", tags=["chat"])
# async def chat_group(group_id: str, token: str = Depends(JWTBearer())) -> None:
#     return group_id

# @app.websocket("/chat/group/{group_id}")
# async def chat_group_ws(group_id: str, token: str = Depends(JWTBearer())) -> None:
#     return group_id
