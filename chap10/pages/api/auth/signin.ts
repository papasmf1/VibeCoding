import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import bcrypt from 'bcryptjs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { username, password } = req.body

    // 입력값 검증
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: '사용자명과 비밀번호를 입력해주세요.' 
      })
    }

    // 사용자 조회
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (fetchError || !user) {
      return res.status(401).json({ 
        success: false, 
        error: '사용자명 또는 비밀번호가 올바르지 않습니다.' 
      })
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: '사용자명 또는 비밀번호가 올바르지 않습니다.' 
      })
    }

    // 로그인 성공 - 세션 정보 생성
    const sessionData = {
      user_id: user.id,
      username: user.username,
      email: user.email,
      login_time: new Date().toISOString()
    }

    // 세션 테이블에 로그인 기록 저장
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert([{
        user_id: user.id,
        login_time: new Date().toISOString(),
        ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        user_agent: req.headers['user-agent']
      }])

    if (sessionError) {
      console.error('Session logging error:', sessionError)
      // 세션 로깅 실패는 로그인을 막지 않음
    }

    // 비밀번호 제외하고 사용자 정보 반환
    const { password_hash, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        session: sessionData
      },
      message: '로그인이 완료되었습니다.'
    })

  } catch (error) {
    console.error('Signin error:', error)
    res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    })
  }
}
