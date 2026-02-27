from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user
from typing import List, Optional

router = APIRouter(prefix="/wrong", tags=["wrong"])

@router.get("/", response_model=List[schemas.QuestionListResponse])
def get_wrong_questions(
    domain: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    
    # 오답 목록 (틀린 적이 있고, 맞춘 적은 없는 문제)
    incorrect_question_ids = {
        s.question_id for s in db.query(models.Submission)
        .filter(models.Submission.user_id == user_id, models.Submission.is_correct == False).all()
    }
    
    correct_question_ids = {
        s.question_id for s in db.query(models.Submission)
        .filter(models.Submission.user_id == user_id, models.Submission.is_correct == True).all()
    }
    
    wrong_ids = incorrect_question_ids - correct_question_ids
    
    query = db.query(models.Question).filter(models.Question.id.in_(wrong_ids))
    if domain:
        query = query.filter(models.Question.domain == domain)
        
    questions = query.all()
    
    result = []
    for q in questions:
        result.append(schemas.QuestionListResponse(
            id=q.id,
            question=q.question,
            domain=q.domain,
            is_solved=False
        ))
    return result
