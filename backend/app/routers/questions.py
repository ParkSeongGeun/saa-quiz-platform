from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user
from typing import List, Optional

router = APIRouter(prefix="/questions", tags=["questions"])

@router.get("/", response_model=List[schemas.QuestionListResponse])
def get_questions(
    skip: int = 0, limit: int = 1000,
    domain: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    
    query = db.query(models.Question)
    if domain:
        query = query.filter(models.Question.domain == domain)
        
    questions = query.offset(skip).limit(limit).all()
    
    solved_question_ids = {
        s.question_id for s in db.query(models.Submission)
        .filter(models.Submission.user_id == user_id, models.Submission.is_correct == True).all()
    }
    
    result = []
    for q in questions:
        result.append(schemas.QuestionListResponse(
            id=q.id,
            question=q.question,
            domain=q.domain,
            is_solved=q.id in solved_question_ids
        ))
    return result

@router.get("/{question_id}", response_model=schemas.QuestionDetailResponse)
def get_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    is_flagged = db.query(models.Flag).filter(
        models.Flag.user_id == user_id, 
        models.Flag.question_id == question_id
    ).first() is not None
    
    last_submission = db.query(models.Submission).filter(
        models.Submission.user_id == user_id,
        models.Submission.question_id == question_id
    ).order_by(models.Submission.answered_at.desc()).first()
    
    return schemas.QuestionDetailResponse(
        id=question.id,
        question=question.question,
        explanation=question.explanation,
        domain=question.domain,
        options=[schemas.OptionResponse.model_validate(o) for o in question.options],
        is_flagged=is_flagged,
        last_submission_correct=last_submission.is_correct if last_submission else None
    )
