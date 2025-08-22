import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import ProductList from '../components/shop/ProductList'
import Cart from '../components/shop/Cart'
import { Product } from '../lib/types'

export default function ShopPage() {
  const [currentView, setCurrentView] = useState<'products' | 'cart'>('products')
  const [cartItems, setCartItems] = useState<Product[]>([])
  const [cartItemCount, setCartItemCount] = useState(0)
  const [userId, setUserId] = useState<string>('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // 임시 사용자 ID 생성 (실제 앱에서는 인증 시스템에서 가져와야 함)
  useEffect(() => {
    let tempUserId = localStorage.getItem('temp-user-id')
    if (!tempUserId) {
      // 유효한 UUID v4 형식 생성
      tempUserId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
      localStorage.setItem('temp-user-id', tempUserId)
    }
    setUserId(tempUserId)
  }, [])

  // 로컬 스토리지에서 장바구니 데이터 가져오기
  const getCartFromStorage = () => {
    if (typeof window === 'undefined') return []
    const cartData = localStorage.getItem(`cart-${userId}`)
    return cartData ? JSON.parse(cartData) : []
  }

  // 로컬 스토리지에 장바구니 데이터 저장
  const saveCartToStorage = (items: Product[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(`cart-${userId}`, JSON.stringify(items))
  }

  // 장바구니 개수 업데이트
  const updateCartCount = () => {
    if (!userId) return
    
    const cartData = getCartFromStorage()
    const totalCount = cartData.reduce((total: number, item: any) => total + (item.quantity || 1), 0)
    setCartItemCount(totalCount)
    setCartItems(cartData)
  }

  // userId가 설정되면 장바구니 개수 업데이트
  useEffect(() => {
    if (userId) {
      updateCartCount()
    }
  }, [userId])

  const handleAddToCart = async (product: Product, quantity: number) => {
    if (!userId) {
      alert('사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    try {
      // API를 통해 장바구니에 상품 추가
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: product.id,
          quantity: quantity
        }),
      })

      const result = await response.json()

      if (result.success) {
        // 로컬 스토리지에 상품 추가
        const currentCart = getCartFromStorage()
        console.log('현재 장바구니:', currentCart)
        console.log('추가할 상품:', product, '수량:', quantity)
        
        const existingItem = currentCart.find((item: any) => item.id === product.id)
        
        let updatedCart
        if (existingItem) {
          console.log('기존 상품 수량 업데이트')
          updatedCart = currentCart.map((item: any) => 
            item.id === product.id 
              ? { ...item, quantity: (item.quantity || 1) + quantity }
              : item
          )
        } else {
          console.log('새 상품 추가')
          updatedCart = [...currentCart, { ...product, quantity }]
        }
        
        console.log('업데이트된 장바구니:', updatedCart)
        saveCartToStorage(updatedCart)
        setCartItems(updatedCart)
        updateCartCount()
        
        // 성공 토스트 메시지 표시
        setToastMessage(`${product.name}이(가) 장바구니에 추가되었습니다! 🛒✨`)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      } else {
        alert(`장바구니 추가 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('장바구니 추가 오류:', error)
      alert('장바구니에 상품을 추가하는 중 오류가 발생했습니다.')
    }
  }

  const handleCheckout = () => {
    // 주문 페이지로 이동하는 로직
    alert('주문 기능은 준비 중입니다.')
  }

  return (
    <>
      <Head>
        <title>전자제품 쇼핑 - 전자제품 쇼핑몰</title>
        <meta name="description" content="최신 전자제품을 합리적인 가격으로 만나보세요" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-pastel">
        {/* 헤더 */}
        <header className="bg-white/90 backdrop-blur-md shadow-pastel-xl border-b border-pastel-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {/* 로고 */}
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-pastel-lavender-300 to-pastel-mint-300 rounded-xl flex items-center justify-center shadow-pastel-glow group-hover:shadow-pastel-xl transition-all duration-300">
                  <span className="text-lg">🏪</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-pastel-lavender-600 to-pastel-mint-600 bg-clip-text text-transparent">
                    전자제품 쇼핑몰
                  </h1>
                </div>
              </Link>
              
              {/* 네비게이션 링크 */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link 
                  href="/" 
                  className="text-pastel-gray-700 hover:text-pastel-lavender-600 font-medium transition-colors duration-300 flex items-center space-x-1"
                >
                  <span>🏠</span>
                  <span>홈</span>
                </Link>
                <Link 
                  href="/shop" 
                  className="text-pastel-lavender-600 font-bold border-b-2 border-pastel-lavender-600 pb-1 transition-all duration-300 flex items-center space-x-1"
                >
                  <span>🛒</span>
                  <span>쇼핑</span>
                </Link>
                <Link 
                  href="/inquiry" 
                  className="text-pastel-gray-700 hover:text-pastel-lavender-600 font-medium transition-colors duration-300 flex items-center space-x-1"
                >
                  <span>💬</span>
                  <span>문의</span>
                </Link>
                <Link 
                  href="/auth" 
                  className="text-pastel-gray-700 hover:text-pastel-lavender-600 font-medium transition-colors duration-300 flex items-center space-x-1"
                >
                  <span>🔐</span>
                  <span>로그인</span>
                </Link>
                <Link 
                  href="/admin" 
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-1"
                >
                  <span>👨‍💼</span>
                  <span>관리자</span>
                </Link>
              </nav>
              
              {/* 쇼핑 탭 버튼들 */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentView('products')}
                  className={`px-4 py-2 text-sm font-bold rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ${
                    currentView === 'products'
                      ? 'bg-gradient-to-r from-pastel-lavender-200 to-pastel-blue-200 text-pastel-lavender-700 shadow-pastel-glow'
                      : 'text-pastel-gray-600 hover:text-pastel-gray-800 hover:bg-pastel-100'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <span>📋</span>
                    <span className="hidden sm:inline">상품</span>
                  </span>
                </button>
                <button
                  onClick={() => {
                    setCurrentView('cart')
                    const cartData = getCartFromStorage()
                    setCartItems(cartData)
                    updateCartCount()
                  }}
                  className={`px-4 py-2 text-sm font-bold rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 relative ${
                    currentView === 'cart'
                      ? 'bg-gradient-to-r from-pastel-coral-200 to-pastel-pink-200 text-pastel-coral-700 shadow-coral-glow'
                      : 'text-pastel-gray-600 hover:text-pastel-gray-800 hover:bg-pastel-100'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <span>🛒</span>
                    <span className="hidden sm:inline">장바구니</span>
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse-soft">
                        {cartItemCount}
                      </span>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="py-8">
          {currentView === 'products' ? (
            <ProductList onAddToCart={handleAddToCart} />
          ) : (
            userId ? (
              <Cart userId={userId} onCheckout={handleCheckout} onCartUpdate={updateCartCount} cartItems={cartItems} />
            ) : (
              <div className="flex justify-center items-center py-20">
                <div className="spinner-pastel h-12 w-12"></div>
              </div>
            )
          )}
        </main>

        {/* 토스트 알림 */}
        {showToast && (
          <div className="fixed top-4 right-4 z-50 animate-slide-up">
            <div className="bg-gradient-to-r from-pastel-mint-100 to-pastel-green-100 border-2 border-pastel-mint-200 rounded-3xl p-6 shadow-mint-glow backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <span className="text-2xl animate-bounce-gentle">✅</span>
                <p className="text-pastel-mint-700 font-bold text-lg">{toastMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* 푸터 */}
        <footer className="bg-gradient-to-r from-white/95 to-pastel-50/95 backdrop-blur-md border-t border-pastel-200/50 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-pastel-lavender-200 to-pastel-mint-200 rounded-3xl flex items-center justify-center mr-4 shadow-pastel-glow animate-float">
                    <span className="text-2xl">🛍️</span>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-pastel-lavender-600 to-pastel-mint-600 bg-clip-text text-transparent">전자제품 쇼핑몰</h3>
                </div>
                <p className="text-pastel-gray-600 text-lg leading-relaxed">
                  전통 제품의 아름다움을 현대적으로 ✨<br />
                  최고 품질의 전자제품을 제공합니다.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-pastel-gray-900 mb-6 flex items-center">
                  <span className="w-3 h-3 bg-pastel-lavender-400 rounded-full mr-3 animate-pulse-soft"></span>
                  고객지원 💬
                </h4>
                <ul className="space-y-4 text-lg text-pastel-gray-600">
                  <li className="flex items-center group">
                    <span className="w-2 h-2 bg-pastel-lavender-300 rounded-full mr-3 group-hover:bg-pastel-lavender-400 transition-colors duration-300"></span>
                    <span className="font-semibold group-hover:text-pastel-lavender-600 transition-colors duration-300">고객센터: 1588-0000</span>
                  </li>
                  <li className="flex items-center group">
                    <span className="w-2 h-2 bg-pastel-lavender-300 rounded-full mr-3 group-hover:bg-pastel-lavender-400 transition-colors duration-300"></span>
                    <span className="font-semibold group-hover:text-pastel-lavender-600 transition-colors duration-300">이메일: support@jeonjejepum.com</span>
                  </li>
                  <li className="flex items-center group">
                    <span className="w-2 h-2 bg-pastel-lavender-300 rounded-full mr-3 group-hover:bg-pastel-lavender-400 transition-colors duration-300"></span>
                    <span className="font-semibold group-hover:text-pastel-lavender-600 transition-colors duration-300">운영시간: 평일 09:00-18:00</span>
                  </li>
                  <li className="flex items-center group">
                    <span className="w-2 h-2 bg-pastel-coral-300 rounded-full mr-3 group-hover:bg-pastel-coral-400 transition-colors duration-300"></span>
                    <Link href="/inquiry" className="font-semibold group-hover:text-pastel-coral-600 transition-colors duration-300 hover:underline">
                      💬 온라인 문의게시판
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-pastel-gray-900 mb-6 flex items-center">
                  <span className="w-3 h-3 bg-pastel-mint-400 rounded-full mr-3 animate-pulse-soft"></span>
                  배송안내 🚚
                </h4>
                <ul className="space-y-4 text-lg text-pastel-gray-600">
                  <li className="flex items-center group">
                    <span className="w-2 h-2 bg-pastel-mint-300 rounded-full mr-3 group-hover:bg-pastel-mint-400 transition-colors duration-300"></span>
                    <span className="font-semibold group-hover:text-pastel-mint-600 transition-colors duration-300">무료배송: 5만원 이상</span>
                  </li>
                  <li className="flex items-center group">
                    <span className="w-2 h-2 bg-pastel-mint-300 rounded-full mr-3 group-hover:bg-pastel-mint-400 transition-colors duration-300"></span>
                    <span className="font-semibold group-hover:text-pastel-mint-600 transition-colors duration-300">배송기간: 1-3일</span>
                  </li>
                  <li className="flex items-center group">
                    <span className="w-2 h-2 bg-pastel-mint-300 rounded-full mr-3 group-hover:bg-pastel-mint-400 transition-colors duration-300"></span>
                    <span className="font-semibold group-hover:text-pastel-mint-600 transition-colors duration-300">교환/반품: 7일 이내</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-pastel-gray-900 mb-6 flex items-center">
                  <span className="w-3 h-3 bg-pastel-coral-400 rounded-full mr-3 animate-pulse-soft"></span>
                  회사정보 🏢
                </h4>
                <ul className="space-y-4 text-lg text-pastel-gray-600">
                  <li className="flex items-center group">
                    <span className="w-2 h-2 bg-pastel-coral-300 rounded-full mr-3 group-hover:bg-pastel-coral-400 transition-colors duration-300"></span>
                    <span className="font-semibold group-hover:text-pastel-coral-600 transition-colors duration-300">상호: 전자제품 주식회사</span>
                  </li>
                  <li className="flex items-center group">
                    <span className="w-2 h-2 bg-pastel-coral-300 rounded-full mr-3 group-hover:bg-pastel-coral-400 transition-colors duration-300"></span>
                    <span className="font-semibold group-hover:text-pastel-coral-600 transition-colors duration-300">대표: 홍길동</span>
                  </li>
                  <li className="flex items-center group">
                    <span className="w-2 h-2 bg-pastel-coral-300 rounded-full mr-3 group-hover:bg-pastel-coral-400 transition-colors duration-300"></span>
                    <span className="font-semibold group-hover:text-pastel-coral-600 transition-colors duration-300">사업자등록번호: 123-45-67890</span>
                  </li>
                  <li className="flex items-center group">
                    <span className="w-2 h-2 bg-pastel-coral-300 rounded-full mr-3 group-hover:bg-pastel-coral-400 transition-colors duration-300"></span>
                    <span className="font-semibold group-hover:text-pastel-coral-600 transition-colors duration-300">주소: 서울특별시 강남구 테헤란로 123</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-pastel-200/50 mt-12 pt-12 text-center">
              <p className="text-xl text-pastel-gray-500 font-semibold">
                © 2024 전자제품 쇼핑몰. All rights reserved. ✨
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
