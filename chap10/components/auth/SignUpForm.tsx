import React, { useState } from 'react'

interface SignUpFormProps {
  onSuccess: (userData: any) => void
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // 에러 메시지 초기화
    if (error) setError('')
  }

  const validateForm = () => {
    if (formData.username.length < 3) {
      setError('사용자명은 최소 3자 이상이어야 합니다.')
      return false
    }
    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email || undefined
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('회원가입이 완료되었습니다!')
        // localStorage에 인증 정보 저장
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth', JSON.stringify(result.data))
        }
        setTimeout(() => {
          onSuccess(result.data)
        }, 1500)
      } else {
        setError(result.error || '회원가입 중 오류가 발생했습니다.')
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
          사용자명 *
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="input-pastel text-lg"
          placeholder="사용자명을 입력하세요 (3자 이상) ✨"
          disabled={loading}
        />
      </div>

      {/* 이메일 */}
      <div>
        <label htmlFor="email" className="block text-lg font-bold text-pastel-gray-700 mb-4 flex items-center gap-2">
          <span className="text-pastel-mint-500">📧</span>
          이메일 (선택)
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="input-pastel text-lg"
          placeholder="이메일을 입력하세요 (선택사항) 📮"
          disabled={loading}
        />
      </div>

      {/* 비밀번호 */}
      <div>
        <label htmlFor="password" className="block text-lg font-bold text-pastel-gray-700 mb-4 flex items-center gap-2">
          <span className="text-pastel-coral-500">🔒</span>
          비밀번호 *
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="input-pastel text-lg"
          placeholder="비밀번호를 입력하세요 (6자 이상) 🔐"
          disabled={loading}
        />
      </div>

      {/* 비밀번호 확인 */}
      <div>
        <label htmlFor="confirmPassword" className="block text-lg font-bold text-pastel-gray-700 mb-4 flex items-center gap-2">
          <span className="text-pastel-peach-500">🔐</span>
          비밀번호 확인 *
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="input-pastel text-lg"
          placeholder="비밀번호를 다시 입력하세요 🔄"
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

      {/* 성공 메시지 */}
      {success && (
        <div className="p-6 bg-gradient-to-r from-pastel-mint-50 to-pastel-green-50 border-2 border-pastel-mint-200 rounded-3xl animate-slide-up shadow-mint-glow">
          <div className="flex items-center">
            <span className="text-pastel-mint-500 mr-3 text-xl animate-bounce-gentle">✅</span>
            <p className="text-pastel-mint-700 text-lg font-semibold">{success}</p>
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
            : 'btn-pastel-primary hover:shadow-pastel-glow group relative overflow-hidden'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="spinner-pastel h-6 w-6 mr-3"></div>
            처리 중... ⏳
          </div>
        ) : (
          <span className="relative z-10 flex items-center justify-center gap-3">
            <span className="animate-wiggle">🎉</span>
            회원가입 완료
          </span>
        )}
      </button>

      {/* 안내 메시지 */}
      <div className="text-center">
        <p className="text-lg text-pastel-gray-500 leading-relaxed">
          <span className="text-pastel-coral-600 font-bold">*</span> 표시된 항목은 필수 입력사항입니다. 📝
        </p>
      </div>
    </form>
  )
}
