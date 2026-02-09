
import { createClient } from '@supabase/supabase-js';

// Supabase 접속 정보 (사용자 제공)
const supabaseUrl = 'https://gczbftfbfpgomrhlsmvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjemJmdGZiZnBnb21yaGxzbXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM4MTUsImV4cCI6MjA4NjEzOTgxNX0.HP9xVeCg2p9Q7pVHX2i-jAuZEMNhV6CfjJMx8NR3sbY';

/**
 * Supabase 클라이언트 인스턴스
 * 모든 데이터베이스 상호작용에 사용됩니다.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
