#!/usr/bin/env python3
""" Object representing the 'movietrivia' DB 'history' table"""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime

Base = declarative_base()


class History(Base):
    """History Class"""
    __tablename__ = 'history'

    id = Column(Integer, primary_key=True)
    uid = Column(Integer, nullable=False)
    username = Column(String(250), nullable=False)
    score = Column(Integer, nullable=False)
    playedAt = Column(DateTime, nullable=False)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
