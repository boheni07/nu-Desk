-- projects 테이블에 remarks 컬럼 추가
ALTER TABLE projects ADD COLUMN IF NOT EXISTS remarks TEXT;

-- RLS 정책 재확인 (혹시 누락된 경우를 대비)
DROP POLICY IF EXISTS "Allow all" ON projects;
CREATE POLICY "Allow all" ON projects FOR ALL USING (true) WITH CHECK (true);
