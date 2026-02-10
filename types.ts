
export enum UserRole {
  ADMIN = 'ADMIN',
  SUPPORT_LEAD = 'SUPPORT_LEAD',
  SUPPORT_STAFF = 'SUPPORT_STAFF',
  CUSTOMER = 'CUSTOMER'
}

export enum TicketStatus {
  WAITING = '대기',
  RECEIVED = '접수',
  RECEIVED_AUTO = '접수(자동)',
  IN_PROGRESS = '처리중',
  DELAYED = '지연중',
  POSTPONE_REQUESTED = '연기요청중',
  COMPLETION_REQUESTED = '완료요청중',
  COMPLETED = '완료'
}

export enum ProjectStatus {
  ACTIVE = '활성',
  INACTIVE = '비활성'
}

export enum UserStatus {
  ACTIVE = '활성',
  INACTIVE = '비활성'
}

export enum CompanyStatus {
  ACTIVE = '활성',
  INACTIVE = '비활성'
}

export enum IntakeMethod {
  PHONE = '전화',
  EMAIL = '메일',
  DISCOVERY = '발견',
  OTHER = '기타'
}

export interface Company {
  id: string;
  name: string;
  representative?: string;
  industry?: string;
  address?: string;
  remarks?: string;
  status: CompanyStatus;
}

export interface User {
  id: string;
  loginId: string;
  password?: string;
  name: string;
  phone?: string;
  mobile?: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  companyId?: string;
  department?: string; // 지원팀 정보
  remarks?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  customerContactIds: string[]; // Multiple customer contacts
  supportStaffIds: string[]; // Multiple support staff, index 0 is PM
  startDate?: string;
  endDate?: string;
  description: string;
  remarks?: string;
  status: ProjectStatus;
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
  attachments?: string[];
}

export interface HistoryEntry {
  id: string;
  ticketId: string;
  status: TicketStatus;
  changedBy: string;
  timestamp: string;
  note?: string;
  action?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  plan?: string;
  status: TicketStatus;
  customerId: string;
  customerName: string;
  supportId?: string;
  supportName?: string;
  projectId: string;
  createdAt: string;
  dueDate: string;
  initialDueDate?: string;
  shortenedDueReason?: string;
  postponeReason?: string;
  postponeDate?: string;
  rejectionReason?: string;
  satisfaction?: number;
  completionFeedback?: string;
  attachments?: string[];
  planAttachments?: string[];
  intakeMethod?: IntakeMethod;
  requestDate?: string;
  expectedCompletionDate?: string;
  expectedCompletionDelayReason?: string;
}

export interface HardwareInfo {
  id: string;
  usage: string; // WEB/WAS/DB/기타
  cpu: string;
  memory: string;
  hdd: string;
  notes: string;
  manufacturer: string;
  model: string;
  remarks: string;
}

export interface SoftwareInfo {
  id: string;
  usage: string;
  productVersion: string;
  installPath: string;
  notes: string;
  manufacturer: string;
  techSupport: string;
  remarks: string;
}

export interface AccessInfo {
  id: string;
  target: string;
  loginId: string;
  password1: string;
  password2: string;
  usage: string;
  notes: string;
  accessPath: string;
  remarks: string;
}

export interface OrganizationInfo {
  nameKo: string;
  nameEn: string;
  representative: string;
  bizNumber: string; // 사업자등록번호
  bizType: string;   // 업태
  bizCategory: string; // 종목
  zipCode: string;
  address: string;
  phone: string;
  email: string;
  supportTeam1: string;
  supportTeam2: string;
  supportTeam3: string;
  remarks: string;
}

export interface OperationalInfo {
  projectId: string;
  hardware: HardwareInfo[];
  software: SoftwareInfo[];
  access: AccessInfo[];
  otherNotes: string;
}

export interface AppState {
  companies: Company[];
  users: User[];
  projects: Project[];
  tickets: Ticket[];
  comments: Comment[];
  history: HistoryEntry[];
  opsInfo: OperationalInfo[];
  orgInfo?: OrganizationInfo;
}
