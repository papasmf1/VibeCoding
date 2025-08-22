import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface Inquiry {
  id: string
  title: string
  content: string
  author: string
  email: string
  status: 'pending' | 'answered' | 'closed'
  category: '일반문의' | '배송문의' | '교환/환불' | '기타'
  created_at: string
  view_count: number
  answer?: string
  answered_at?: string
}

export default function InquiryPage() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<'list' | 'write' | 'detail'>('list')
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<string>('')

  // 로컬 스토리지에서 문의 목록 가져오기
  const loadInquiries = () => {
    try {
      console.log('문의 목록 로드 시작')
      
      if (typeof window !== 'undefined') {
        const savedInquiries = localStorage.getItem('inquiries')
        console.log('로컬 스토리지 원본 데이터:', savedInquiries)
        
        const inquiryList = savedInquiries ? JSON.parse(savedInquiries) : []
        console.log('파싱된 문의 목록:', inquiryList)
        
        setInquiries(inquiryList)
        console.log('문의 목록 상태 업데이트 완료')
      }
    } catch (error) {
      console.error('문의 목록 로드 오류:', error)
      setInquiries([])
    }
  }

  // 로컬 스토리지에 문의 목록 저장
  const saveInquiries = (inquiryList: Inquiry[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('inquiries', JSON.stringify(inquiryList))
      } catch (error) {
        console.error('문의 목록 저장 오류:', error)
      }
    }
  }

  // 로그인 상태 확인
  const checkAuthStatus = () => {
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('auth')
      console.log('저장된 인증 데이터:', authData) // 디버깅용
      
      if (authData) {
        try {
          const auth = JSON.parse(authData)
          console.log('파싱된 인증 데이터:', auth) // 디버깅용
          
          // API 응답 구조에 맞게 수정: { user: {...}, session: {...} }
          if (auth.user) {
            setIsLoggedIn(true)
            setCurrentUser(auth.user.username || auth.user.email || '사용자')
            console.log('로그인 상태 설정 완료:', auth.user.username || auth.user.email)
          } else {
            // 이전 버전과의 호환성을 위해
            setIsLoggedIn(false)
            setCurrentUser('')
            console.log('사용자 정보가 없음')
          }
        } catch (error) {
          console.error('인증 데이터 파싱 오류:', error)
          setIsLoggedIn(false)
          setCurrentUser('')
        }
      } else {
        console.log('저장된 인증 데이터 없음')
        setIsLoggedIn(false)
        setCurrentUser('')
      }
    }
  }

  // 페이징 계산
  const totalPages = Math.ceil(inquiries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentInquiries = inquiries.slice(startIndex, endIndex)

  // 조회수 증가
  const increaseViewCount = (inquiryId: string) => {
    const updatedInquiries = inquiries.map(inquiry => {
      if (inquiry.id === inquiryId) {
        return { ...inquiry, view_count: inquiry.view_count + 1 }
      }
      return inquiry
    })
    setInquiries(updatedInquiries)
    saveInquiries(updatedInquiries)
  }

  useEffect(() => {
    loadInquiries()
    checkAuthStatus()
    
    // 페이지가 포커스될 때마다 로그인 상태 재확인
    const handleFocus = () => {
      checkAuthStatus()
    }
    
    window.addEventListener('focus', handleFocus)
    
    // 개발용: 샘플 문의가 없으면 여러 개 추가
    const addSampleInquiries = () => {
      if (typeof window !== 'undefined') {
        const existing = localStorage.getItem('inquiries')
        if (!existing || JSON.parse(existing).length === 0) {
          const sampleInquiries: Inquiry[] = [
            {
              id: 'sample-inquiry-1',
              title: '배송 관련 문의',
              content: '주문한 상품의 배송 현황을 확인하고 싶습니다. 언제쯤 받을 수 있을까요?',
              author: '김고객',
              email: 'customer@example.com',
              status: 'answered',
              category: '배송문의',
              view_count: 15,
              created_at: new Date(Date.now() - 86400000).toISOString(), // 1일 전
              answer: '안녕하세요! 주문하신 상품은 현재 배송 준비 중이며, 내일 오후에 발송 예정입니다.',
              answered_at: new Date().toISOString()
            },
            {
              id: 'sample-inquiry-2',
              title: '제품 교환 요청',
              content: '구매한 제품에 불량이 있어서 교환을 요청드립니다.',
              author: '이고객',
              email: 'customer2@example.com',
              status: 'pending',
              category: '교환/환불',
              view_count: 8,
              created_at: new Date(Date.now() - 43200000).toISOString() // 12시간 전
            },
            {
              id: 'sample-inquiry-3',
              title: 'A/S 문의드립니다',
              content: '제품 사용 중 문제가 발생했습니다. A/S 가능한지 문의드립니다.',
              author: '박고객',
              email: 'customer3@example.com',
              status: 'pending',
              category: '일반문의',
              view_count: 23,
              created_at: new Date(Date.now() - 172800000).toISOString() // 2일 전
            },
            {
              id: 'sample-inquiry-4',
              title: '제품 사용법 문의',
              content: '새로 구매한 제품의 사용법을 자세히 알고 싶습니다.',
              author: '최고객',
              email: 'customer4@example.com',
              status: 'answered',
              category: '기타',
              view_count: 31,
              created_at: new Date(Date.now() - 259200000).toISOString(), // 3일 전
              answer: '사용법은 제품 박스 안에 포함된 매뉴얼을 참고해주세요. 추가 문의사항이 있으시면 언제든 연락주세요!',
              answered_at: new Date(Date.now() - 86400000).toISOString()
            },
            {
              id: 'sample-inquiry-5',
              title: '배송지 변경 요청',
              content: '주문 후 배송지를 변경하고 싶습니다. 가능한가요?',
              author: '정고객',
              email: 'customer5@example.com',
              status: 'closed',
              category: '배송문의',
              view_count: 12,
              created_at: new Date(Date.now() - 345600000).toISOString() // 4일 전
            }
          ]
          
          localStorage.setItem('inquiries', JSON.stringify(sampleInquiries))
          setInquiries(sampleInquiries)
          console.log('샘플 문의들 추가됨')
        }
      }
    }
    
    setTimeout(addSampleInquiries, 1000)
    
    // cleanup 함수
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // 문의 목록 새로고침
  const refreshInquiries = () => {
    loadInquiries()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pastel-50 to-pastel-100">
      <Head>
        <title>고객 문의 게시판 - 전자제품 쇼핑몰</title>
        <meta name="description" content="고객 문의사항을 등록하고 확인하세요" />
      </Head>

      {/* 헤더 */}
      <header className="bg-white/90 backdrop-blur-md shadow-pastel-xl border-b border-pastel-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 로고 */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-pastel-300 to-pastel-400 rounded-xl flex items-center justify-center shadow-pastel-glow group-hover:shadow-pastel-xl transition-all duration-300">
                <span className="text-lg">🏪</span>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-pastel-600 to-pastel-700 bg-clip-text text-transparent">
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
                className="text-pastel-lavender-600 font-bold border-b-2 border-pastel-lavender-600 pb-1 transition-all duration-300 flex items-center space-x-1"
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
            
            {/* 로그인 상태 및 모바일 메뉴 */}
            <div className="flex items-center space-x-3">
              {isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-pastel-600 font-medium hidden md:inline">
                    👤 {currentUser}님
                  </span>
                  <button
                    onClick={() => {
                      localStorage.removeItem('auth')
                      checkAuthStatus()
                      setToastMessage('로그아웃 완료! 👋')
                      setShowToast(true)
                      setTimeout(() => setShowToast(false), 3000)
                    }}
                    className="btn-pastel-secondary px-3 py-1 text-xs font-semibold"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const testAuth = {
                        user: {
                          id: 'test-user-1',
                          username: '테스트사용자',
                          email: 'test@example.com'
                        },
                        session: {
                          user_id: 'test-user-1',
                          login_time: new Date().toISOString()
                        }
                      }
                      localStorage.setItem('auth', JSON.stringify(testAuth))
                      checkAuthStatus()
                      setToastMessage('테스트 로그인 완료! 🎉')
                      setShowToast(true)
                      setTimeout(() => setShowToast(false), 3000)
                    }}
                    className="btn-pastel-primary px-3 py-2 text-sm font-semibold hidden md:inline-block"
                  >
                    테스트 로그인
                  </button>
                  <Link 
                    href="/auth"
                    className="btn-pastel-secondary px-3 py-2 text-sm font-semibold"
                  >
                    <span className="md:hidden">🔐</span>
                    <span className="hidden md:inline">로그인</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentView === 'list' && (
          <div className="bg-white rounded-2xl shadow-pastel-xl border border-pastel-200/30 overflow-hidden">
            {/* 게시판 헤더 */}
            <div className="bg-gradient-to-r from-pastel-50 to-pastel-100 px-6 py-4 border-b border-pastel-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💬</span>
                  <h2 className="text-2xl font-bold text-pastel-700">고객 문의 게시판</h2>
                  <span className="bg-pastel-200 text-pastel-700 px-3 py-1 rounded-full text-sm font-medium">
                    총 {inquiries.length}개
                  </span>
                </div>
                
                {isLoggedIn ? (
                  <button
                    onClick={() => setCurrentView('write')}
                    className="btn-pastel-primary px-6 py-3 font-bold transform hover:scale-105 transition-all duration-300"
                  >
                    <span className="flex items-center space-x-2">
                      <span>✍️</span>
                      <span>글쓰기</span>
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setToastMessage('로그인 후 글을 작성할 수 있습니다.')
                      setShowToast(true)
                      setTimeout(() => setShowToast(false), 3000)
                    }}
                    className="btn-pastel-secondary px-6 py-3 font-bold"
                  >
                    <span className="flex items-center space-x-2">
                      <span>🔒</span>
                      <span>글쓰기</span>
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* 게시판 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-pastel-50 border-b border-pastel-200/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-pastel-700 w-20">번호</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-pastel-700 w-24">분류</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-pastel-700">제목</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-pastel-700 w-32">작성자</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-pastel-700 w-20">조회</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-pastel-700 w-32">작성일</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-pastel-700 w-20">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pastel-200/30">
                  {currentInquiries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center space-y-4">
                          <span className="text-6xl animate-float">📝</span>
                          <p className="text-xl font-semibold text-pastel-600">등록된 문의가 없습니다</p>
                          <p className="text-pastel-500">첫 번째 문의를 작성해보세요!</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentInquiries.map((inquiry, index) => (
                      <tr 
                        key={inquiry.id}
                        className="hover:bg-pastel-50/50 transition-colors duration-200 cursor-pointer"
                        onClick={() => {
                          increaseViewCount(inquiry.id)
                          setSelectedInquiry(inquiry)
                          setCurrentView('detail')
                        }}
                      >
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {inquiries.length - startIndex - index}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            inquiry.category === '일반문의' ? 'bg-blue-100 text-blue-600' :
                            inquiry.category === '배송문의' ? 'bg-green-100 text-green-600' :
                            inquiry.category === '교환/환불' ? 'bg-orange-100 text-orange-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {inquiry.category}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 hover:text-pastel-600 transition-colors">
                              {inquiry.title}
                            </span>
                            {inquiry.answer && (
                              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">답변완료</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {inquiry.author}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {inquiry.view_count}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {new Date(inquiry.created_at).toLocaleDateString('ko-KR', {
                            month: 'numeric',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            inquiry.status === 'answered' ? 'bg-green-100 text-green-600' :
                            inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {inquiry.status === 'answered' ? '답변완료' :
                             inquiry.status === 'pending' ? '답변대기' : '종료'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이징 */}
            {totalPages > 1 && (
              <div className="bg-pastel-50/50 px-6 py-4 border-t border-pastel-200/50">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-pastel-600 hover:bg-pastel-50 shadow-sm hover:shadow-md'
                    }`}
                  >
                    이전
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === i + 1
                          ? 'bg-pastel-500 text-white shadow-pastel-glow'
                          : 'bg-white text-pastel-600 hover:bg-pastel-50 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-pastel-600 hover:bg-pastel-50 shadow-sm hover:shadow-md'
                    }`}
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 글쓰기 폼 */}
        {currentView === 'write' && (
          <InquiryForm 
            onSubmit={refreshInquiries}
            setInquiries={setInquiries}
            inquiries={inquiries}
            setToastMessage={setToastMessage}
            setShowToast={setShowToast}
            setCurrentView={setCurrentView}
            currentUser={currentUser}
          />
        )}

        {/* 상세보기 */}
        {currentView === 'detail' && selectedInquiry && (
          <InquiryDetail 
            inquiry={selectedInquiry}
            onBack={() => setCurrentView('list')}
          />
        )}

        {/* 토스트 알림 */}
        {showToast && (
          <div className="fixed top-8 right-8 z-50">
            <div className="bg-white/95 backdrop-blur-md border border-pastel-200/50 rounded-2xl shadow-pastel-xl p-6 animate-slide-up">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-mint-glow animate-pulse-soft">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">{toastMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// 문의 작성 폼 컴포넌트
function InquiryForm({ 
  onSubmit,
  setInquiries,
  inquiries,
  setToastMessage,
  setShowToast,
  setCurrentView,
  currentUser
}: { 
  onSubmit: () => void
  setInquiries: React.Dispatch<React.SetStateAction<Inquiry[]>>
  inquiries: Inquiry[]
  setToastMessage: React.Dispatch<React.SetStateAction<string>>
  setShowToast: React.Dispatch<React.SetStateAction<boolean>>
  setCurrentView: React.Dispatch<React.SetStateAction<'list' | 'write' | 'detail'>>
  currentUser: string
}) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: currentUser || '',
    email: '',
    category: '일반문의' as '일반문의' | '배송문의' | '교환/환불' | '기타'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    try {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
    } catch (error) {
      console.error('입력 변경 오류:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // 필수 필드 검증
      if (!formData.title.trim() || !formData.content.trim() || !formData.author.trim()) {
        alert('제목, 내용, 작성자는 필수 입력 항목입니다.')
        return
      }

      // 이메일 형식 검증
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        alert('올바른 이메일 형식을 입력해주세요.')
        return
      }

      setIsSubmitting(true)
      
      // 직접 로컬 스토리지에 저장 (더 안전한 방식)
      console.log('문의 등록 시작:', formData)
      
      try {
        // 문의 데이터 생성
        const newInquiry: Inquiry = {
          id: `inquiry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: formData.title.trim(),
          content: formData.content.trim(),
          author: formData.author.trim(),
          email: formData.email.trim(),
          category: formData.category,
          status: 'pending',
          view_count: 0,
          created_at: new Date().toISOString()
        }

        console.log('생성된 문의 객체:', newInquiry)

        // 기존 문의 목록 가져오기
        const existingInquiries = typeof window !== 'undefined' 
          ? JSON.parse(localStorage.getItem('inquiries') || '[]') 
          : []
        
        console.log('기존 문의 목록:', existingInquiries)

        // 새 문의를 목록 맨 앞에 추가
        const updatedInquiries = [newInquiry, ...existingInquiries]
        
        console.log('업데이트된 문의 목록:', updatedInquiries)

        // 로컬 스토리지에 저장
        if (typeof window !== 'undefined') {
          localStorage.setItem('inquiries', JSON.stringify(updatedInquiries))
          console.log('로컬 스토리지에 저장 완료')
        }

        // 상태 업데이트
        setInquiries(updatedInquiries)
        setFormData({ title: '', content: '', author: currentUser || '', email: '', category: '일반문의' })
        
        // 성공 메시지
        setToastMessage('문의가 성공적으로 등록되었습니다! 📝✨')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
        
        // 목록 화면으로 전환
        setCurrentView('list')
        
        // 부모 컴포넌트 새로고침 호출
        onSubmit()
        
        console.log('문의 등록 완료!')
        
      } catch (error) {
        console.error('문의 등록 오류:', error)
        alert('문의 등록 중 오류가 발생했습니다.')
      } finally {
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('폼 제출 오류:', error)
      alert('폼 제출 중 오류가 발생했습니다.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-pastel-xl border border-pastel-200/30 overflow-hidden">
      <div className="bg-gradient-to-r from-pastel-50 to-pastel-100 px-6 py-4 border-b border-pastel-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">✍️</span>
            <h2 className="text-2xl font-bold text-pastel-700">문의 작성</h2>
          </div>
          <button
            onClick={() => setCurrentView('list')}
            className="btn-pastel-secondary px-4 py-2 text-sm font-semibold"
          >
            목록으로
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xl font-bold text-pastel-700 mb-6">
              📝 제목
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="문의 제목을 입력해주세요"
              className="input-pastel text-xl w-full h-16 px-8 py-6"
              required
            />
          </div>

          <div>
            <label className="block text-xl font-bold text-pastel-700 mb-6">
              📂 분류
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-pastel text-xl w-full h-16 px-8 py-6"
            >
              <option value="일반문의">일반문의</option>
              <option value="배송문의">배송문의</option>
              <option value="교환/환불">교환/환불</option>
              <option value="기타">기타</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xl font-bold text-pastel-700 mb-6">
              👤 작성자
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="작성자명을 입력해주세요"
              className="input-pastel text-xl w-full h-16 px-8 py-6"
              required
            />
          </div>

          <div>
            <label className="block text-xl font-bold text-pastel-700 mb-6">
              📧 이메일 (선택)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="답변받을 이메일 주소"
              className="input-pastel text-xl w-full h-16 px-8 py-6"
            />
          </div>
        </div>

        <div>
          <label className="block text-xl font-bold text-pastel-700 mb-6">
            💭 문의 내용
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="문의하실 내용을 자세히 작성해주세요..."
            rows={12}
            className="input-pastel text-xl w-full resize-none px-8 py-6 min-h-[300px]"
            required
          />
        </div>

        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn-pastel-primary text-2xl px-16 py-8 font-bold transform hover:scale-105 hover:shadow-pastel-xl transition-all duration-300 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center space-x-3">
                <span className="animate-spin">⏳</span>
                <span>등록 중...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-3">
                <span className="animate-pulse-soft">📝</span>
                <span>문의 등록하기</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

// 문의 상세보기 컴포넌트
function InquiryDetail({ 
  inquiry, 
  onBack 
}: { 
  inquiry: Inquiry
  onBack: () => void 
}) {
  return (
    <div className="bg-white rounded-2xl shadow-pastel-xl border border-pastel-200/30 overflow-hidden">
      <div className="bg-gradient-to-r from-pastel-50 to-pastel-100 px-6 py-4 border-b border-pastel-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📄</span>
            <h2 className="text-2xl font-bold text-pastel-700">문의 상세</h2>
          </div>
          <button
            onClick={onBack}
            className="btn-pastel-secondary px-4 py-2 text-sm font-semibold"
          >
            목록으로
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-pastel-200/30 pb-4">
            <h3 className="text-2xl font-bold text-gray-900">{inquiry.title}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              inquiry.status === 'answered' ? 'bg-green-100 text-green-600' :
              inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {inquiry.status === 'answered' ? '답변완료' :
               inquiry.status === 'pending' ? '답변대기' : '종료'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">분류:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                inquiry.category === '일반문의' ? 'bg-blue-100 text-blue-600' :
                inquiry.category === '배송문의' ? 'bg-green-100 text-green-600' :
                inquiry.category === '교환/환불' ? 'bg-orange-100 text-orange-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {inquiry.category}
              </span>
            </div>
            <div>
              <span className="font-medium">작성자:</span> {inquiry.author}
            </div>
            <div>
              <span className="font-medium">조회수:</span> {inquiry.view_count}
            </div>
            <div>
              <span className="font-medium">작성일:</span> {new Date(inquiry.created_at).toLocaleDateString('ko-KR')}
            </div>
          </div>

          <div className="bg-pastel-50 rounded-xl p-6">
            <h4 className="font-bold text-lg text-pastel-700 mb-4">문의 내용</h4>
            <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {inquiry.content}
            </div>
          </div>

          {inquiry.answer && (
            <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-400">
              <h4 className="font-bold text-lg text-green-700 mb-4">답변</h4>
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {inquiry.answer}
              </div>
              {inquiry.answered_at && (
                <div className="mt-4 text-sm text-green-600">
                  답변일: {new Date(inquiry.answered_at).toLocaleDateString('ko-KR')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}