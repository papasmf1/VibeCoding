import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { username, password, email } = req.body

    // 입력값 검증
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: '사용자명과 비밀번호는 필수입니다.' 
      })
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ 
        success: false, 
        error: '사용자명은 3-20자 사이여야 합니다.' 
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: '비밀번호는 최소 6자 이상이어야 합니다.' 
      })
    }

    // 사용자명 중복 확인
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: '이미 사용 중인 사용자명입니다.' 
      })
    }

    // 비밀번호 해시화
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // 새 사용자 생성
    const newUser = {
      id: uuidv4(),
      username,
      password_hash: hashedPassword,
      email: email || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ 
        success: false, 
        error: '회원가입 중 오류가 발생했습니다.' 
      })
    }

    // 비밀번호 제외하고 사용자 정보 반환
    const { password_hash, ...userWithoutPassword } = newUser

    res.status(201).json({
      success: true,
      data: userWithoutPassword,
      message: '회원가입이 완료되었습니다.'
    })

  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    })
  }
}
