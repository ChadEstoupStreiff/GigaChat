import time
from threading import Lock

import httpx
from dotenv import dotenv_values


class Shield:
    __instance = None

    @staticmethod
    def __new__(cls, *args, **kwargs):
        if Shield.__instance is None:
            Shield.__instance = super(Shield, cls).__new__(cls, *args, **kwargs)

            Shield.__instance.user_login_cooldown = {}
            Shield.__instance.captcha_tokens = {}

        return Shield.__instance

    def shield_login(self, user: str):
        if user in self.user_login_cooldown.keys():
            with self.user_login_cooldown[user]:
                time.sleep(3)
        else:
            self.user_login_cooldown[user] = Lock()

    def success_login(self, user: str):
        if user in self.user_login_cooldown.keys():
            del self.user_login_cooldown[user]

    async def verify_captcha(self, user: str, response) -> str:
        secret_key = dotenv_values("/.env")["CAPTCHA_SECRET"]
        recaptcha_server_url = "https://www.google.com/recaptcha/api/siteverify"
        data = {"secret": secret_key, "response": response}
        async with httpx.AsyncClient() as client:
            response = await client.post(recaptcha_server_url, data=data)
            result = response.json()
            print(result.get("success"))
            return result.get("success")

    def verify_captcha_token(self, user: str, token: str):
        if (
            user in self.captcha_tokens.keys()
            and self.captcha_tokens[user][0] == token
            and self.verify_captcha_token <= time.time() + 60
        ):
            del self.captcha_tokens[user]
            return True
        return False
