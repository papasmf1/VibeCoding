import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { data: categories, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ 
        success: false, 
        error: '카테고리 목록을 가져오는 중 오류가 발생했습니다.' 
      })
    }

    res.status(200).json({
      success: true,
      data: categories || []
    })

  } catch (error) {
    console.error('Categories API error:', error)
    res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    })
  }
}
