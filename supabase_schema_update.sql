
-- 기관정보 설정을 위한 테이블 생성 SQL
-- Supabase SQL Editor에서 실행하세요.

CREATE TABLE IF NOT EXISTS organization_info (
    id TEXT PRIMARY KEY,
    name_ko TEXT NOT NULL,
    name_en TEXT,
    representative TEXT,
    biz_number TEXT,
    biz_type TEXT,
    biz_category TEXT,
    zip_code TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    support_team_1 TEXT,
    support_team_2 TEXT,
    support_team_3 TEXT,
    remarks TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 설정 (필요한 경우)
ALTER TABLE organization_info ENABLE ROW LEVEL SECURITY;

-- 모든 사용자에게 읽기/쓰기 허용 (관리자 전용 로직은 앱 레벨에서 제어)
CREATE POLICY "Allow all access to organization_info" ON organization_info
FOR ALL USING (true) WITH CHECK (true);
