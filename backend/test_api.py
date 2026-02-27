import os
import requests
from dotenv import load_dotenv

load_dotenv("backend/.env")

# Start backend temporarily if not running, wait a bit
import subprocess
import time

proc = subprocess.Popen(["python3", "-m", "app.main"], cwd="backend", env=os.environ.copy())
time.sleep(2)

try:
    # 1. Register a test user
    print("Registering user...")
    res = requests.post("http://localhost:8000/api/register", json={
        "username": "testuser",
        "password": "testpassword",
        "email": "test@example.com"
    })
    
    # 2. Login
    print("Logging in...")
    res = requests.post("http://localhost:8000/api/login", json={
        "username": "testuser",
        "password": "testpassword"
    })
    token = res.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Submit an answer to Q1
    print("Submitting answer...")
    res = requests.post("http://localhost:8000/api/submit/", json={
        "question_id": 1,
        "selected_labels": ["B"]
    }, headers=headers)
    print("Submit Response:", res.status_code, res.text)

    # 4. Fetch questions to see if it is solved
    print("Fetching questions...")
    res = requests.get("http://localhost:8000/api/questions/", headers=headers)
    questions = res.json()
    q1 = next((q for q in questions if q["id"] == 1), None)
    print("Q1 status:", "is_solved:", q1.get("is_solved"), "last_submission_correct:", q1.get("last_submission_correct"))

finally:
    proc.terminate()
