import json
import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

# DB 연결 (포트 3307 사용)
conn = pymysql.connect(
    host=os.getenv("DB_HOST", "127.0.0.1"),
    port=int(os.getenv("DB_PORT", 3307)),
    user=os.getenv("DB_USER", "saauser"),
    password=os.getenv("DB_PASS", "qwer1234"),
    database=os.getenv("DB_NAME", "saa_db"),
    charset="utf8mb4",
)
cursor = conn.cursor()

# 테이블 스키마 업데이트 (domain 컬럼 추가)
print("테이블을 초기화하고 domain 컬럼을 추가합니다...")
cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
cursor.execute("DROP TABLE IF EXISTS choices;")
cursor.execute("DROP TABLE IF EXISTS questions;")

# questions 테이블 생성 (domain 컬럼 포함)
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

cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
conn.commit()

# JSON 로드
with open("korean_classified.json", encoding="utf-8") as f:
    data = json.load(f)

print(f"총 {len(data)}개 문제 삽입 시작...")

inserted_questions = 0
inserted_choices   = 0

for item in data:
    # explanations 배열 → 줄바꿈으로 합치기
    explanation = "\n".join(item.get("explanations", []))

    # questions 삽입 (id, question, explanation, domain)
    cursor.execute(
        """
        INSERT INTO questions (id, question, explanation, domain)
        VALUES (%s, %s, %s, %s)
        """,
        (item["id"], item["question"], explanation, item.get("domain", ""))
    )
    inserted_questions += 1

    # choices 삽입
    for label, content in item["choices"].items():
        is_answer = 1 if label in item["answers"] else 0
        cursor.execute(
            """
            INSERT INTO choices (question_id, label, content, is_answer)
            VALUES (%s, %s, %s, %s)
            """,
            (item["id"], label, content, is_answer)
        )
        inserted_choices += 1

conn.commit()
cursor.close()
conn.close()

print(f"완료! questions: {inserted_questions}개, choices: {inserted_choices}개 삽입됨")
