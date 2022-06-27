#!/usr/bin/env python3
""" Authentication """

import bcrypt
from models.db import DB
from models.user import User
from typing import Union

from sqlalchemy.exc import NoResultFound
from uuid import uuid4


def _hash_password(password: str) -> bytes:
    """used for password hashing"""
    salt = bcrypt.gensalt()

    byte_pwd = password.encode('utf-8')
    hashed_pwd = bcrypt.hashpw(byte_pwd, salt)

    return hashed_pwd


def _generate_uuid() -> str:
    """Generates a new uuid"""
    return str(uuid4())


class Auth:
    """Auth class to interact with the authentication database.
    """

    def __init__(self):
        self._db = DB()

    def register_user(self, username: str, password: str) -> User:
        """Saves a user with username and password to DB"""
        try:
            self._db.find_user_by(username=username)
            raise ValueError(f"User {username} already exists")
        except NoResultFound:
            hashed_pwd = _hash_password(password)
            return self._db.add_user(username=username, hashed_password=hashed_pwd.decode())

    def valid_login(self, username: str, password: str) -> bool:
        """Login validation from username and pwd"""
        try:
            user = self._db.find_user_by(username=username)
            return bcrypt.checkpw(password.encode('utf-8'),
                                  user.hashed_password.encode('utf-8'))
        except NoResultFound:
            return False

    def create_session(self, username: str) -> Union[str, None]:
        """Creates new session for a user"""
        try:
            user = self._db.find_user_by(username=username)
            session_id = _generate_uuid()
            self._db.update_user(user.id, session_id=session_id)
            return session_id
        except NoResultFound:
            return None

    def get_user_from_session_id(self, session_id: str) -> Union[User, None]:
        """gets an instance of User from session id"""
        if not session_id:
            return None
        try:
            user = self._db.find_user_by(session_id=session_id)
            return user
        except Exception:
            return None

    def destroy_session(self, user_id: int) -> None:
        """Destroys user's session"""
        try:
            self._db.update_user(user_id, session_id=None)
        except Exception:
            return None

    def get_reset_password_token(self, username: str) -> str:
        """returns a reset password token"""
        user = self._db.find_user_by(username=username)
        if not user:
            raise ValueError("wrong username")

        reset_token = _generate_uuid()
        self._db.update_user(user.id, reset_token=reset_token)

        return reset_token

    def update_password(self, reset_token: str, password: str) -> None:
        """Updates password"""
        try:
            user = self._db.find_user_by(reset_token=reset_token)
            hashed_pwd = _hash_password(password)
            self._db.update_user(user.id,
                                 hashed_password=hashed_pwd,
                                 reset_token=None)
        except Exception:
            raise ValueError("invalid reset token")
