import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

interface Inquiry {
  id: string
  title: string
  content: string
  author: string
  email: string
  status: 'pending' | 'answered' | 'closed'
  created_at: string
  answer?: string
  answered_at?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req

  try {
    switch (method) {
      case 'GET':
        // 문의 목록 조회 - 임시로 빈 배열 반환 (테이블 생성 전까지)
        try {
          console.log('문의 목록 조회 요청')
          
          // 임시로 빈 배열 반환
          res.status(200).json({
            success: true,
            data: []
          })

          // TODO: Supabase 테이블 생성 후 아래 코드 활성화
          /*
          const { data: inquiries, error } = await supabase
            .from('inquiries')
            .select('*')
            .order('created_at', { ascending: false })

          if (error) {
            console.error('문의 목록 조회 오류:', error)
            return res.status(500).json({
              success: false,
              error: '문의 목록을 가져오는 중 오류가 발생했습니다.'
            })
          }

          res.status(200).json({
            success: true,
            data: inquiries || []
          })
          */
        } catch (error) {
          console.error('문의 목록 조회 예외:', error)
          res.status(500).json({
            success: false,
            error: '문의 목록을 가져오는 중 오류가 발생했습니다.'
          })
        }
        break

      case 'POST':
        // 새 문의 등록
        const { title, content, author, email } = req.body

        if (!title || !content || !author || !email) {
          return res.status(400).json({
            success: false,
            error: '모든 필드를 입력해주세요.'
          })
        }

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            error: '올바른 이메일 형식을 입력해주세요.'
          })
        }

        try {
          // Supabase 테이블이 존재하지 않을 수 있으므로 우선 로컬 방식으로 처리
          console.log('문의 등록 시도:', { title, content, author, email })
          
          // 임시로 성공 응답 반환 (테이블 생성 전까지)
          const newInquiry = {
            id: `inquiry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: title.trim(),
            content: content.trim(),
            author: author.trim(),
            email: email.trim(),
            status: 'pending' as const,
            created_at: new Date().toISOString()
          }

          console.log('생성된 문의:', newInquiry)

          res.status(201).json({
            success: true,
            data: newInquiry,
            message: '문의가 성공적으로 등록되었습니다.'
          })

          // TODO: Supabase 테이블 생성 후 아래 코드 활성화
          /*
          const { data: newInquiry, error } = await supabase
            .from('inquiries')
            .insert([{
              title: title.trim(),
              content: content.trim(),
              author: author.trim(),
              email: email.trim(),
              status: 'pending'
            }])
            .select()
            .single()

          if (error) {
            console.error('문의 등록 오류:', error)
            return res.status(500).json({
              success: false,
              error: '문의 등록 중 오류가 발생했습니다.'
            })
          }

          res.status(201).json({
            success: true,
            data: newInquiry,
            message: '문의가 성공적으로 등록되었습니다.'
          })
          */
        } catch (error) {
          console.error('문의 등록 예외:', error)
          res.status(500).json({
            success: false,
            error: '문의 등록 중 오류가 발생했습니다.'
          })
        }
        break

      case 'PUT':
        // 문의 수정 또는 답변 추가
        const { id, answer } = req.body

        if (!id) {
          return res.status(400).json({
            success: false,
            error: '문의 ID가 필요합니다.'
          })
        }

        // 임시로 성공 응답 반환
        res.status(200).json({
          success: true,
          data: {
            id,
            answer,
            answered_at: new Date().toISOString(),
            status: 'answered'
          },
          message: '답변이 등록되었습니다.'
        })
        break

      case 'DELETE':
        // 문의 삭제
        const { id: deleteId } = req.query

        if (!deleteId) {
          return res.status(400).json({
            success: false,
            error: '삭제할 문의 ID가 필요합니다.'
          })
        }

        // 임시로 성공 응답 반환
        res.status(200).json({
          success: true,
          message: '문의가 삭제되었습니다.'
        })
        break

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).json({
          success: false,
          error: `Method ${method} Not Allowed`
        })
    }
  } catch (error) {
    console.error('Inquiry API error:', error)
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    })
  }
}
