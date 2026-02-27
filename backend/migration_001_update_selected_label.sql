-- ============================================================
-- Migration: Update selected_label column to support multiple answers
-- Date: 2026-02-27
-- Description: Change selected_label from CHAR(1) to VARCHAR(50) to support
--              comma-separated multiple answer selections (e.g., "A,B,C")
-- ============================================================

-- Modify the selected_label column in user_answers table
ALTER TABLE user_answers
MODIFY COLUMN selected_label VARCHAR(50) NOT NULL;

-- Verify the change
DESCRIBE user_answers;
