"""DB module
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.session import Session
from sqlalchemy.exc import InvalidRequestError
from sqlalchemy.exc import NoResultFound
from sqlalchemy.sql.expression import func

from models.user import User
from models.question import Question


class DB:
    """DB class
    """

    def __init__(self) -> None:
        """Initialize a new DB instance
        """
        self._engine = create_engine("mysql+pymysql://ayrton:aaa@localhost/movietrivia?charset=utf8mb4", echo=False)
        # Base.metadata.drop_all(self._engine)
        # Base.metadata.create_all(self._engine)
        self.__session = None

    @property
    def _session(self) -> Session:
        """Memoized session object
        """
        if self.__session is None:
            DBSession = sessionmaker(bind=self._engine)
            self.__session = DBSession()
        return self.__session

    def add_user(self, username: str, hashed_password: str) -> User:
        """Adds a new user to database"""
        new_user = User(
            username=username,
            hashed_password=hashed_password
            )

        self._session.add(new_user)
        self._session.commit()

        return new_user

    def find_user_by(self, **kwargs) -> User:
        """ Returns matching row in table from kwargs arguments """

        try:
            user = self._session.query(User).filter_by(**kwargs).first()
        except TypeError:
            raise InvalidRequestError
        if user is None:
            raise NoResultFound
        return user

    def update_user(self, user_id: int, **kwargs) -> None:
        """Updates a user based on kwargs values"""
        try:
            user = self.find_user_by(id=user_id)
            for key, value in kwargs.items():
                setattr(user, key, value)
        except Exception:
            raise Exception

        self._session.commit()
        return None

    def fetch_question(self) -> list:
        """method to retrieve random question
        for using in a trivia match"""
        query = self._session.query(Question)\
                    .order_by(func.rand()).limit(1)
        question = query.one()
        return question.to_dict()
