// 전자제품 쇼핑몰 타입 정의

// 상품 카테고리
export interface ProductCategory {
  id: string
  name: string
  description?: string
  created_at: string
}

// 상품
export interface Product {
  id: string
  name: string
  description?: string
  price: number
  original_price?: number
  stock_quantity: number
  category_id: string
  brand?: string
  model?: string
  specifications?: Record<string, any>
  images: string[]
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  category?: ProductCategory
}

// 장바구니 아이템
export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
}

// 주문
export interface Order {
  id: string
  user_id: string
  order_number: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address?: Record<string, any>
  payment_method?: string
  payment_status: 'pending' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

// 주문 상세
export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
  created_at: string
  product?: Product
}

// 장바구니 요청
export interface AddToCartRequest {
  product_id: string
  quantity: number
}

// 장바구니 업데이트 요청
export interface UpdateCartRequest {
  quantity: number
}

// 주문 생성 요청
export interface CreateOrderRequest {
  items: Array<{
    product_id: string
    quantity: number
  }>
  shipping_address: {
    name: string
    phone: string
    address: string
    detail_address: string
    postal_code: string
  }
  payment_method: string
}

// API 응답
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
