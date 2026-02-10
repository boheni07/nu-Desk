
import { supabase } from '../supabaseClient';
import { Company, User, Project, Ticket, Comment, HistoryEntry, OperationalInfo, OrganizationInfo } from '../types';

/** 
 * Supabase 관계형 데이터베이스 처리 로직
 * 각 테이블별로 독립적인 페치 및 저장 기능을 제공합니다.
 */

// --- Utility: Convert Empty String to Null for DB Consistency ---
const toDbData = (data: any) => {
    const cleaned: any = {};
    Object.keys(data).forEach(key => {
        const val = data[key];
        // 빈 문자열인 경우 null로 변환하여 DB(Postgres)의 타입 오류 방지
        cleaned[key] = val === '' ? null : val;
    });
    return cleaned;
};

// --- 1. Companies (고객사) ---
export const fetchCompanies = async (): Promise<Company[]> => {
    const { data, error } = await supabase.from('companies').select('*');
    if (error) throw error;
    return data || [];
};

export const saveCompany = async (company: Company) => {
    const data: any = {
        id: company.id,
        name: company.name,
        representative: company.representative,
        industry: company.industry,
        address: company.address,
        remarks: company.remarks,
        status: company.status
    };
    const { error } = await supabase.from('companies').upsert(data);
    if (error) throw error;
};

export const saveCompanies = async (companies: Company[]) => {
    const mapped = companies.map(company => ({
        id: company.id,
        name: company.name,
        representative: company.representative,
        industry: company.industry,
        address: company.address,
        remarks: company.remarks,
        status: company.status
    }));
    const { error } = await supabase.from('companies').upsert(mapped);
    if (error) throw error;
};

export const deleteCompany = async (id: string) => {
    const { error } = await supabase.from('companies').delete().eq('id', id);
    if (error) throw error;
};

// --- 2. Users (사용자) ---
export const fetchUsersRaw = async (): Promise<{ data: any[] | null, count: number | null }> => {
    const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('[Supabase Error] users 조회 실패:', error.message);
        throw error;
    }

    return { data, count };
};

export const fetchUsers = async (): Promise<User[]> => {
    const { data, count } = await fetchUsersRaw();

    console.log(`[Supabase Debug] users 페칭 결과 - 데이터: ${data?.length || 0}건, 실제 전체 카운트: ${count}건`);

    if (count !== null && (data?.length || 0) < count) {
        console.warn(`[Supabase Warn] RLS 필터링 활성화 가능성: 전체 ${count}건 중 ${data?.length || 0}건만 조회됨.`);
    }

    // DB의 snake_case와 코드의 camelCase 매핑
    return (data || []).map(u => ({
        ...u,
        loginId: u.login_id,
        companyId: u.company_id,
        department: u.department
    }));
};

export const saveUser = async (user: User) => {
    const data: any = {
        id: user.id,
        login_id: user.loginId,
        password: user.password,
        name: user.name,
        role: user.role,
        status: user.status,
    };
    if (user.companyId) data.company_id = user.companyId;
    if (user.department) data.department = user.department;
    if (user.mobile) data.mobile = user.mobile;
    if (user.email) data.email = user.email;
    if (user.phone) data.phone = user.phone;

    const { error } = await supabase.from('users').upsert(data);
    if (error) throw error;
};

export const saveUsers = async (users: User[]) => {
    const mapped = users.map(user => {
        const data: any = {
            id: user.id,
            login_id: user.loginId,
            password: user.password,
            name: user.name,
            role: user.role,
            status: user.status,
        };
        if (user.companyId) data.company_id = user.companyId;
        if (user.department) data.department = user.department;
        if (user.mobile) data.mobile = user.mobile;
        if (user.email) data.email = user.email;
        if (user.phone) data.phone = user.phone;
        return data;
    });
    const { error } = await supabase.from('users').upsert(mapped);
    if (error) throw error;
};

export const deleteUser = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
};

// --- 3. Projects (프로젝트) ---
export const fetchProjects = async (): Promise<Project[]> => {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;
    return (data || []).map(p => ({
        ...p,
        clientId: p.client_id,
        customerContactIds: p.customer_contact_ids || [],
        supportStaffIds: p.support_staff_ids || [],
        startDate: p.start_date,
        endDate: p.end_date
    }));
};

export const saveProject = async (project: Project) => {
    const data = toDbData({
        id: project.id,
        name: project.name,
        client_id: project.clientId,
        description: project.description,
        remarks: project.remarks,
        start_date: project.startDate,
        end_date: project.endDate,
        status: project.status,
        customer_contact_ids: project.customerContactIds,
        support_staff_ids: project.supportStaffIds
    });
    const { error } = await supabase.from('projects').upsert(data);
    if (error) throw error;
};

export const saveProjects = async (projects: Project[]) => {
    const mapped = projects.map(project => toDbData({
        id: project.id,
        name: project.name,
        client_id: project.clientId,
        description: project.description,
        remarks: project.remarks,
        start_date: project.startDate,
        end_date: project.endDate,
        status: project.status,
        customer_contact_ids: project.customerContactIds,
        support_staff_ids: project.supportStaffIds
    }));
    const { error } = await supabase.from('projects').upsert(mapped);
    if (error) throw error;
};

export const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
};

// --- 4. Tickets (서비스 요청) ---
export const fetchTickets = async (): Promise<Ticket[]> => {
    const { data, error } = await supabase.from('tickets').select('*');
    if (error) throw error;
    return (data || []).map(t => ({
        ...t,
        customerId: t.customer_id,
        customerName: t.customer_name,
        projectId: t.project_id,
        supportId: t.support_id,
        supportName: t.support_name,
        expectedCompletionDate: t.expected_completion_date,
        completionFeedback: t.completion_feedback,
        satisfaction: t.satisfaction,
        createdAt: t.created_at,
        dueDate: t.due_date,
        initialDueDate: t.initial_due_date,
        shortenedDueReason: t.shortened_due_reason,
        postponeReason: t.postpone_reason,
        postponeDate: t.postpone_date,
        rejectionReason: t.rejection_reason,
        attachments: t.attachments || [],
        planAttachments: t.plan_attachments || [],
        intakeMethod: t.intake_method,
        expectedCompletionDelayReason: t.expected_completion_delay_reason,
        requestDate: t.request_date
    }));
};

export const saveTicket = async (ticket: Ticket) => {
    const data = toDbData({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        customer_id: ticket.customerId,
        customer_name: ticket.customerName,
        project_id: ticket.projectId,
        support_id: ticket.supportId,
        support_name: ticket.supportName,
        plan: ticket.plan,
        expected_completion_date: ticket.expectedCompletionDate,
        satisfaction: ticket.satisfaction,
        completion_feedback: ticket.completionFeedback,
        created_at: ticket.createdAt,
        due_date: ticket.dueDate,
        initial_due_date: ticket.initialDueDate,
        shortened_due_reason: ticket.shortenedDueReason,
        postpone_reason: ticket.postponeReason,
        postpone_date: ticket.postponeDate,
        rejection_reason: ticket.rejectionReason,
        attachments: ticket.attachments,
        plan_attachments: ticket.planAttachments,
        intake_method: ticket.intakeMethod,
        request_date: ticket.requestDate,
        expected_completion_delay_reason: ticket.expectedCompletionDelayReason
    });
    const { error } = await supabase.from('tickets').upsert(data);
    if (error) throw error;
};

export const saveTickets = async (tickets: Ticket[]) => {
    const mapped = tickets.map(ticket => toDbData({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        customer_id: ticket.customerId,
        customer_name: ticket.customerName,
        project_id: ticket.projectId,
        support_id: ticket.supportId,
        support_name: ticket.supportName,
        plan: ticket.plan,
        expected_completion_date: ticket.expectedCompletionDate,
        satisfaction: ticket.satisfaction,
        completion_feedback: ticket.completionFeedback,
        created_at: ticket.createdAt,
        due_date: ticket.dueDate,
        initial_due_date: ticket.initialDueDate,
        shortened_due_reason: ticket.shortenedDueReason,
        postpone_reason: ticket.postponeReason,
        postpone_date: ticket.postponeDate,
        rejection_reason: ticket.rejectionReason,
        attachments: ticket.attachments,
        plan_attachments: ticket.planAttachments,
        intake_method: ticket.intakeMethod,
        request_date: ticket.requestDate,
        expected_completion_delay_reason: ticket.expectedCompletionDelayReason
    }));
    const { error } = await supabase.from('tickets').upsert(mapped);
    if (error) throw error;
};

export const deleteTicket = async (id: string) => {
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) throw error;
};

// --- 5. Comments (댓글) ---
export const fetchComments = async (): Promise<Comment[]> => {
    const { data, error } = await supabase.from('comments').select('*');
    if (error) throw error;
    return (data || []).map(c => ({
        ...c,
        ticketId: c.ticket_id,
        authorId: c.author_id,
        authorName: c.author_name
    }));
};

export const saveComment = async (comment: Comment) => {
    const { error } = await supabase.from('comments').upsert({
        id: comment.id,
        ticket_id: comment.ticketId,
        author_id: comment.authorId,
        author_name: comment.authorName,
        content: comment.content,
        timestamp: comment.timestamp
    });
    if (error) throw error;
};

export const saveComments = async (comments: Comment[]) => {
    const mapped = comments.map(comment => ({
        id: comment.id,
        ticket_id: comment.ticketId,
        author_id: comment.authorId,
        author_name: comment.authorName,
        content: comment.content,
        timestamp: comment.timestamp
    }));
    const { error } = await supabase.from('comments').upsert(mapped);
    if (error) throw error;
};

// --- 6. Operational Info (운영 정보) ---
export const fetchAllOpsInfo = async (): Promise<OperationalInfo[]> => {
    const { data, error } = await supabase.from('operational_info').select('*');
    if (error) throw error;
    return (data || []).map(o => ({
        projectId: o.project_id,
        hardware: o.hardware,
        software: o.software,
        access: o.access,
        otherNotes: o.other_notes
    }));
};

export const saveOpsInfo = async (info: OperationalInfo) => {
    const { error } = await supabase.from('operational_info').upsert({
        project_id: info.projectId,
        hardware: info.hardware,
        software: info.software,
        access: info.access,
        other_notes: info.otherNotes,
        updated_at: new Date().toISOString()
    });
    if (error) throw error;
};

export const saveOpsInfos = async (infos: OperationalInfo[]) => {
    const mapped = infos.map(info => ({
        project_id: info.projectId,
        hardware: info.hardware,
        software: info.software,
        access: info.access,
        other_notes: info.otherNotes,
        updated_at: new Date().toISOString()
    }));
    const { error } = await supabase.from('operational_info').upsert(mapped);
    if (error) throw error;
};

// --- 7. History (이력) ---
export const fetchHistory = async (): Promise<HistoryEntry[]> => {
    const { data, error } = await supabase.from('history').select('*');
    if (error) throw error;
    return (data || []).map(h => ({
        ...h,
        ticketId: h.ticket_id,
        changedBy: h.changed_by
    }));
};

export const saveHistoryEntry = async (entry: HistoryEntry) => {
    const { error } = await supabase.from('history').upsert({
        id: entry.id,
        ticket_id: entry.ticketId,
        status: entry.status,
        changed_by: entry.changedBy,
        timestamp: entry.timestamp,
        note: entry.note
    });
    if (error) throw error;
};

export const saveHistoryEntries = async (entries: HistoryEntry[]) => {
    const mapped = entries.map(entry => ({
        id: entry.id,
        ticket_id: entry.ticketId,
        status: entry.status,
        changed_by: entry.changedBy,
        timestamp: entry.timestamp,
        note: entry.note
    }));
    const { error } = await supabase.from('history').upsert(mapped);
    if (error) throw error;
};

// --- 8. Organization Info (기관 정보) ---
export const fetchOrganizationInfo = async (): Promise<OrganizationInfo | null> => {
    try {
        const { data, error } = await supabase.from('organization_info').select('*').eq('id', 'current').single();
        if (error) {
            if (error.code === 'PGRST116' || error.code === '42P01') return null;
            throw error;
        }
        if (!data) return null;
        return {
            nameKo: data.name_ko,
            nameEn: data.name_en,
            representative: data.representative,
            bizNumber: data.biz_number,
            bizType: data.biz_type,
            bizCategory: data.biz_category,
            zipCode: data.zip_code,
            address: data.address,
            phone: data.phone,
            email: data.email,
            supportTeam1: data.support_team_1,
            supportTeam2: data.support_team_2,
            supportTeam3: data.support_team_3,
            remarks: data.remarks
        };
    } catch (err) {
        console.error('fetchOrganizationInfo error:', err);
        return null;
    }
};

export const saveOrganizationInfo = async (info: OrganizationInfo) => {
    const { error } = await supabase.from('organization_info').upsert({
        id: 'current',
        name_ko: info.nameKo,
        name_en: info.nameEn,
        representative: info.representative,
        biz_number: info.bizNumber,
        biz_type: info.bizType,
        biz_category: info.bizCategory,
        zip_code: info.zipCode,
        address: info.address,
        phone: info.phone,
        email: info.email,
        support_team_1: info.supportTeam1,
        support_team_2: info.supportTeam2,
        support_team_3: info.supportTeam3,
        remarks: info.remarks,
        updated_at: new Date().toISOString()
    });
    if (error) throw error;
};

// --- 9. Global Operations ---
export const clearAllData = async () => {
    // Foreign Key 관계를 고려하여 하위 데이터부터 삭제
    await supabase.from('comments').delete().neq('id', '_');
    await supabase.from('history').delete().neq('id', '_');
    await supabase.from('tickets').delete().neq('id', '_');
    await supabase.from('operational_info').delete().neq('project_id', '_');
    await supabase.from('projects').delete().neq('id', '_');
    await supabase.from('users').delete().neq('id', '_');
    await supabase.from('companies').delete().neq('id', '_');
    // organization_info는 유지하거나 필요 시 별도 처리
};
