"""DB module
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.session import Session
from sqlalchemy.exc import InvalidRequestError
from sqlalchemy.exc import NoResultFound

from models.user import User
from models.question import Question
from models.history import History

from datetime import datetime
import random


class DB:
    """DB class
    """

    def __init__(self) -> None:
        """Initialize a new DB instance
        """
        self._engine = create_engine("mysql+pymysql://ayrton:aaa@database:3306/movietrivia?charset=utf8mb4", echo=False)
        User.metadata.create_all(self._engine)
        Question.metadata.create_all(self._engine)
        History.metadata.create_all(self._engine)
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

    def insert_data(self, filename: str) -> bool:
        try:
            with open(filename, 'r') as f:
                for line in f.readlines()[:-1]:
                    qa = line.split('?')
                    new_question = Question(
                        q=qa[0] + '?',
                        a=qa[1].split(',')[0].strip(),
                        type='mul',
                        opt=qa[1][:-1].strip()
                    )
                    self._session.add(new_question)
                self._session.commit()
                return True
        except Exception as e:
            print(e)
        return False

    def fetch_question(self, question_id: int) -> list:
        """method to retrieve random question
        for using in a trivia match"""
        question = self._session.query(Question).get(question_id)
        question = question.to_dict()
        del question["a"]
        question['opt'] = [op.strip() for op in question['opt'].split(',')]
        random.shuffle(question['opt'])
        return question

    def get_match_score(self, answers: list) -> dict:
        """method to get the total score of one played match"""
        score: int = 0
        stats = []
        for answer in answers:
            question = self._session.query(Question).get(answer[1])
            if question.a.strip() == answer[0]:
                score += 50
                stats.append(True)
            else:
                score -= 10
                stats.append(False)
        return {
            "score": score if score > 0 else 0,
            "stats": stats
        }

    def save_match(self, uid: int, username: str, score: int) -> bool:
        """method to save a match played to history"""
        try:
            match = History(
                uid=uid,
                username=username,
                score=score,
                playedAt=datetime.now()
            )
            self._session.add(match)
            self._session.commit()
            return True
        except Exception as e:
            print(e)
        return False

    def scoreboard(self) -> list:
        """method to retrieve history of matches all time"""
        query = self._session.query(History)

        history = query.all()
        return [match.to_dict() for match in history]
