from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)  # title -> question
    explanation = Column(Text)              # content -> explanation
    domain = Column(String(100))            # category -> domain
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    options = relationship("Option", back_populates="question")

class Option(Base):
    __tablename__ = "choices"  # options -> choices
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    label = Column(String(1))  # label 추가 (A, B, C, D...)
    content = Column(Text, nullable=False)
    is_answer = Column(Boolean, default=False) # is_correct -> is_answer
    question = relationship("Question", back_populates="options")

class Submission(Base):
    __tablename__ = "user_answers" # submissions -> user_answers
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    selected_label = Column(String(50)) # selected_option_id -> selected_label (increased to support multiple answers)
    is_correct = Column(Boolean)
    answered_at = Column(DateTime(timezone=True), server_default=func.now()) # submitted_at -> answered_at

class Flag(Base):
    __tablename__ = "user_flags" # flags -> user_flags
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    question_id = Column(Integer, ForeignKey("questions.id"), primary_key=True)
    flagged_at = Column(DateTime(timezone=True), server_default=func.now()) # created_at -> flagged_at

class Tip(Base):
    __tablename__ = "user_tips" # tips -> user_tips
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    question_id = Column(Integer, ForeignKey("questions.id"), primary_key=True)
    tip_text = Column(Text, nullable=False) # content -> tip_text
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
