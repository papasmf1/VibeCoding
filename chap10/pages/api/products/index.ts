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
    const { category, search, sort, page = '1', limit = '12' } = req.query

    let query = supabase
      .from('products')
      .select(`
        *,
        category:product_categories(name, description)
      `)
      .eq('is_active', true)

    // 카테고리 필터링
    if (category && category !== 'all') {
      query = query.eq('category_id', category)
    }

    // 검색 필터링
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`)
    }

    // 정렬
    if (sort === 'price_asc') {
      query = query.order('price', { ascending: true })
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false })
    } else if (sort === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else {
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
    }

    // 페이지네이션
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const from = (pageNum - 1) * limitNum
    const to = from + limitNum - 1

    query = query.range(from, to)

    const { data: products, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ 
        success: false, 
        error: '상품 목록을 가져오는 중 오류가 발생했습니다.' 
      })
    }

    // 총 상품 수 계산
    let totalCount = count
    if (!totalCount) {
      const { count: total } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
      totalCount = total || 0
    }

    res.status(200).json({
      success: true,
      data: {
        products: products || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      }
    })

  } catch (error) {
    console.error('Products API error:', error)
    res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    })
  }
}
