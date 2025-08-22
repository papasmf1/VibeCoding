import React, { useState, useEffect } from 'react'
import { CartItem, Product } from '../../lib/types'

interface CartProps {
  userId: string
  onCheckout: () => void
  onCartUpdate?: () => void
  cartItems?: Product[]
}

export default function Cart({ userId, onCheckout, onCartUpdate, cartItems: propCartItems = [] }: CartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 로컬 스토리지에서 장바구니 가져오기
  const fetchCart = () => {
    try {
      setLoading(true)
      if (typeof window !== 'undefined') {
        const cartData = localStorage.getItem(`cart-${userId}`)
        const items = cartData ? JSON.parse(cartData) : []
        console.log('장바구니 데이터 로드:', items) // 디버깅용
        setCartItems(items)
      }
    } catch (error) {
      console.error('장바구니 로드 오류:', error)
      setError('장바구니를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 로컬 스토리지에 장바구니 저장
  const saveCartToStorage = (items: CartItem[]) => {
    if (typeof window !== 'undefined') {
      console.log('장바구니 데이터 저장:', items) // 디버깅용
      localStorage.setItem(`cart-${userId}`, JSON.stringify(items))
    }
  }

  // 수량 업데이트
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }

    try {
      const updatedItems = cartItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity }
          : item
      )
      setCartItems(updatedItems)
      saveCartToStorage(updatedItems)
      
      // 부모 컴포넌트에 장바구니 업데이트 알림
      if (onCartUpdate) {
        onCartUpdate()
      }
    } catch (error) {
      setError('수량 업데이트 중 오류가 발생했습니다.')
    }
  }

  // 상품 제거
  const removeItem = (itemId: string) => {
    try {
      const updatedItems = cartItems.filter(item => item.id !== itemId)
      setCartItems(updatedItems)
      saveCartToStorage(updatedItems)
      
      // 부모 컴포넌트에 장바구니 업데이트 알림
      if (onCartUpdate) {
        onCartUpdate()
      }
    } catch (error) {
      setError('상품 제거 중 오류가 발생했습니다.')
    }
  }

  // 장바구니 비우기
  const clearCart = () => {
    try {
      setCartItems([])
      saveCartToStorage([])
      
      // 부모 컴포넌트에 장바구니 업데이트 알림
      if (onCartUpdate) {
        onCartUpdate()
      }
    } catch (error) {
      setError('장바구니 비우기 중 오류가 발생했습니다.')
    }
  }

  useEffect(() => {
    if (userId) {
      console.log('Cart useEffect - propCartItems:', propCartItems)
      // props로 받은 cartItems 사용
      setCartItems(propCartItems as CartItem[])
      setLoading(false)
    }
  }, [userId, propCartItems])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const calculateSubtotal = (item: CartItem) => {
    return item.product ? item.product.price * item.quantity : 0
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + calculateSubtotal(item), 0)
  }

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="spinner-pastel h-12 w-12"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-pastel-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <span className="text-4xl text-pastel-red-500">⚠️</span>
        </div>
        <p className="text-pastel-red-600 mb-4 text-lg">{error}</p>
        <button
          onClick={fetchCart}
          className="btn-pastel-primary"
        >
          다시 시도
        </button>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-32">
        <div className="w-40 h-40 bg-gradient-to-br from-pastel-lavender-100 to-pastel-mint-100 rounded-full mx-auto mb-8 flex items-center justify-center animate-float shadow-pastel-glow">
          <span className="text-7xl">🛒</span>
        </div>
        <h3 className="text-4xl font-bold text-pastel-gray-900 mb-6">장바구니가 비어있습니다</h3>
        <p className="text-pastel-gray-600 mb-12 text-2xl">상품을 추가해보세요! ✨</p>
        <div className="w-32 h-32 bg-gradient-to-br from-pastel-coral-200 to-pastel-peach-200 rounded-full mx-auto animate-bounce-gentle flex items-center justify-center shadow-coral-glow">
          <span className="text-4xl">✨</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="card-pastel shadow-pastel-xl">
        {/* 헤더 */}
        <div className="px-12 py-8 border-b border-pastel-200/50 bg-gradient-to-r from-pastel-coral-50 to-pastel-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pastel-coral-200 to-pastel-pink-200 rounded-3xl flex items-center justify-center shadow-coral-glow animate-float">
                <span className="text-3xl animate-bounce-gentle">🛒</span>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-pastel-coral-600 to-pastel-pink-600 bg-clip-text text-transparent">
                장바구니 ({totalItems}개)
              </h2>
            </div>
            <button
              onClick={clearCart}
              className="text-pastel-coral-600 hover:text-pastel-coral-800 text-lg font-bold bg-gradient-to-r from-pastel-coral-50 to-pastel-pink-50 hover:from-pastel-coral-100 hover:to-pastel-pink-100 px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-pastel"
            >
              🗑️ 장바구니 비우기
            </button>
          </div>
        </div>

        {/* 상품 목록 */}
        <div className="divide-y divide-pastel-200/50">
          {cartItems.map((item, index) => (
            <div key={item.id} className="px-12 py-8 hover:bg-gradient-to-r hover:from-pastel-50 hover:to-pastel-100 transition-all duration-300 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="flex items-center space-x-8">
                {/* 상품 이미지 */}
                <div className="flex-shrink-0 w-32 h-32 bg-gradient-to-br from-pastel-lavender-100 to-pastel-mint-100 rounded-3xl overflow-hidden shadow-pastel-lg group">
                  {item.product?.images && item.product.images.length > 0 ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-pastel-gray-400 text-4xl">
                      <span className="animate-bounce-gentle">📱</span>
                    </div>
                  )}
                </div>

                {/* 상품 정보 */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-pastel-gray-900 mb-3">
                    {item.product?.name}
                  </h3>
                  <p className="text-pastel-gray-600 mb-4 text-lg">
                    <span className="font-semibold">{item.product?.brand}</span> • {item.product?.category?.name}
                  </p>
                  <div className="flex items-center space-x-6">
                    <span className="text-3xl font-bold bg-gradient-to-r from-pastel-lavender-600 to-pastel-mint-600 bg-clip-text text-transparent">
                      {formatPrice(item.product?.price || 0)}원
                    </span>
                    {item.product?.original_price && item.product.original_price > (item.product?.price || 0) && (
                      <span className="text-lg text-pastel-gray-400 line-through">
                        {formatPrice(item.product.original_price)}원
                      </span>
                    )}
                  </div>
                </div>

                {/* 수량 조절 */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-12 h-12 rounded-3xl border-2 border-pastel-coral-200 bg-gradient-to-br from-pastel-coral-50 to-pastel-pink-50 flex items-center justify-center hover:bg-gradient-to-br hover:from-pastel-coral-100 hover:to-pastel-pink-100 hover:border-pastel-coral-300 transition-all duration-300 text-pastel-coral-600 hover:text-pastel-coral-700 transform hover:scale-110"
                  >
                    <span className="text-xl font-bold">−</span>
                  </button>
                  <span className="w-20 text-center text-2xl font-bold bg-gradient-to-r from-pastel-lavender-600 to-pastel-mint-600 bg-clip-text text-transparent">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-12 h-12 rounded-3xl border-2 border-pastel-mint-200 bg-gradient-to-br from-pastel-mint-50 to-pastel-green-50 flex items-center justify-center hover:bg-gradient-to-br hover:from-pastel-mint-100 hover:to-pastel-green-100 hover:border-pastel-mint-300 transition-all duration-300 text-pastel-mint-600 hover:text-pastel-mint-700 transform hover:scale-110"
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>

                {/* 소계 */}
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pastel-coral-600 to-pastel-peach-600 bg-clip-text text-transparent">
                    {formatPrice(calculateSubtotal(item))}원
                  </div>
                </div>

                {/* 삭제 버튼 */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-pastel-coral-500 hover:text-pastel-coral-700 p-4 hover:bg-gradient-to-br hover:from-pastel-coral-50 hover:to-pastel-pink-50 rounded-3xl transition-all duration-300 transform hover:scale-110 shadow-pastel hover:shadow-coral-glow"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 결제 정보 */}
        <div className="px-12 py-10 bg-gradient-to-r from-pastel-mint-50 to-pastel-green-50 rounded-b-3xl border-t border-pastel-200/50">
          <div className="flex items-center justify-between mb-8">
            <span className="text-2xl font-bold text-pastel-gray-900">총 상품 수</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-pastel-mint-600 to-pastel-green-600 bg-clip-text text-transparent">{totalItems}개</span>
          </div>
          <div className="flex items-center justify-between mb-10">
            <span className="text-3xl font-bold text-pastel-gray-900">총 결제금액</span>
            <span className="text-5xl font-bold bg-gradient-to-r from-pastel-mint-600 to-pastel-green-600 bg-clip-text text-transparent animate-glow">
              {formatPrice(calculateTotal())}원
            </span>
          </div>
          
          {/* 결제 버튼 */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8">
            <button
              onClick={onCheckout}
              className="flex-1 btn-pastel-success text-2xl py-5 px-10 rounded-3xl font-bold hover:shadow-mint-glow transform hover:scale-105 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-4">
                <span className="animate-pulse-soft">💳</span>
                주문하기
              </span>
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-10 py-5 border-2 border-pastel-mint-300 text-pastel-mint-700 bg-gradient-to-r from-white to-pastel-mint-50 rounded-3xl hover:from-pastel-mint-50 hover:to-pastel-mint-100 hover:border-pastel-mint-400 transition-all duration-300 font-bold text-xl transform hover:scale-105 shadow-pastel"
            >
              <span className="flex items-center justify-center gap-3">
                <span className="animate-wiggle">🛍️</span>
                쇼핑 계속하기
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
