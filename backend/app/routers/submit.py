from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user
from typing import List, Optional

router = APIRouter(prefix="/submit", tags=["submit"])

@router.post("/", response_model=schemas.SubmissionResponse)
def submit_answer(
    submission: schemas.SubmissionRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    
    question = db.query(models.Question).filter(models.Question.id == submission.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # 해당 문제의 모든 정답 가져오기
    correct_options = db.query(models.Option).filter(
        models.Option.question_id == submission.question_id,
        models.Option.is_answer == True
    ).all()
    correct_labels = sorted([o.label for o in correct_options])
    
    # 사용자가 선택한 label들이 정답과 완전히 일치하는지 확인
    selected_labels = sorted(submission.selected_labels)
    is_correct = (selected_labels == correct_labels)
    
    # 제출 기록 저장
    new_submission = models.Submission(
        user_id=user_id,
        question_id=submission.question_id,
        selected_label=",".join(selected_labels),
        is_correct=is_correct
    )
    db.add(new_submission)
    db.commit()
    
    return schemas.SubmissionResponse(
        is_correct=is_correct,
        correct_labels=correct_labels,
        explanation=question.explanation
    )

@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def reset_question_progress(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    특정 문제의 풀이 기록을 삭제하여 'is_solved' 상태를 초기화합니다.
    """
    user_id = int(current_user["sub"])
    db.query(models.Submission).filter(
        models.Submission.user_id == user_id,
        models.Submission.question_id == question_id
    ).delete()
    db.commit()
    return None

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def reset_all_progress(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    사용자의 모든 풀이 기록을 삭제하여 전체 진행 상태를 초기화합니다.
    """
    user_id = int(current_user["sub"])
    db.query(models.Submission).filter(models.Submission.user_id == user_id).delete()
    db.commit()
    return None
