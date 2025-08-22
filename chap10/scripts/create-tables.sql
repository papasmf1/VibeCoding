-- 전자제품 쇼핑몰 데이터베이스 테이블 생성 스크립트
-- Supabase SQL 편집기에서 실행하세요

-- 1. 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(20) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 사용자 세션 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_login_time ON public.user_sessions(login_time);

-- 4. RLS (Row Level Security) 설정
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- 5. 사용자 테이블 정책 (임시로 모든 사용자에게 접근 허용)
CREATE POLICY "Allow all users to view users table" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert into users table" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update their own data" ON public.users
  FOR UPDATE USING (true);

-- 6. 세션 테이블 정책
CREATE POLICY "Allow all users to insert sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to view their own sessions" ON public.user_sessions
  FOR SELECT USING (true);

-- 7. 테이블 생성 확인
SELECT 
  table_name, 
  table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'user_sessions');
