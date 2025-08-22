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

export default function AdminPage() {
  const router = useRouter()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(true)
  const [answerText, setAnswerText] = useState('')
  const [showAnswerModal, setShowAnswerModal] = useState(false)
  const [answeringInquiry, setAnsweringInquiry] = useState<Inquiry | null>(null)

  // 관리자 인증
  const checkAdminAuth = (password: string) => {
    // 간단한 관리자 비밀번호 (실제 운영 시에는 더 안전한 방식 사용)
    const adminPass = 'admin123'
    if (password === adminPass) {
      setIsAdmin(true)
      setShowPasswordModal(false)
      localStorage.setItem('admin_auth', 'true')
      showToastMessage('관리자 인증 완료! 🔐')
    } else {
      showToastMessage('잘못된 비밀번호입니다. ❌')
    }
  }

  // 토스트 메시지 표시
  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // 로컬 스토리지에서 문의 목록 가져오기
  const loadInquiries = () => {
    try {
      if (typeof window !== 'undefined') {
        const savedInquiries = localStorage.getItem('inquiries')
        const inquiryList = savedInquiries ? JSON.parse(savedInquiries) : []
        setInquiries(inquiryList)
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

  // 문의사항 삭제
  const deleteInquiry = (inquiryId: string) => {
    if (window.confirm('정말로 이 문의사항을 삭제하시겠습니까?')) {
      const updatedInquiries = inquiries.filter(inquiry => inquiry.id !== inquiryId)
      setInquiries(updatedInquiries)
      saveInquiries(updatedInquiries)
      showToastMessage('문의사항이 삭제되었습니다. 🗑️')
      
      // 상세보기 중이던 문의가 삭제된 경우 목록으로 돌아가기
      if (selectedInquiry?.id === inquiryId) {
        setCurrentView('list')
        setSelectedInquiry(null)
      }
    }
  }

  // 문의사항 답변
  const answerInquiry = (inquiry: Inquiry) => {
    setAnsweringInquiry(inquiry)
    setAnswerText(inquiry.answer || '')
    setShowAnswerModal(true)
  }

  // 답변 저장
  const saveAnswer = () => {
    if (!answeringInquiry || !answerText.trim()) {
      showToastMessage('답변 내용을 입력해주세요.')
      return
    }

    const updatedInquiries = inquiries.map(inquiry => {
      if (inquiry.id === answeringInquiry.id) {
        return {
          ...inquiry,
          answer: answerText.trim(),
          answered_at: new Date().toISOString(),
          status: 'answered' as const
        }
      }
      return inquiry
    })

    setInquiries(updatedInquiries)
    saveInquiries(updatedInquiries)
    setShowAnswerModal(false)
    setAnsweringInquiry(null)
    setAnswerText('')
    showToastMessage('답변이 저장되었습니다. ✅')
  }

  // 문의사항 상태 변경
  const changeStatus = (inquiryId: string, newStatus: 'pending' | 'answered' | 'closed') => {
    const updatedInquiries = inquiries.map(inquiry => {
      if (inquiry.id === inquiryId) {
        return { ...inquiry, status: newStatus }
      }
      return inquiry
    })
    setInquiries(updatedInquiries)
    saveInquiries(updatedInquiries)
    showToastMessage(`상태가 "${newStatus === 'pending' ? '답변대기' : newStatus === 'answered' ? '답변완료' : '종료'}"로 변경되었습니다.`)
  }

  // 페이징 계산
  const totalPages = Math.ceil(inquiries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentInquiries = inquiries.slice(startIndex, endIndex)

  // 통계 계산
  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'pending').length,
    answered: inquiries.filter(i => i.status === 'answered').length,
    closed: inquiries.filter(i => i.status === 'closed').length
  }

  useEffect(() => {
    // 관리자 인증 상태 확인
    const adminAuth = localStorage.getItem('admin_auth')
    if (adminAuth === 'true') {
      setIsAdmin(true)
      setShowPasswordModal(false)
    }
    
    loadInquiries()
  }, [])

  // 관리자 인증 모달
  if (showPasswordModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Head>
          <title>관리자 인증 - 전자제품 쇼핑몰</title>
        </Head>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">관리자 인증</h1>
            <p className="text-gray-600">관리자 비밀번호를 입력해주세요</p>
          </div>
          
          <div className="space-y-6">
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="관리자 비밀번호"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && checkAdminAuth(adminPassword)}
            />
            
            <div className="flex space-x-3">
              <button
                onClick={() => checkAdminAuth(adminPassword)}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-700 transition-all duration-200"
              >
                인증하기
              </button>
              <Link
                href="/inquiry"
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 text-center"
              >
                취소
              </Link>
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>💡 테스트용 비밀번호: admin123</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <Head>
        <title>관리자 페이지 - 전자제품 쇼핑몰</title>
        <meta name="description" content="문의사항 관리 페이지" />
      </Head>

      {/* 헤더 */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 로고 */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                <span className="text-lg text-white">🏪</span>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  전자제품 쇼핑몰
                </h1>
                <p className="text-xs text-gray-500">관리자 페이지</p>
              </div>
            </Link>
            
            {/* 네비게이션 링크 */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-300 flex items-center space-x-1"
              >
                <span>🏠</span>
                <span>홈</span>
              </Link>
              <Link 
                href="/shop" 
                className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-300 flex items-center space-x-1"
              >
                <span>🛒</span>
                <span>쇼핑</span>
              </Link>
              <Link 
                href="/inquiry" 
                className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-300 flex items-center space-x-1"
              >
                <span>💬</span>
                <span>문의</span>
              </Link>
              <Link 
                href="/auth" 
                className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-300 flex items-center space-x-1"
              >
                <span>🔐</span>
                <span>로그인</span>
              </Link>
              <Link 
                href="/admin" 
                className="text-red-600 font-bold border-b-2 border-red-600 pb-1 transition-all duration-300 flex items-center space-x-1"
              >
                <span>👨‍💼</span>
                <span>관리자</span>
              </Link>
            </nav>
            
            {/* 관리자 메뉴 */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  localStorage.removeItem('admin_auth')
                  setIsAdmin(false)
                  setShowPasswordModal(true)
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-1"
              >
                <span>🚪</span>
                <span className="hidden md:inline">로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentView === 'list' && (
          <div className="space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">전체 문의</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <span className="text-3xl">📊</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">답변대기</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <span className="text-3xl">⏰</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">답변완료</p>
                    <p className="text-2xl font-bold text-green-600">{stats.answered}</p>
                  </div>
                  <span className="text-3xl">✅</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">종료</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
                  </div>
                  <span className="text-3xl">🔒</span>
                </div>
              </div>
            </div>

            {/* 문의 목록 테이블 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">문의사항 관리</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 w-16">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 w-24">분류</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">제목</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 w-32">작성자</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 w-20">조회</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 w-32">작성일</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 w-20">상태</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 w-40">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentInquiries.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-16 text-center">
                          <div className="flex flex-col items-center space-y-4">
                            <span className="text-6xl">📝</span>
                            <p className="text-xl font-semibold text-gray-600">등록된 문의가 없습니다</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentInquiries.map((inquiry, index) => (
                        <tr 
                          key={inquiry.id}
                          className="hover:bg-gray-50 transition-colors duration-200"
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
                            <button
                              onClick={() => {
                                setSelectedInquiry(inquiry)
                                setCurrentView('detail')
                              }}
                              className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-left"
                            >
                              {inquiry.title}
                            </button>
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
                            <select
                              value={inquiry.status}
                              onChange={(e) => changeStatus(inquiry.id, e.target.value as any)}
                              className={`px-2 py-1 rounded text-xs font-medium border-0 ${
                                inquiry.status === 'answered' ? 'bg-green-100 text-green-600' :
                                inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-gray-100 text-gray-600'
                              }`}
                            >
                              <option value="pending">답변대기</option>
                              <option value="answered">답변완료</option>
                              <option value="closed">종료</option>
                            </select>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => answerInquiry(inquiry)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-all duration-200"
                              >
                                답변
                              </button>
                              <button
                                onClick={() => deleteInquiry(inquiry.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-all duration-200"
                              >
                                삭제
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 페이징 */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === 1 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
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
                            ? 'bg-red-500 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
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
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                      }`}
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 상세보기 */}
        {currentView === 'detail' && selectedInquiry && (
          <AdminInquiryDetail 
            inquiry={selectedInquiry}
            onBack={() => setCurrentView('list')}
            onDelete={() => deleteInquiry(selectedInquiry.id)}
            onAnswer={() => answerInquiry(selectedInquiry)}
          />
        )}

        {/* 답변 모달 */}
        {showAnswerModal && answeringInquiry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">답변 작성</h3>
                <p className="text-sm text-gray-600 mt-1">{answeringInquiry.title}</p>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    답변 내용
                  </label>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="고객에게 전달할 답변을 작성해주세요..."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowAnswerModal(false)
                      setAnsweringInquiry(null)
                      setAnswerText('')
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200"
                  >
                    취소
                  </button>
                  <button
                    onClick={saveAnswer}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
                  >
                    답변 저장
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 토스트 알림 */}
        {showToast && (
          <div className="fixed top-8 right-8 z-50">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 animate-slide-up">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
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

// 관리자용 문의 상세보기 컴포넌트
function AdminInquiryDetail({ 
  inquiry, 
  onBack,
  onDelete,
  onAnswer
}: { 
  inquiry: Inquiry
  onBack: () => void
  onDelete: () => void
  onAnswer: () => void
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📄</span>
            <h2 className="text-xl font-bold text-gray-800">문의 상세 (관리자)</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onAnswer}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            >
              답변하기
            </button>
            <button
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            >
              삭제
            </button>
            <button
              onClick={onBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            >
              목록으로
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
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

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">ID:</span> {inquiry.id.split('-')[0]}
            </div>
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

          {inquiry.email && (
            <div className="bg-blue-50 rounded-lg p-4">
              <span className="font-medium text-blue-700">📧 이메일:</span> 
              <span className="text-blue-600 ml-2">{inquiry.email}</span>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-bold text-lg text-gray-700 mb-4">문의 내용</h4>
            <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {inquiry.content}
            </div>
          </div>

          {inquiry.answer && (
            <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-400">
              <h4 className="font-bold text-lg text-green-700 mb-4">관리자 답변</h4>
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed mb-4">
                {inquiry.answer}
              </div>
              {inquiry.answered_at && (
                <div className="text-sm text-green-600">
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
