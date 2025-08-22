// K-드라마 웹사이트 메인 JavaScript

// 전역 변수
let allDramas = [];
let filteredDramas = [];
let currentPage = 1;
const itemsPerPage = 12;

// DOM 요소들
const dramaGrid = document.getElementById('dramaGrid');
const searchInput = document.getElementById('searchInput');
const genreFilters = document.getElementById('genreFilters');
const yearRange = document.getElementById('yearRange');
const ratingRange = document.getElementById('ratingRange');
const sortSelect = document.getElementById('sortSelect');
const resetFilters = document.getElementById('resetFilters');
const loading = document.getElementById('loading');
const noResults = document.getElementById('noResults');
const modal = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadDramas();
    setupEventListeners();
});

// 드라마 데이터 로드
async function loadDramas() {
    try {
        showLoading(true);
        const response = await fetch('data/dramas.json');
        if (!response.ok) {
            throw new Error('데이터를 불러올 수 없습니다.');
        }
        allDramas = await response.json();
        filteredDramas = [...allDramas];
        
        setupGenreFilters();
        renderDramas();
        updateResultsCount();
        showLoading(false);
    } catch (error) {
        console.error('드라마 데이터 로딩 실패:', error);
        showError('드라마 정보를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.');
        showLoading(false);
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 검색
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // 정렬
    sortSelect.addEventListener('change', handleSort);
    
    // 필터 초기화
    resetFilters.addEventListener('click', resetAllFilters);
    
    // 연도 및 평점 슬라이더
    yearRange.addEventListener('input', handleYearFilter);
    ratingRange.addEventListener('input', handleRatingFilter);
    
    // 모달 닫기
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
}

// 장르 필터 설정
function setupGenreFilters() {
    const genres = [...new Set(allDramas.flatMap(drama => drama.genre))];
    genreFilters.innerHTML = '';
    
    genres.forEach(genre => {
        const label = document.createElement('label');
        label.className = 'genre-filter-item';
        label.innerHTML = `
            <input type="checkbox" value="${genre}" class="genre-checkbox">
            <span class="genre-label">${genre}</span>
        `;
        genreFilters.appendChild(label);
    });
    
    // 장르 필터 이벤트 리스너
    genreFilters.addEventListener('change', handleGenreFilter);
}

// 검색 처리
function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === '') {
        filteredDramas = [...allDramas];
    } else {
        filteredDramas = allDramas.filter(drama => 
            drama.title.toLowerCase().includes(query) ||
            drama.titleEn.toLowerCase().includes(query) ||
            drama.cast.some(actor => actor.name.toLowerCase().includes(query)) ||
            drama.genre.some(g => g.toLowerCase().includes(query))
        );
    }
    
    applyFilters();
    renderDramas();
    updateResultsCount();
}

// 장르 필터 처리
function handleGenreFilter() {
    applyFilters();
    renderDramas();
    updateResultsCount();
}

// 연도 필터 처리
function handleYearFilter() {
    const yearValue = document.getElementById('yearValue');
    yearValue.textContent = yearRange.value;
    applyFilters();
    renderDramas();
    updateResultsCount();
}

// 평점 필터 처리
function handleRatingFilter() {
    const ratingValue = document.getElementById('ratingValue');
    ratingValue.textContent = ratingRange.value;
    applyFilters();
    renderDramas();
    updateResultsCount();
}

// 필터 적용
function applyFilters() {
    const selectedGenres = Array.from(document.querySelectorAll('.genre-checkbox:checked'))
        .map(cb => cb.value);
    const minYear = parseInt(yearRange.value);
    const minRating = parseFloat(ratingRange.value);
    
    let filtered = [...allDramas];
    
    // 검색어 필터
    const query = searchInput.value.toLowerCase().trim();
    if (query) {
        filtered = filtered.filter(drama => 
            drama.title.toLowerCase().includes(query) ||
            drama.titleEn.toLowerCase().includes(query) ||
            drama.cast.some(actor => actor.name.toLowerCase().includes(query)) ||
            drama.genre.some(g => g.toLowerCase().includes(query))
        );
    }
    
    // 장르 필터
    if (selectedGenres.length > 0) {
        filtered = filtered.filter(drama => 
            drama.genre.some(genre => selectedGenres.includes(genre))
        );
    }
    
    // 연도 필터
    filtered = filtered.filter(drama => drama.year >= minYear);
    
    // 평점 필터
    filtered = filtered.filter(drama => drama.rating >= minRating);
    
    filteredDramas = filtered;
}

// 정렬 처리
function handleSort() {
    const sortBy = sortSelect.value;
    
    filteredDramas.sort((a, b) => {
        switch (sortBy) {
            case 'rating':
                return b.rating - a.rating;
            case 'year':
                return b.year - a.year;
            case 'title':
                return a.title.localeCompare(b.title);
            case 'popularity':
            default:
                return b.rating * b.year - a.rating * a.year; // 간단한 인기도 계산
        }
    });
    
    renderDramas();
}

// 드라마 렌더링
function renderDramas() {
    if (filteredDramas.length === 0) {
        dramaGrid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    dramaGrid.style.display = 'grid';
    noResults.style.display = 'none';
    
    dramaGrid.innerHTML = '';
    
    filteredDramas.forEach(drama => {
        const dramaCard = createDramaCard(drama);
        dramaGrid.appendChild(dramaCard);
    });
}

// 드라마 카드 생성
function createDramaCard(drama) {
    const card = document.createElement('div');
    card.className = 'drama-card';
    card.setAttribute('role', 'gridcell');
    card.setAttribute('tabindex', '0');
    
    card.innerHTML = `
        <div class="drama-poster">
            <img src="${drama.poster}" alt="${drama.title} 포스터" loading="lazy" 
                 onerror="this.src='images/placeholder.jpg'">
            <div class="drama-overlay">
                <button class="view-details-btn" aria-label="${drama.title} 상세보기">상세보기</button>
            </div>
        </div>
        <div class="drama-info">
            <h3 class="drama-title">${drama.title}</h3>
            <p class="drama-year">${drama.year}년 • ${drama.episodes}부작</p>
            <div class="drama-genres">
                ${drama.genre.map(g => `<span class="genre-tag">${g}</span>`).join('')}
            </div>
            <div class="drama-rating">
                <span class="rating-stars">${generateStars(drama.rating)}</span>
                <span class="rating-number">${drama.rating}</span>
            </div>
        </div>
    `;
    
    // 카드 클릭 이벤트
    card.addEventListener('click', () => openModal(drama));
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal(drama);
        }
    });
    
    return card;
}

// 별점 생성
function generateStars(rating) {
    const fullStars = Math.floor(rating / 2);
    const halfStar = rating % 2 >= 1;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }
    if (halfStar) {
        stars += '☆';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
    }
    
    return stars;
}

// 모달 열기
function openModal(drama) {
    modalContent.innerHTML = `
        <div class="modal-header">
            <div class="modal-poster">
                <img src="${drama.poster}" alt="${drama.title} 포스터" 
                     onerror="this.src='images/placeholder.jpg'">
            </div>
            <div class="modal-info">
                <h2 id="modalTitle">${drama.title}</h2>
                <p class="modal-title-en">${drama.titleEn}</p>
                <div class="modal-meta">
                    <span>${drama.year}년</span>
                    <span>${drama.episodes}부작</span>
                    <span>${drama.network}</span>
                    <span class="status ${drama.status}">${drama.status}</span>
                </div>
                <div class="modal-genres">
                    ${drama.genre.map(g => `<span class="genre-tag">${g}</span>`).join('')}
                </div>
                <div class="modal-rating">
                    <span class="rating-stars">${generateStars(drama.rating)}</span>
                    <span class="rating-number">${drama.rating}/10</span>
                </div>
            </div>
        </div>
        
        <div class="modal-body">
            <div class="modal-section">
                <h3>줄거리</h3>
                <p id="modalDescription">${drama.synopsis}</p>
            </div>
            
            <div class="modal-section">
                <h3>주요 출연진</h3>
                <div class="cast-list">
                    ${drama.cast.map(actor => `
                        <div class="cast-item">
                            <img src="${actor.image}" alt="${actor.name}" 
                                 onerror="this.src='images/placeholder.jpg'">
                            <div class="cast-info">
                                <div class="cast-name">${actor.name}</div>
                                <div class="cast-character">${actor.character}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="modal-section">
                <h3>사용자 리뷰</h3>
                <div class="reviews-list">
                    ${drama.reviews.length > 0 ? 
                        drama.reviews.map(review => `
                            <div class="review-item">
                                <div class="review-header">
                                    <span class="review-user">${review.user}</span>
                                    <span class="review-rating">${generateStars(review.rating * 2)} ${review.rating}/10</span>
                                </div>
                                <p class="review-comment">${review.comment}</p>
                            </div>
                        `).join('') : 
                        '<p class="no-reviews">아직 리뷰가 없습니다.</p>'
                    }
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    modalClose.focus();
}

// 모달 닫기
function closeModal() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
}

// 필터 초기화
function resetAllFilters() {
    searchInput.value = '';
    yearRange.value = '2010';
    ratingRange.value = '0';
    document.getElementById('yearValue').textContent = '2010';
    document.getElementById('ratingValue').textContent = '0';
    
    // 장르 체크박스 초기화
    document.querySelectorAll('.genre-checkbox').forEach(cb => {
        cb.checked = false;
    });
    
    filteredDramas = [...allDramas];
    renderDramas();
    updateResultsCount();
}

// 결과 수 업데이트
function updateResultsCount() {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = filteredDramas.length;
    }
}

// 로딩 표시
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

// 에러 표시
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    dramaGrid.appendChild(errorDiv);
}

// 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}