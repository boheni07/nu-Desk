
import { createClient } from '@supabase/supabase-js';

// Supabase 접속 정보 (환경 변수 사용)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing. Check your .env.local file.');
}

/**
 * Supabase 클라이언트 인스턴스
 * 모든 데이터베이스 상호작용에 사용됩니다.
 */
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
