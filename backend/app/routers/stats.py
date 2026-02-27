from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/")
def get_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    
    total_questions = db.query(models.Question).count()
    bookmark_count = db.query(models.Flag).filter(models.Flag.user_id == user_id).count()
    
    # 정답/오답 통계
    stats = db.query(
        func.count(models.Submission.id).label("total_attempts"),
        func.sum(case((models.Submission.is_correct == True, 1), else_=0)).label("correct_attempts")
    ).filter(models.Submission.user_id == user_id).first()
    
    total_attempts = stats.total_attempts or 0
    correct_attempts = int(stats.correct_attempts or 0)
    accuracy = (correct_attempts / total_attempts * 100) if total_attempts > 0 else 0
    
    # 푼 문제 수
    solved_count = db.query(models.Submission.question_id).filter(
        models.Submission.user_id == user_id,
        models.Submission.is_correct == True
    ).distinct().count()
    
    # 오답 수
    wrong_subquery = db.query(models.Submission.question_id).filter(
        models.Submission.user_id == user_id,
        models.Submission.is_correct == False
    ).distinct().subquery()
    
    correct_subquery = db.query(models.Submission.question_id).filter(
        models.Submission.user_id == user_id,
        models.Submission.is_correct == True
    ).distinct().subquery()
    
    wrong_count = db.query(wrong_subquery.c.question_id).filter(
        ~wrong_subquery.c.question_id.in_(db.query(correct_subquery.c.question_id))
    ).count()
    
    # 도메인별 통계
    domain_totals = db.query(
        models.Question.domain,
        func.count(models.Question.id).label("total")
    ).group_by(models.Question.domain).all()
    
    domain_corrects = db.query(
        models.Question.domain,
        func.count(func.distinct(models.Question.id)).label("correct")
    ).join(models.Submission, models.Question.id == models.Submission.question_id).filter(
        models.Submission.user_id == user_id,
        models.Submission.is_correct == True
    ).group_by(models.Question.domain).all()
    
    correct_map = {d.domain: d.correct for d in domain_corrects}
    
    domain_progress = []
    for d in domain_totals:
        if not d.domain: continue
        total = d.total
        correct = correct_map.get(d.domain, 0)
        domain_progress.append({
            "name": d.domain,
            "total": total,
            "correct": correct,
            "progress": int((correct / total * 100) + 0.5) if total > 0 else 0
        })

    return {
        "total_questions": total_questions,
        "solved_count": solved_count,
        "accuracy": round(float(accuracy), 1),
        "wrong_count": wrong_count,
        "correct_count": solved_count,
        "bookmark_count": bookmark_count,
        "domain_progress": domain_progress
    }
