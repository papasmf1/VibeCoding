import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()
  const [showRedirect, setShowRedirect] = useState(false)

  useEffect(() => {
    // 3초 후 리다이렉트 안내 표시
    const timer = setTimeout(() => {
      setShowRedirect(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <Head>
        <title>전자제품 쇼핑몰</title>
        <meta name="description" content="전통 제품의 온라인 거래 플랫폼" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-pastel relative overflow-hidden">
        {/* 헤더 네비게이션 */}
        <header className="bg-white/90 backdrop-blur-md shadow-pastel-xl border-b border-pastel-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* 로고 */}
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-pastel-lavender-400 to-pastel-mint-400 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-pastel-glow transform group-hover:scale-110 transition-all duration-300">
                  🏪
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
                  className="text-pastel-lavender-600 font-bold border-b-2 border-pastel-lavender-600 pb-1 transition-all duration-300 flex items-center space-x-1"
                >
                  <span>🏠</span>
                  <span>홈</span>
                </Link>
                <Link 
                  href="/shop" 
                  className="text-pastel-gray-700 hover:text-pastel-lavender-600 font-medium transition-colors duration-300 flex items-center space-x-1"
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
              
              {/* 모바일 메뉴 */}
              <div className="md:hidden flex items-center space-x-2">
                <Link 
                  href="/shop" 
                  className="btn-pastel-primary px-3 py-2 text-sm flex items-center space-x-1"
                >
                  <span>🛒</span>
                  <span className="hidden sm:inline">쇼핑</span>
                </Link>
                <Link 
                  href="/inquiry" 
                  className="btn-pastel-secondary px-3 py-2 text-sm flex items-center space-x-1"
                >
                  <span>💬</span>
                  <span className="hidden sm:inline">문의</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] relative">
        {/* 배경 장식 요소들 */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-pastel-lavender-200/30 rounded-full blur-xl animate-float"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-pastel-mint-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-pastel-peach-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-pastel-coral-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        <div className="text-center max-w-5xl mx-auto px-4 relative z-10">
          {/* 로고 및 메인 타이틀 */}
          <div className="mb-16 animate-fade-in">
            <div className="mb-8 animate-float">
              <div className="w-32 h-32 bg-gradient-to-br from-pastel-lavender-300 to-pastel-mint-300 rounded-full mx-auto mb-8 flex items-center justify-center shadow-pastel-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="text-5xl relative z-10 animate-bounce-gentle">🛍️</span>
              </div>
            </div>
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-pastel-lavender-600 via-pastel-mint-600 to-pastel-peach-600 bg-clip-text text-transparent mb-8 font-korean animate-glow">
              전자제품
            </h1>
            <p className="text-3xl md:text-4xl text-pastel-gray-700 mb-6 font-semibold">
              전통 제품의 아름다움을 현대적으로 ✨
            </p>
            <p className="text-xl md:text-2xl text-pastel-gray-600 leading-relaxed">
              최고 품질의 전자제품을 합리적인 가격으로 만나보세요
            </p>
          </div>

          {/* 주요 기능 소개 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="card-pastel card-pastel-hover p-10 animate-slide-up group">
              <div className="text-pastel-lavender-500 mb-6 animate-bounce-gentle">
                <div className="w-20 h-20 bg-gradient-to-br from-pastel-lavender-100 to-pastel-blue-100 rounded-3xl mx-auto flex items-center justify-center shadow-pastel-glow group-hover:shadow-mint-glow transition-all duration-500">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-pastel-gray-900 mb-4">다양한 상품 🎁</h3>
              <p className="text-pastel-gray-600 text-lg leading-relaxed">
                스마트폰, 노트북, 태블릿 등<br />
                최신 전자제품을 한눈에
              </p>
            </div>

            <div className="card-pastel card-pastel-hover p-10 animate-slide-up group" style={{animationDelay: '0.1s'}}>
              <div className="text-pastel-mint-500 mb-6 animate-bounce-gentle">
                <div className="w-20 h-20 bg-gradient-to-br from-pastel-mint-100 to-pastel-green-100 rounded-3xl mx-auto flex items-center justify-center shadow-mint-glow group-hover:shadow-coral-glow transition-all duration-500">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-pastel-gray-900 mb-4">품질 보장 ✅</h3>
              <p className="text-pastel-gray-600 text-lg leading-relaxed">
                정품 인증 및 품질 검증을<br />
                통해 안전한 구매 보장
              </p>
            </div>

            <div className="card-pastel card-pastel-hover p-10 animate-slide-up group" style={{animationDelay: '0.2s'}}>
              <div className="text-pastel-coral-500 mb-6 animate-bounce-gentle">
                <div className="w-20 h-20 bg-gradient-to-br from-pastel-coral-100 to-pastel-peach-100 rounded-3xl mx-auto flex items-center justify-center shadow-coral-glow group-hover:shadow-peach-glow transition-all duration-500">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-pastel-gray-900 mb-4">빠른 배송 🚀</h3>
              <p className="text-pastel-gray-600 text-lg leading-relaxed">
                전국 1-3일 배송 및<br />
                무료배송 서비스 제공
              </p>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-12">
            <Link
              href="/shop"
              className="btn-pastel-primary text-2xl px-12 py-5 font-bold group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <span className="animate-wiggle">🛍️</span>
                쇼핑 시작하기
              </span>
            </Link>
            <Link
              href="/auth"
              className="btn-pastel-outline text-2xl px-12 py-5 font-bold group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <span className="animate-pulse-soft">🔐</span>
                로그인/회원가입
              </span>
            </Link>
                      <Link
            href="/inquiry"
            className="btn-pastel-secondary text-2xl px-12 py-5 font-bold group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <span className="animate-wiggle">💬</span>
              고객 문의
            </span>
          </Link>
          
          <Link
            href="/admin"
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white text-2xl px-12 py-5 font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <span className="animate-pulse-soft">👨‍💼</span>
              관리자
            </span>
          </Link>
          </div>

          {/* 추가 정보 */}
          <div className="card-pastel p-12 shadow-pastel-xl">
            <h3 className="text-3xl font-bold text-pastel-gray-900 mb-10 text-center">
              🎯 주요 상품 카테고리
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              <div className="text-center group cursor-pointer">
                <div className="w-20 h-20 bg-gradient-to-br from-pastel-lavender-100 to-pastel-blue-100 rounded-3xl mx-auto mb-4 flex items-center justify-center text-3xl group-hover:shadow-pastel-glow transition-all duration-500 transform group-hover:scale-110 group-hover:-translate-y-2">
                  📱
                </div>
                <div className="font-bold text-pastel-gray-700 text-lg group-hover:text-pastel-lavender-600 transition-colors duration-300">스마트폰</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="w-20 h-20 bg-gradient-to-br from-pastel-mint-100 to-pastel-green-100 rounded-3xl mx-auto mb-4 flex items-center justify-center text-3xl group-hover:shadow-mint-glow transition-all duration-500 transform group-hover:scale-110 group-hover:-translate-y-2">
                  💻
                </div>
                <div className="font-bold text-pastel-gray-700 text-lg group-hover:text-pastel-mint-600 transition-colors duration-300">노트북</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="w-20 h-20 bg-gradient-to-br from-pastel-coral-100 to-pastel-pink-100 rounded-3xl mx-auto mb-4 flex items-center justify-center text-3xl group-hover:shadow-coral-glow transition-all duration-500 transform group-hover:scale-110 group-hover:-translate-y-2">
                  📱
                </div>
                <div className="font-bold text-pastel-gray-700 text-lg group-hover:text-pastel-coral-600 transition-colors duration-300">태블릿</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="w-20 h-20 bg-gradient-to-br from-pastel-peach-100 to-pastel-orange-100 rounded-3xl mx-auto mb-4 flex items-center justify-center text-3xl group-hover:shadow-peach-glow transition-all duration-500 transform group-hover:scale-110 group-hover:-translate-y-2">
                  📺
                </div>
                <div className="font-bold text-pastel-gray-700 text-lg group-hover:text-pastel-peach-600 transition-colors duration-300">가전제품</div>
              </div>
              <div className="text-center group cursor-pointer col-span-2 md:col-span-1">
                <div className="w-20 h-20 bg-gradient-to-br from-pastel-yellow-100 to-pastel-peach-100 rounded-3xl mx-auto mb-4 flex items-center justify-center text-3xl group-hover:shadow-peach-glow transition-all duration-500 transform group-hover:scale-110 group-hover:-translate-y-2">
                  🎧
                </div>
                <div className="font-bold text-pastel-gray-700 text-lg group-hover:text-pastel-yellow-600 transition-colors duration-300">액세서리</div>
              </div>
            </div>
          </div>

          {/* 리다이렉트 안내 */}
          {showRedirect && (
            <div className="mt-12 p-8 bg-gradient-to-r from-pastel-lavender-50 to-pastel-mint-50 border-2 border-pastel-lavender-200 rounded-3xl animate-slide-up shadow-pastel-glow">
              <p className="text-pastel-lavender-800 text-xl font-semibold text-center">
                🚀 <strong>쇼핑을 시작하려면</strong> 위의 "쇼핑 시작하기" 버튼을 클릭하세요!
              </p>
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  )
}
