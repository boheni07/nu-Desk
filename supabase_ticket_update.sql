
-- tickets 테이블에 누락된 컬럼 추가 SQL
-- Supabase SQL Editor에서 실행하세요.

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS shortened_due_reason TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS postpone_reason TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS postpone_date TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS attachments TEXT[];
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS plan_attachments TEXT[];
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS intake_method TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS request_date TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS expected_completion_delay_reason TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS initial_due_date TIMESTAMPTZ;

-- (선택 사항) 인덱스 추가로 성능 최적화
CREATE INDEX IF NOT EXISTS idx_tickets_project_id ON tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON tickets(customer_id);
