
-- nu-ServiceDesk 전체 테이블 초기화 SQL
-- Supabase SQL Editor에서 실행하세요.

-- 1. 고객사 (companies)
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    phone TEXT,
    email TEXT,
    address TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 사용자 (users)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    login_id TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    company_id TEXT REFERENCES companies(id),
    department TEXT,
    mobile TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 프로젝트 (projects)
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    client_id TEXT REFERENCES companies(id),
    description TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    status TEXT DEFAULT 'ACTIVE',
    customer_contact_ids TEXT[] DEFAULT '{}',
    support_staff_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 서비스 요청 (tickets)
CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    customer_id TEXT,
    customer_name TEXT,
    project_id TEXT REFERENCES projects(id),
    support_id TEXT,
    support_name TEXT,
    plan TEXT,
    expected_completion_date TIMESTAMPTZ,
    satisfaction INTEGER,
    completion_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    initial_due_date TIMESTAMPTZ,
    shortened_due_reason TEXT,
    postpone_reason TEXT,
    postpone_date TIMESTAMPTZ,
    rejection_reason TEXT,
    attachments TEXT[] DEFAULT '{}',
    plan_attachments TEXT[] DEFAULT '{}',
    intake_method TEXT,
    request_date TIMESTAMPTZ,
    expected_completion_delay_reason TEXT
);

-- 5. 댓글 (comments)
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    ticket_id TEXT REFERENCES tickets(id) ON DELETE CASCADE,
    author_id TEXT,
    author_name TEXT,
    content TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 이력 (history)
CREATE TABLE IF NOT EXISTS history (
    id TEXT PRIMARY KEY,
    ticket_id TEXT REFERENCES tickets(id) ON DELETE CASCADE,
    status TEXT,
    changed_by TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    note TEXT
);

-- 7. 운영 정보 (operational_info)
CREATE TABLE IF NOT EXISTS operational_info (
    project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
    hardware JSONB DEFAULT '[]',
    software JSONB DEFAULT '[]',
    access JSONB DEFAULT '[]',
    other_notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 기관 정보 (organization_info)
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

-- RLS 비활성화 (개발 편의를 위해 모든 접근 허용, 운영 시 설정 권장)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON operational_info FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON organization_info FOR ALL USING (true) WITH CHECK (true);
