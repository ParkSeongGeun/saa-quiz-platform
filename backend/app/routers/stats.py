from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user
from typing import List, Dict

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/")
def get_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    
    # 1. 총 문제 수
    total_questions = db.query(models.Question).count()
    
    # 2. 풀이 완료 (한 번이라도 맞춘 문제)
    solved_count = db.query(models.Submission).filter(
        models.Submission.user_id == user_id,
        models.Submission.is_correct == True
    ).distinct(models.Submission.question_id).count()
    
    # 3. 정답 문제 수 (중복 제외)
    correct_count = solved_count
    
    # 4. 오답 문제 수 (틀렸고 아직 맞추지 못한 문제)
    incorrect_ids = {
        s.question_id for s in db.query(models.Submission)
        .filter(models.Submission.user_id == user_id, models.Submission.is_correct == False).all()
    }
    correct_ids = {
        s.question_id for s in db.query(models.Submission)
        .filter(models.Submission.user_id == user_id, models.Submission.is_correct == True).all()
    }
    wrong_count = len(incorrect_ids - correct_ids)
    
    # 5. 북마크 수
    bookmark_count = db.query(models.Flag).filter(models.Flag.user_id == user_id).count()
    
    # 6. 정답률 계산
    total_attempts = db.query(models.Submission).filter(models.Submission.user_id == user_id).count()
    correct_attempts = db.query(models.Submission).filter(
        models.Submission.user_id == user_id,
        models.Submission.is_correct == True
    ).count()
    
    accuracy = (correct_attempts / total_attempts * 100) if total_attempts > 0 else 0
    
    # 7. 영역별 진행률
    domains = db.query(models.Question.domain, func.count(models.Question.id)).group_by(models.Question.domain).all()
    domain_progress = []
    
    for domain_name, total_in_domain in domains:
        if not domain_name: continue
        
        solved_in_domain = db.query(models.Submission).join(models.Question).filter(
            models.Submission.user_id == user_id,
            models.Submission.is_correct == True,
            models.Question.domain == domain_name
        ).distinct(models.Submission.question_id).count()
        
        domain_progress.append({
            "name": domain_name,
            "total": total_in_domain,
            "correct": solved_in_domain,
            "progress": Math_round(solved_in_domain / total_in_domain * 100) if total_in_domain > 0 else 0
        })

    return {
        "total_questions": total_questions,
        "solved_count": solved_count,
        "accuracy": round(accuracy, 1),
        "wrong_count": wrong_count,
        "correct_count": correct_count,
        "bookmark_count": bookmark_count,
        "domain_progress": domain_progress
    }

def Math_round(val):
    return int(val + 0.5)
