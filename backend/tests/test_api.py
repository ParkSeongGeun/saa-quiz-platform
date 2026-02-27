import pytest
from app import models

# --- Helper function for auth ---
def get_auth_header(client, username, password, email):
    # Register
    client.post("/api/register", json={"username": username, "password": password, "email": email})
    # Login
    response = client.post("/api/login", json={"username": username, "password": password})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

# 1. 회원가입 및 로그인 테스트
def test_auth_flow(client):
    """
    [Given]: 새로운 사용자 정보(username, password, email)가 준비됨.
    [When]: /api/register에 회원가입을 요청하고, /api/login에 로그인을 요청함.
    [Then]: 회원가입 응답은 200이며 사용자의 정보를 반환해야 하고, 로그인 성공 시 access_token을 발급받아야 함.
    """
    # Given
    user_data = {"username": "testuser", "password": "testpassword", "email": "test@example.com"}
    
    # When (Register)
    reg_response = client.post("/api/register", json=user_data)
    # Then
    assert reg_response.status_code == 200
    assert reg_response.json()["username"] == "testuser"
    assert reg_response.json()["email"] == "test@example.com"

    # When (Login)
    login_response = client.post("/api/login", json={"username": "testuser", "password": "testpassword"})
    # Then
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()

# 2. 문제 목록 조회 및 상세 조회 테스트
def test_question_flow(client, db):
    """
    [Given]: DB에 샘플 문제(Question)와 보기(Option) 데이터가 삽입됨.
    [When]: 인증된 사용자가 /api/questions에 목록을 요청하고, 특정 ID로 상세 내용을 요청함.
    [Then]: 목록에는 삽입된 문제가 포함되어야 하며, 상세 조회 시 보기(Options) 목록이 올바르게 나타나야 함.
    """
    # Given
    auth_header = get_auth_header(client, "q_user", "pass", "q@test.com")
    q = models.Question(id=101, question="Test Question?", domain="Performance", explanation="Test Explanation")
    db.add(q)
    db.commit()
    o1 = models.Option(question_id=101, label="A", content="Option A", is_answer=True)
    o2 = models.Option(question_id=101, label="B", content="Option B", is_answer=False)
    db.add(o1); db.add(o2)
    db.commit()

    # When (List with Domain filtering)
    list_response = client.get("/api/questions/?domain=Performance", headers=auth_header)
    # Then
    assert list_response.status_code == 200
    assert len(list_response.json()) >= 1
    assert list_response.json()[0]["question"] == "Test Question?"

    # When (Detail)
    detail_response = client.get("/api/questions/101", headers=auth_header)
    # Then
    assert detail_response.status_code == 200
    assert len(detail_response.json()["options"]) == 2
    assert detail_response.json()["domain"] == "Performance"

# 3. 답안 제출 및 채점 테스트
def test_submission_flow(client, db):
    """
    [Given]: DB에 문제가 있고, 사용자가 정답('A')을 알고 있음.
    [When]: 사용자가 정답 'A'를 /api/submit에 제출함.
    [Then]: 응답 데이터에서 is_correct는 True여야 하며, correct_labels에는 'A'가 포함되어야 함.
    """
    # Given
    auth_header = get_auth_header(client, "s_user", "pass", "s@test.com")
    # (Question 101 is already there if running in module, but let's assume it exists)
    
    # When
    submit_data = {"question_id": 101, "selected_labels": ["A"]}
    response = client.post("/api/submit/", json=submit_data, headers=auth_header)
    
    # Then
    assert response.status_code == 200
    assert response.json()["is_correct"] is True
    assert "A" in response.json()["correct_labels"]

# 4. 플래그(북마크) 테스트
def test_flag_flow(client):
    """
    [Given]: 인증된 사용자가 특정 문제를 플래그(북마크)하려고 함.
    [When]: /api/flags/ 에 POST 요청으로 플래그를 설정하고, GET으로 목록을 확인한 뒤 DELETE로 삭제함.
    [Then]: 플래그 설정 후 목록에 해당 문제가 있어야 하며, 삭제 후에는 목록에서 사라져야 함.
    """
    # Given
    auth_header = get_auth_header(client, "f_user", "pass", "f@test.com")
    
    # When (Add Flag)
    client.post("/api/flags/", json={"question_id": 101}, headers=auth_header)
    # Then (Check List)
    get_response = client.get("/api/flags/", headers=auth_header)
    assert any(item["id"] == 101 for item in get_response.json())

    # When (Remove Flag)
    client.request("DELETE", "/api/flags/", json={"question_id": 101}, headers=auth_header)
    # Then (Check List)
    after_delete = client.get("/api/flags/", headers=auth_header)
    assert not any(item["id"] == 101 for item in after_delete.json())

# 5. 오답 목록 및 팁 테스트
def test_wrong_and_tip_flow(client, db):
    """
    [Given]: 사용자가 문제를 틀린 기록이 있고, 해당 문제에 팁을 작성함.
    [When]: /api/wrong을 조회하고, /api/tips에 팁을 저장 및 조회함.
    [Then]: 오답 목록에 해당 문제가 포함되어야 하며, 저장된 팁 내용이 정확히 조회되어야 함.
    """
    # Given
    auth_header = get_auth_header(client, "w_user", "pass", "w@test.com")
    # Wrong submission
    client.post("/api/submit/", json={"question_id": 101, "selected_labels": ["B"]}, headers=auth_header)

    # When (Wrong List)
    wrong_response = client.get("/api/wrong/", headers=auth_header)
    # Then
    assert any(item["id"] == 101 for item in wrong_response.json())

    # When (Upsert Tip)
    tip_data = {"question_id": 101, "tip_text": "Always check for transfer acceleration."}
    client.post("/api/tips/", json=tip_data, headers=auth_header)
    # Get Tip
    tip_response = client.get("/api/tips/101", headers=auth_header)
    # Then
    assert tip_response.status_code == 200
    assert tip_response.json()["tip_text"] == "Always check for transfer acceleration."
