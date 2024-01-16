
from threading import Lock
import time

class Shield:
    __instance = None

    @staticmethod
    def __new__(cls, *args, **kwargs):
        if Shield.__instance is None:
            Shield.__instance = super(Shield, cls).__new__(
                cls, *args, **kwargs
            )

            Shield.__instance.user_login_cooldown = {}

        return Shield.__instance


    def shield_login(self, user: str):
        if user in self.user_login_cooldown.keys():
            with self.user_login_cooldown[user]:
                time.sleep(3)
        else:
            self.user_login_cooldown[user] = Lock()
        