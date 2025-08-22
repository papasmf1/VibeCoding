import React, { useState, useEffect } from 'react'
import { Product, ProductCategory } from '../../lib/types'

interface ProductListProps {
  onAddToCart: (product: Product, quantity: number) => void
}

export default function ProductList({ onAddToCart }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // 상품 목록 가져오기
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      })
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      
      if (sortBy !== 'featured') {
        params.append('sort', sortBy)
      }

      const response = await fetch(`/api/products?${params}`)
      const result = await response.json()

      if (result.success) {
        setProducts(result.data.products)
        setTotalPages(result.data.pagination.totalPages)
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('상품 목록을 가져오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 카테고리 목록 가져오기
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()

      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('카테고리 로딩 오류:', error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, searchTerm, sortBy, currentPage])

  const handleAddToCart = (product: Product) => {
    onAddToCart(product, 1)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  if (loading && products.length === 0) {
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
          onClick={fetchProducts}
          className="btn-pastel-primary"
        >
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 검색 및 필터 */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-6 mb-12">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="상품명, 브랜드, 모델명으로 검색... ✨"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-pastel text-xl pl-6 pr-16"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-pastel-gray-400">
              🔍
            </div>
          </div>
          <button
            type="submit"
            className="btn-pastel-primary text-xl px-10 py-4 font-bold group"
          >
            <span className="flex items-center gap-3">
              <span className="animate-pulse-soft">🔍</span>
              검색하기
            </span>
          </button>
        </form>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center justify-between">
          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-3 md:gap-4 w-full lg:w-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 md:px-8 py-3 md:py-4 rounded-3xl text-base md:text-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-pastel-lavender-200 to-pastel-mint-200 text-pastel-lavender-700 shadow-pastel-glow'
                  : 'bg-gradient-to-r from-pastel-100 to-pastel-200 text-pastel-gray-600 hover:from-pastel-200 hover:to-pastel-300 hover:text-pastel-gray-800'
              }`}
            >
              🌟 전체
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 md:px-8 py-3 md:py-4 rounded-3xl text-base md:text-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-pastel-lavender-200 to-pastel-mint-200 text-pastel-lavender-700 shadow-pastel-glow'
                    : 'bg-gradient-to-r from-pastel-100 to-pastel-200 text-pastel-gray-600 hover:from-pastel-200 hover:to-pastel-300 hover:text-pastel-gray-800'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* 정렬 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full lg:w-auto px-4 md:px-8 py-3 md:py-4 border-2 border-pastel-200/70 rounded-3xl focus:ring-4 focus:ring-pastel-lavender-200 focus:border-pastel-lavender-400 transition-all duration-300 bg-white/80 backdrop-blur-sm text-pastel-gray-700 font-bold text-base md:text-lg shadow-pastel hover:shadow-pastel-lg"
          >
            <option value="featured">✨ 추천순</option>
            <option value="newest">🆕 최신순</option>
            <option value="price_asc">💰 가격 낮은순</option>
            <option value="price_desc">💎 가격 높은순</option>
          </select>
        </div>
      </div>

      {/* 상품 목록 */}
      {products.length === 0 ? (
        <div className="text-center py-32">
          <div className="w-32 h-32 bg-gradient-to-br from-pastel-gray-100 to-pastel-200 rounded-full mx-auto mb-8 flex items-center justify-center animate-float">
            <span className="text-5xl text-pastel-gray-400">🔍</span>
          </div>
          <p className="text-pastel-gray-500 text-2xl font-semibold">검색 결과가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="card-pastel card-pastel-hover overflow-hidden group animate-slide-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* 상품 이미지 */}
                <div className="aspect-square bg-gradient-to-br from-pastel-100 to-pastel-200 overflow-hidden relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-pastel-gray-400 bg-gradient-to-br from-pastel-lavender-50 to-pastel-mint-50">
                      <span className="text-5xl animate-bounce-gentle">📱</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* 상품 정보 */}
                <div className="p-8">
                  <div className="mb-4">
                    <span className={`badge-pastel ${
                      product.category?.name === '스마트폰' ? 'badge-pastel-blue' :
                      product.category?.name === '노트북' ? 'badge-pastel-green' :
                      product.category?.name === '태블릿' ? 'badge-pastel-purple' :
                      product.category?.name === '가전제품' ? 'badge-pastel-orange' :
                      'badge-pastel-yellow'
                    }`}>
                      {product.category?.name}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-pastel-gray-900 mb-4 text-xl leading-tight line-clamp-2 group-hover:text-pastel-lavender-600 transition-colors duration-300">
                    {product.name}
                  </h3>
                  
                  <p className="text-pastel-gray-600 mb-6 text-lg leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-pastel-gray-900">
                        {formatPrice(product.price)}원
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-lg text-pastel-gray-400 line-through">
                          {formatPrice(product.original_price)}원
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-pastel-gray-600 bg-gradient-to-r from-pastel-100 to-pastel-200 px-4 py-2 rounded-full font-semibold shadow-pastel">
                      재고: {product.stock_quantity}개
                    </span>
                  </div>

                  {/* 장바구니 추가 버튼 */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock_quantity === 0}
                    className={`w-full py-4 px-6 rounded-3xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                      product.stock_quantity === 0 
                        ? 'bg-pastel-gray-200 text-pastel-gray-400 cursor-not-allowed' 
                        : 'btn-pastel-primary hover:shadow-pastel-glow group relative overflow-hidden'
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {product.stock_quantity === 0 ? (
                        <>😔 품절</>
                      ) : (
                        <>
                          <span className="animate-wiggle">🛒</span>
                          장바구니 추가
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-16">
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-4 border-2 border-pastel-200/70 rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-pastel-100 hover:to-pastel-200 text-pastel-gray-600 font-bold transition-all duration-300 transform hover:scale-105 shadow-pastel text-lg"
                >
                  ← 이전
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-6 py-4 border-2 rounded-3xl font-bold transition-all duration-300 transform hover:scale-105 text-lg ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-pastel-lavender-400 to-pastel-mint-400 text-white border-pastel-lavender-400 shadow-pastel-glow'
                        : 'border-pastel-200/70 text-pastel-gray-600 hover:bg-gradient-to-r hover:from-pastel-100 hover:to-pastel-200 shadow-pastel'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-4 border-2 border-pastel-200/70 rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-pastel-100 hover:to-pastel-200 text-pastel-gray-600 font-bold transition-all duration-300 transform hover:scale-105 shadow-pastel text-lg"
                >
                  다음 →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
