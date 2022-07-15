#!/usr/bin/env python3
""" Object representing the 'movietrivia' DB 'questions' table"""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String

Base = declarative_base()


class Question(Base):
    """Question Class"""
    __tablename__ = 'questions'

    id = Column(Integer, primary_key=True)
    q = Column(String(250), nullable=False)
    a = Column(String(250), nullable=False)
    type = Column(String(50), nullable=True)
    opt = Column(String(250), nullable=True)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
