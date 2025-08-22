import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import SignUpForm from '../components/auth/SignUpForm'
import SignInForm from '../components/auth/SignInForm'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)

  const handleSignUpSuccess = (userData: any) => {
    setUser(userData)
    setIsLoggedIn(true)
    setIsSignUp(false)
  }

  const handleSignInSuccess = (userData: any) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    // localStorage에서 인증 정보 제거
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth')
    }
    setUser(null)
    setIsLoggedIn(false)
  }

  if (isLoggedIn && user) {
    return (
      <>
        <Head>
          <title>로그인 성공 - 전자제품 쇼핑몰</title>
          <meta name="description" content="로그인에 성공했습니다" />
        </Head>

        <div className="min-h-screen bg-gradient-pastel flex items-center justify-center relative overflow-hidden">
          {/* 성공 배경 효과 */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-pastel-mint-200/50 rounded-full blur-2xl animate-pulse-soft"></div>
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-pastel-lavender-200/50 rounded-full blur-2xl animate-pulse-soft" style={{animationDelay: '1s'}}></div>
          </div>
          
          <div className="card-pastel p-16 text-center max-w-lg mx-auto shadow-pastel-xl relative z-10">
            <div className="w-32 h-32 bg-gradient-to-br from-pastel-mint-200 to-pastel-green-200 rounded-full mx-auto mb-8 flex items-center justify-center animate-bounce-gentle shadow-mint-glow">
              <span className="text-6xl">✅</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pastel-mint-600 to-pastel-green-600 bg-clip-text text-transparent mb-6">
              로그인 성공! 🎉
            </h1>
            <p className="text-pastel-gray-600 mb-10 text-2xl">
              안녕하세요, <span className="font-bold text-pastel-lavender-600">{user.username}</span>님! ✨
            </p>
            <div className="space-y-6">
              <button
                onClick={() => window.location.href = '/shop'}
                className="btn-pastel-primary w-full py-5 text-2xl font-bold group"
              >
                <span className="flex items-center justify-center gap-4">
                  <span className="animate-wiggle">🛍️</span>
                  쇼핑 시작하기
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="btn-pastel-outline w-full py-5 text-2xl font-bold"
              >
                <span className="flex items-center justify-center gap-4">
                  <span className="animate-pulse-soft">🔓</span>
                  로그아웃
                </span>
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{isSignUp ? '회원가입' : '로그인'} - 전자제품 쇼핑몰</title>
        <meta name="description" content={isSignUp ? '새로운 계정을 만드세요' : '기존 계정으로 로그인하세요'} />
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
                  className="text-pastel-gray-700 hover:text-pastel-lavender-600 font-medium transition-colors duration-300 flex items-center space-x-1"
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
                  className="text-pastel-lavender-600 font-bold border-b-2 border-pastel-lavender-600 pb-1 transition-all duration-300 flex items-center space-x-1"
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
                </Link>
                <Link 
                  href="/inquiry" 
                  className="btn-pastel-secondary px-3 py-2 text-sm flex items-center space-x-1"
                >
                  <span>💬</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 relative">
        {/* 배경 장식 요소들 */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-24 h-24 bg-pastel-lavender-200/40 rounded-full blur-xl animate-float"></div>
          <div className="absolute top-1/3 right-20 w-32 h-32 bg-pastel-mint-200/40 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-pastel-coral-200/40 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="w-full max-w-lg relative z-10">
          {/* 로고 및 제목 */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="w-28 h-28 bg-gradient-to-br from-pastel-lavender-300 to-pastel-coral-300 rounded-full mx-auto mb-8 flex items-center justify-center shadow-pastel-xl animate-float relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="text-4xl relative z-10 animate-bounce-gentle">🔐</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pastel-lavender-600 via-pastel-coral-600 to-pastel-mint-600 bg-clip-text text-transparent mb-4 font-korean">
              {isSignUp ? '회원가입' : '로그인'}
            </h1>
            <p className="text-pastel-gray-600 text-xl">
              {isSignUp ? '새로운 계정을 만들어보세요 ✨' : '기존 계정으로 로그인하세요 🌟'}
            </p>
          </div>

          {/* 폼 */}
          <div className="card-pastel p-12 shadow-pastel-xl animate-slide-up">
            {isSignUp ? (
              <SignUpForm onSuccess={handleSignUpSuccess} />
            ) : (
              <SignInForm onSuccess={handleSignInSuccess} />
            )}

            {/* 전환 버튼 */}
            <div className="mt-8 pt-8 border-t border-pastel-200/50 text-center">
              <p className="text-pastel-gray-600 mb-6 text-lg">
                {isSignUp ? '이미 계정이 있으신가요? 🤔' : '계정이 없으신가요? 🆕'}
              </p>
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-pastel-lavender-600 hover:text-pastel-lavender-700 font-bold text-xl hover:underline transition-all duration-300 transform hover:scale-105 px-6 py-3 rounded-2xl hover:bg-pastel-lavender-50"
              >
                {isSignUp ? '🔑 로그인하기' : '✨ 회원가입하기'}
              </button>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="mt-8 text-center">
            <p className="text-lg text-pastel-gray-500 leading-relaxed">
              계정 생성 시 <span className="font-bold text-pastel-lavender-600">이용약관</span>과{' '}
              <span className="font-bold text-pastel-coral-600">개인정보처리방침</span>에 동의하게 됩니다.
            </p>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}
