from typing import Union, Dict, Any

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from auth.auth_bearer import JWTBearer
from auth.users import register_user, check_user, get_token, get_user_id, get_user_login_info, encrypt, disconnect_user
from db.users import get_user_info, delete_user, update_user

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
async def endpoint_user_login_info(token: str = Depends(JWTBearer())) -> Union[Dict[str, Any], None]:
    return get_user_login_info(token)


@app.post("/auth", tags=["auth"])
async def endpoint_user_login(user_mail: str, user_password: str) -> Union[str, None]:
    if check_user(user_mail, user_password):
        return get_token(user_mail)
    return None


# user


@app.get("/user", tags=["user"])
async def endpoint_user_login_info(token: str = Depends(JWTBearer())) -> Union[Dict[str, Any], None]:
    return get_user_info(get_user_id(token))


@app.post("/user", tags=["user"])
async def endpoint_create_user(user_mail: str, user_password: str, user_name: str):
    return register_user(user_mail, user_password, user_name)


@app.put("/user", tags=["user"])
async def endpoint_update_user(user_mail: str = None, user_password: str = None, user_name: str = None, token: str = Depends(JWTBearer())):
    if user_password is not None:
        user_password = encrypt(user_password)
    return update_user(get_user_id(token), user_mail, user_password, user_name)


@app.delete("/user", tags=["user"])
async def endpoint_delete_user(token: str = Depends(JWTBearer())):
    return delete_user(get_user_id(token))