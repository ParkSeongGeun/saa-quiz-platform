from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/tips", tags=["tips"])

@router.get("/", response_model=List[schemas.TipResponse])
def get_all_user_tips(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    tips = db.query(models.Tip).filter(models.Tip.user_id == user_id).all()
    return tips

@router.get("/{question_id}", response_model=schemas.TipResponse)
def get_tip(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    tip = db.query(models.Tip).filter(
        models.Tip.question_id == question_id,
        models.Tip.user_id == user_id
    ).first()
    
    if not tip:
        raise HTTPException(status_code=404, detail="Tip not found")
    return tip

@router.post("/", response_model=schemas.TipResponse)
def upsert_tip(
    tip_req: schemas.TipRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    
    db_tip = db.query(models.Tip).filter(
        models.Tip.question_id == tip_req.question_id,
        models.Tip.user_id == user_id
    ).first()
    
    if db_tip:
        db_tip.tip_text = tip_req.tip_text
    else:
        db_tip = models.Tip(
            user_id=user_id, 
            question_id=tip_req.question_id, 
            tip_text=tip_req.tip_text
        )
        db.add(db_tip)
    
    db.commit()
    db.refresh(db_tip)
    return db_tip

@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tip(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    tip = db.query(models.Tip).filter(
        models.Tip.question_id == question_id,
        models.Tip.user_id == user_id
    ).first()
    
    if not tip:
        raise HTTPException(status_code=404, detail="Tip not found")
    
    db.delete(tip)
    db.commit()
    return None
