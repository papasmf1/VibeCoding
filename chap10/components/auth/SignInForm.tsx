import React, { useState } from 'react'

interface SignInFormProps {
  onSuccess: (userData: any) => void
}

export default function SignInForm({ onSuccess }: SignInFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // 에러 메시지 초기화
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username || !formData.password) {
      setError('사용자명과 비밀번호를 모두 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        // localStorage에 인증 정보 저장
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth', JSON.stringify(result.data))
        }
        onSuccess(result.data)
      } else {
        setError(result.error || '로그인에 실패했습니다.')
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 사용자명 */}
      <div>
        <label htmlFor="username" className="block text-lg font-bold text-pastel-gray-700 mb-4 flex items-center gap-2">
          <span className="text-pastel-lavender-500">👤</span>
          사용자명
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="input-pastel text-lg"
          placeholder="사용자명을 입력하세요 ✨"
          disabled={loading}
        />
      </div>

      {/* 비밀번호 */}
      <div>
        <label htmlFor="password" className="block text-lg font-bold text-pastel-gray-700 mb-4 flex items-center gap-2">
          <span className="text-pastel-coral-500">🔒</span>
          비밀번호
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="input-pastel text-lg"
          placeholder="비밀번호를 입력하세요 🔐"
          disabled={loading}
        />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-6 bg-gradient-to-r from-pastel-coral-50 to-red-50 border-2 border-pastel-coral-200 rounded-3xl animate-slide-up shadow-coral-glow">
          <div className="flex items-center">
            <span className="text-pastel-coral-500 mr-3 text-xl animate-wiggle">⚠️</span>
            <p className="text-pastel-coral-700 text-lg font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-5 px-6 rounded-3xl font-bold text-xl transition-all duration-300 transform hover:scale-105 ${
          loading
            ? 'bg-pastel-gray-300 text-pastel-gray-500 cursor-not-allowed'
            : 'btn-pastel-secondary hover:shadow-coral-glow group relative overflow-hidden'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="spinner-pastel h-6 w-6 mr-3"></div>
            로그인 중... ⏳
          </div>
        ) : (
          <span className="relative z-10 flex items-center justify-center gap-3">
            <span className="animate-pulse-soft">🔑</span>
            로그인
          </span>
        )}
      </button>

      {/* 추가 옵션 */}
      <div className="flex items-center justify-between text-lg">
        <label className="flex items-center text-pastel-gray-600 hover:text-pastel-gray-700 cursor-pointer group">
          <input
            type="checkbox"
            className="w-5 h-5 text-pastel-coral-600 border-pastel-300 rounded-lg focus:ring-pastel-coral-500 focus:ring-4 transition-all duration-300"
          />
          <span className="ml-3 font-semibold group-hover:text-pastel-coral-600 transition-colors duration-300">로그인 상태 유지</span>
        </label>
        <button
          type="button"
          className="text-pastel-coral-600 hover:text-pastel-coral-700 font-bold hover:underline transition-all duration-300 transform hover:scale-105 px-4 py-2 rounded-2xl hover:bg-pastel-coral-50"
        >
          🔍 비밀번호 찾기
        </button>
      </div>

      {/* 안내 메시지 */}
      <div className="text-center">
        <p className="text-lg text-pastel-gray-500 leading-relaxed">
          로그인 시 <span className="font-bold text-pastel-lavender-600">개인정보 보호정책</span>에 동의하게 됩니다. 🛡️
        </p>
      </div>
    </form>
  )
}
