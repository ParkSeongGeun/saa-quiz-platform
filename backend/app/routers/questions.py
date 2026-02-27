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

    # ID 순서대로 정렬하여 반환
    questions = query.order_by(models.Question.id).offset(skip).limit(limit).all()

    # 1. 사용자가 한 번이라도 맞춘 문제 ID 세트 (is_solved 판단용)
    solved_question_ids = {
        s.question_id for s in db.query(models.Submission.question_id)
        .filter(models.Submission.user_id == user_id, models.Submission.is_correct == True).all()
    }

    # 2. 각 문제별 가장 최근 제출 기록 가져오기 (last_submission_correct 판단용)
    from sqlalchemy import func
    
    # 각 문제별 최대 ID (최신 기록) 찾기
    subquery = db.query(
        models.Submission.question_id,
        func.max(models.Submission.id).label("max_id")
    ).filter(models.Submission.user_id == user_id).group_by(models.Submission.question_id).subquery()
    
    latest_submissions = db.query(models.Submission.question_id, models.Submission.is_correct).join(
        subquery, models.Submission.id == subquery.c.max_id
    ).all()
    
    last_submission_map = {s.question_id: bool(s.is_correct) for s in latest_submissions}

    result = []
    for q in questions:
        # 해당 문제가 풀렸는지 여부: 맞춘 적이 있거나, 가장 최근 시도가 성공했거나
        is_solved = q.id in solved_question_ids
        last_correct = last_submission_map.get(q.id)
        
        result.append(schemas.QuestionListResponse(
            id=q.id,
            question=q.question,
            domain=q.domain,
            is_solved=is_solved,
            last_submission_correct=last_correct
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
    ).order_by(models.Submission.id.desc()).first()
    
    return schemas.QuestionDetailResponse(
        id=question.id,
        question=question.question,
        explanation=question.explanation,
        domain=question.domain,
        options=[schemas.OptionResponse.model_validate(o) for o in question.options],
        is_flagged=is_flagged,
        last_submission_correct=last_submission.is_correct if last_submission else None
    )
