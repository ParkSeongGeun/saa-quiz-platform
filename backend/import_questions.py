import json
import os
import pymysql
import boto3
from dotenv import load_dotenv
from botocore.exceptions import ClientError

# ENV_FILE 환경 변수가 있으면 해당 파일을 로드, 없으면 기본 .env 로드
env_path = os.getenv("ENV_FILE", ".env")
load_dotenv(env_path)

print(f"로드된 환경 설정 파일: {env_path}")

def get_db_credentials():
    """AWS Secrets Manager에서 자격 증명을 가져오거나 환경 변수에서 가져옵니다."""
    secret_name = os.getenv("AWS_SECRET_NAME")
    region_name = os.getenv("AWS_REGION", "ap-northeast-2")

    # AWS Secret Name이 설정되어 있으면 AWS에서 가져옴
    if secret_name:
        print(f"AWS Secrets Manager({secret_name})에서 자격 증명을 가져오는 중...")
        session = boto3.session.Session()
        client = session.client(service_name='secretsmanager', region_name=region_name)
        try:
            get_secret_value_response = client.get_secret_value(SecretId=secret_name)
            secret = json.loads(get_secret_value_response['SecretString'])
            return secret.get('username'), secret.get('password')
        except ClientError as e:
            print(f"Secrets Manager 에러: {e}")
            raise e
    
    # 없으면 로컬 환경 변수 사용
    return os.getenv("DB_USER"), os.getenv("DB_PASS")

# DB 연결 설정
db_user, db_pass = get_db_credentials()

conn = pymysql.connect(
    host=os.getenv("DB_HOST", "127.0.0.1"),
    port=int(os.getenv("DB_PORT", 3306)),
    user=db_user,
    password=db_pass,
    database=os.getenv("DB_NAME"),
    charset="utf8mb4",
)
cursor = conn.cursor()

# 테이블 스키마 업데이트
print("테이블을 초기화합니다...")
cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
cursor.execute("DROP TABLE IF EXISTS choices;")
cursor.execute("DROP TABLE IF EXISTS questions;")

# questions 테이블 생성
cursor.execute("""
CREATE TABLE questions (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question    TEXT         NOT NULL,
    explanation TEXT,
    domain      VARCHAR(100),
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
""")

# choices 테이블 생성
cursor.execute("""
CREATE TABLE choices (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question_id INT UNSIGNED NOT NULL,
    label       CHAR(1)      NOT NULL,
    content     TEXT         NOT NULL,
    is_answer   TINYINT(1)   NOT NULL DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
""")

# user_answers 테이블의 selected_label 크기 확장 (이미 존재한다면)
cursor.execute("SHOW TABLES LIKE 'user_answers';")
if cursor.fetchone():
    print("user_answers 테이블의 답안 저장 용량을 확장합니다...")
    cursor.execute("ALTER TABLE user_answers MODIFY selected_label VARCHAR(255);")

cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
conn.commit()

# JSON 로드
json_path = os.path.join(os.path.dirname(__file__), "korean_classified.json")
with open(json_path, encoding="utf-8") as f:
    data = json.load(f)

print(f"총 {len(data)}개 문제 삽입 시작...")

inserted_questions = 0
inserted_choices   = 0

for item in data:
    explanation = "\n".join(item.get("explanations", []))
    cursor.execute(
        "INSERT INTO questions (id, question, explanation, domain) VALUES (%s, %s, %s, %s)",
        (item["id"], item["question"], explanation, item.get("domain", ""))
    )
    inserted_questions += 1

    for label, content in item["choices"].items():
        is_answer = 1 if label in item["answers"] else 0
        cursor.execute(
            "INSERT INTO choices (question_id, label, content, is_answer) VALUES (%s, %s, %s, %s)",
            (item["id"], label, content, is_answer)
        )
        inserted_choices += 1

conn.commit()
cursor.close()
conn.close()

print(f"완료! questions: {inserted_questions}개, choices: {inserted_choices}개 삽입됨")
