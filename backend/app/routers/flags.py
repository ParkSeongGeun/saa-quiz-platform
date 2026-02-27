from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/flags", tags=["flags"])

@router.get("/", response_model=List[schemas.QuestionListResponse])
def get_flags(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    flags = db.query(models.Flag).filter(models.Flag.user_id == user_id).all()
    question_ids = [f.question_id for f in flags]
    
    questions = db.query(models.Question).filter(models.Question.id.in_(question_ids)).all()
    
    # Check if each question is solved by user
    solved_question_ids = {
        s.question_id for s in db.query(models.Submission)
        .filter(models.Submission.user_id == user_id, models.Submission.is_correct == True).all()
    }
    
    result = []
    for q in questions:
        result.append(schemas.QuestionListResponse(
            id=q.id,
            question=q.question, # title -> question
            domain=q.domain,     # category -> domain
            is_solved=q.id in solved_question_ids
        ))
    return result

@router.post("/", response_model=schemas.FlagResponse)
def add_flag(
    flag_req: schemas.FlagRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    
    # Check if already flagged
    existing_flag = db.query(models.Flag).filter(
        models.Flag.user_id == user_id,
        models.Flag.question_id == flag_req.question_id
    ).first()
    
    if existing_flag:
        return existing_flag
    
    new_flag = models.Flag(user_id=user_id, question_id=flag_req.question_id)
    db.add(new_flag)
    db.commit()
    db.refresh(new_flag)
    return new_flag

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def remove_flag(
    flag_req: schemas.FlagRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    flag = db.query(models.Flag).filter(
        models.Flag.user_id == user_id,
        models.Flag.question_id == flag_req.question_id
    ).first()
    
    if not flag:
        raise HTTPException(status_code=404, detail="Flag not found")
    
    db.delete(flag)
    db.commit()
    return None
