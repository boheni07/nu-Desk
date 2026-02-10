
import { createClient } from '@supabase/supabase-js';

// Supabase 접속 정보 (환경 변수 사용)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
    console.warn('Supabase URL or Anon Key is missing. Database features will not work.');
}

// createClient에 빈 문자열이 들어가면 에러가 발생할 수 있으므로 최소한의 유효성 검사 후 호출
export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        from: () => ({
            select: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            insert: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
            upsert: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
            delete: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
            eq: () => ({ select: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) })
        })
    } as any;
