
-- users 테이블에 부서/팀 정보 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT;

-- 기존 역할을 새로운 역할로 매핑 (필요시)
-- UPDATE users SET role = 'SUPPORT_LEAD' WHERE role = 'SUPPORT' AND name LIKE '%팀장%';
-- UPDATE users SET role = 'SUPPORT_STAFF' WHERE role = 'SUPPORT' AND role != 'SUPPORT_LEAD';
