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

    from sqlalchemy import and_
    from sqlalchemy.sql import func

    # Get latest submission for each question
    latest_submission_subquery = db.query(
        models.Submission.question_id,
        func.max(models.Submission.id).label('max_id')
    ).filter(
        models.Submission.user_id == user_id
    ).group_by(models.Submission.question_id).subquery()

    latest_submissions = db.query(models.Submission).join(
        latest_submission_subquery,
        and_(
            models.Submission.question_id == latest_submission_subquery.c.question_id,
            models.Submission.id == latest_submission_subquery.c.max_id
        )
    ).all()

    # Get question IDs where latest submission is incorrect
    wrong_ids = [s.question_id for s in latest_submissions if s.is_correct == False]

    if not wrong_ids:
        return []

    # Fetch questions
    query = db.query(models.Question).filter(models.Question.id.in_(wrong_ids))
    if domain:
        query = query.filter(models.Question.domain == domain)

    questions = query.all()

    # Build result
    result = []
    for q in questions:
        result.append(schemas.QuestionListResponse(
            id=q.id,
            question=q.question,
            domain=q.domain,
            is_solved=False,
            last_submission_correct=False  # Always False for wrong questions
        ))
    return result
