import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, questions, submit, flags, tips, wrong
from .database import engine, Base
from dotenv import load_dotenv

# Load environment variables from .env or ENV_FILE
load_dotenv(os.getenv("ENV_FILE", ".env"))

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SAA Platform API")

# CORS settings
allowed_origin = os.getenv("ALLOWED_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(questions.router, prefix="/api")
app.include_router(submit.router, prefix="/api")
app.include_router(flags.router, prefix="/api")
app.include_router(tips.router, prefix="/api")
app.include_router(wrong.router, prefix="/api")

# ALB Health Check
@app.get("/health")
def health_check():
    return {"status": "ok"}
