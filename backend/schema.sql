-- ============================================================
-- schema.sql
-- saa_db 테이블 생성 스크립트
-- 실행 순서: schema.sql → insert_questions.sql
-- ============================================================

-- 문제 테이블
CREATE TABLE questions (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question    TEXT         NOT NULL,
    explanation TEXT,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 보기 테이블
CREATE TABLE choices (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question_id INT UNSIGNED NOT NULL,
    label       CHAR(1)      NOT NULL,
    content     TEXT         NOT NULL,
    is_answer   TINYINT(1)   NOT NULL DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 사용자 답안 테이블
CREATE TABLE IF NOT EXISTS user_answers (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id        INT UNSIGNED NOT NULL,
    question_id    INT UNSIGNED NOT NULL,
    selected_label CHAR(1)      NOT NULL,
    is_correct     TINYINT(1)   NOT NULL DEFAULT 0,
    answered_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_wrong    (user_id, is_correct),
    INDEX idx_user_question (user_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 사용자 플래그 테이블
CREATE TABLE IF NOT EXISTS user_flags (
    user_id     INT UNSIGNED NOT NULL,
    question_id INT UNSIGNED NOT NULL,
    flagged_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 사용자 팁 테이블
CREATE TABLE IF NOT EXISTS user_tips (
    user_id     INT UNSIGNED NOT NULL,
    question_id INT UNSIGNED NOT NULL,
    tip_text    TEXT         NOT NULL,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
