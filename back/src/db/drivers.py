import logging
import os
import time
from typing import Any, List, Tuple, Union

import mysql.connector
from dotenv import dotenv_values
from fastapi import HTTPException


class DB:
    __instance = None

    @staticmethod
    def __new__(cls, *args, **kwargs):
        if DB.__instance is None:
            DB.__instance = super(DB, cls).__new__(cls, *args, **kwargs)

            config = dotenv_values("/.env")
            DB.__instance.conn = None
            for _ in range(10):
                try:
                    conn = mysql.connector.connect(
                        host="gigachat_database",
                        user=config["SQL_USER"],
                        passwd=config["SQL_PASSWORD"],
                        database=config["SQL_DATABASE"],
                    )
                    DB.__instance.conn = conn
                    break
                except Exception as e:
                    logging.warning(f"Error connecting to DB: {e}")
                    time.sleep(1)

            if DB.__instance.conn is None:
                logging.critical("Can't connect to DB")
                exit(1)
            logging.info("Connected to DB")
        return DB.__instance

    def reload_driver(self):
        logging.error("Creating new connection")
        self.conn = mysql.connector.connect(
            host="licence_database",
            user="root",
            passwd=os.getenv("SQL_ROOTPASSWORD"),
            database=os.getenv("SQL_DATABASE"),
        )
        self.last_conn = time.time()

    def check_connection(self):
        try:
            self.conn.cursor(prepared=True)
        except Exception as e:
            logging.error(f"Error with connection: {e}")
            self.reload_driver()

    def get_cursor(self):
        self.check_connection()
        return self.conn.cursor(prepared=True)

    def commit(self, cursor=None):
        try:
            if cursor is not None:
                cursor.close()
            self.conn.commit()

        except Exception as e:
            logging.critical(f"Bad request: {e}")
            raise HTTPException(400)

    def execute(
        self, request: str, values: List[str] = (), keys: List[str] = None
    ) -> List[List[str]]:
        cursor = self.get_cursor()
        cursor.execute(request, values)

        if keys is not None:
            tab = []
            for values in cursor:
                obj = {}
                for i, val in enumerate(values):
                    obj[keys[i]] = str(val)
                tab.append(obj)
        else:
            tab = [[value for value in values] for values in cursor]

        self.commit(cursor)
        return tab

    def execute_single(
        self, query: str, values: Tuple = None, keys: Tuple = None
    ) -> Union[List[Any], None]:
        data = self.execute(query, values, keys)
        if len(data) > 0:
            return data[0]
        return None
