-- 모든 테이블의 status 기본값을 한글로 변경 및 기존 데이터 보정

-- 1. projects 테이블
ALTER TABLE projects ALTER COLUMN status SET DEFAULT '활성';
UPDATE projects SET status = '활성' WHERE status = 'ACTIVE' OR status IS NULL;

-- 2. companies 테이블
ALTER TABLE companies ALTER COLUMN status SET DEFAULT '활성';
UPDATE companies SET status = '활성' WHERE status = 'ACTIVE' OR status IS NULL;

-- 3. users 테이블
ALTER TABLE users ALTER COLUMN status SET DEFAULT '활성';
UPDATE users SET status = '활성' WHERE status = 'ACTIVE' OR status IS NULL;

-- 4. tickets 테이블
-- tickets는 status NOT NULL인 경우가 많으므로 안전하게 처리
UPDATE tickets SET status = '접수' WHERE status = 'RECEIVED' OR status = 'ACTIVE';

-- 5. remarks 컬럼 재확인 (혹시 누락된 경우를 대비)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS remarks TEXT;
