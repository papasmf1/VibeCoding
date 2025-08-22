import { createClient } from '@supabase/supabase-js'

// Supabase 설정 - 올바른 URL 사용
const supabaseUrl = 'https://xaoqgesgodxopccfkqvj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhb3FnZXNnb2R4b3BjY2ZrcXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTY4MTgsImV4cCI6MjA3MTI5MjgxOH0.CQiQlUFUuBI-xdEew5x5lqRazG1fLvqDj_1hiL1-lfs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 사용자 타입 정의
export interface User {
  id: string
  username: string
  email?: string
  created_at: string
  updated_at: string
}

// 회원가입 요청 타입
export interface SignUpRequest {
  username: string
  password: string
  email?: string
}

// 로그인 요청 타입
export interface SignInRequest {
  username: string
  password: string
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}
