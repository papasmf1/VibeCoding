// 네비게이션 바 스크롤 효과
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('nav');
    if (window.scrollY > 100) {
        navbar.classList.add('bg-white/95', 'shadow-lg');
        navbar.classList.remove('bg-white/80', 'shadow-sm');
    } else {
        navbar.classList.remove('bg-white/95', 'shadow-lg');
        navbar.classList.add('bg-white/80', 'shadow-sm');
    }
});

// 모바일 햄버거 메뉴
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

hamburger.addEventListener('click', function() {
    mobileMenu.classList.toggle('hidden');
    // 햄버거 아이콘 변경
    const icon = this.querySelector('i');
    if (mobileMenu.classList.contains('hidden')) {
        icon.className = 'fas fa-bars text-xl';
    } else {
        icon.className = 'fas fa-times text-xl';
    }
});

// 모바일 메뉴 링크 클릭 시 메뉴 닫기
document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
        const icon = hamburger.querySelector('i');
        icon.className = 'fas fa-bars text-xl';
    });
});

// 부드러운 스크롤
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // 네비게이션 바 높이만큼 조정
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// 드라마 카드 호버 효과
document.querySelectorAll('.drama-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// 플레이 버튼 클릭 이벤트
document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const dramaTitle = this.closest('.drama-card').querySelector('h3').textContent;
        showNotification(`${dramaTitle}의 트레일러를 재생합니다!`, 'success');
    });
});

// 장르 카드 클릭 이벤트
document.querySelectorAll('.genre-card').forEach(card => {
    card.addEventListener('click', function() {
        const genre = this.querySelector('h3').textContent;
        showNotification(`${genre} 장르의 드라마를 검색합니다!`, 'info');
    });
});

// 배우 카드 클릭 이벤트
document.querySelectorAll('.actor-card').forEach(card => {
    card.addEventListener('click', function() {
        const actorName = this.querySelector('h3').textContent;
        showNotification(`${actorName}의 작품을 확인합니다!`, 'info');
    });
});

// 뉴스 카드 클릭 이벤트
document.querySelectorAll('.news-card').forEach(card => {
    card.addEventListener('click', function() {
        const newsTitle = this.querySelector('h3').textContent;
        showNotification(`${newsTitle} 기사를 읽습니다!`, 'info');
    });
});

// 연락처 폼 제출
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        if (email) {
            showNotification('구독해주셔서 감사합니다! K-Drama 소식을 이메일로 받아보세요.', 'success');
            this.reset();
        } else {
            showNotification('이메일 주소를 입력해주세요.', 'error');
        }
    });
}

// 히어로 버튼 클릭 이벤트
document.querySelector('.btn-primary').addEventListener('click', function() {
    showNotification('K-Drama World에 오신 것을 환영합니다!', 'success');
});

document.querySelector('.btn-secondary').addEventListener('click', function() {
    showNotification('트레일러를 재생합니다!', 'info');
});

// 소셜 미디어 링크 호버 효과
document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px) scale(1.1)';
    });
    
    link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// 스크롤 애니메이션
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 애니메이션을 적용할 요소들
document.querySelectorAll('.drama-card, .genre-card, .actor-card, .news-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// 알림 시스템
function showNotification(message, type = 'info') {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 알림 요소 생성
    const notification = document.createElement('div');
    notification.className = `notification fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    
    // 타입별 스타일 설정
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-white'
    };
    
    notification.className += ` ${colors[type] || colors.info}`;
    notification.textContent = message;

    // DOM에 추가
    document.body.appendChild(notification);

    // 애니메이션 효과
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);

    // 자동 제거
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// 페이지 로드 시 환영 메시지
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('K-Drama World에 오신 것을 환영합니다! 🎬');
        // 페이지 로드 완료 후 환영 알림
        setTimeout(() => {
            showNotification('K-Drama World에 오신 것을 환영합니다! 🎬', 'success');
        }, 1000);
    }, 1000);
});

// 키보드 단축키
document.addEventListener('keydown', function(e) {
    // ESC 키로 모바일 메뉴 닫기
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        const icon = hamburger.querySelector('i');
        icon.className = 'fas fa-bars text-xl';
    }
    
    // Home 키로 맨 위로 스크롤
    if (e.key === 'Home') {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // End 키로 맨 아래로 스크롤
    if (e.key === 'End') {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    }
});

// 드라마 검색 기능 (향후 확장용)
function searchDramas(query) {
    console.log(`"${query}"로 드라마를 검색합니다...`);
    showNotification(`"${query}"로 드라마를 검색합니다...`, 'info');
    // 실제 검색 기능은 서버와 연동하여 구현
}

// 즐겨찾기 기능 (향후 확장용)
function addToFavorites(dramaTitle) {
    console.log(`"${dramaTitle}"을 즐겨찾기에 추가했습니다!`);
    showNotification(`"${dramaTitle}"을 즐겨찾기에 추가했습니다!`, 'success');
    // 로컬 스토리지나 서버에 저장
}

// 평점 시스템 (향후 확장용)
function rateDrama(dramaTitle, rating) {
    console.log(`"${dramaTitle}"에 ${rating}점을 주었습니다!`);
    showNotification(`"${dramaTitle}"에 ${rating}점을 주었습니다!`, 'success');
    // 평점 데이터를 서버에 전송
}

// 랜덤 드라마 추천
function getRandomDrama() {
    const dramas = [
        '사랑의 불시착',
        '기생충', 
        '오징어 게임',
        '이태원 클라쓰',
        '킹덤',
        '미스터 선샤인',
        '도깨비',
        '태양의 후예'
    ];
    const randomDrama = dramas[Math.floor(Math.random() * dramas.length)];
    showNotification(`오늘의 추천 드라마: ${randomDrama} 🎬`, 'info');
}

// 페이지 성능 모니터링
window.addEventListener('load', function() {
    const loadTime = performance.now();
    console.log(`페이지 로드 시간: ${loadTime.toFixed(2)}ms`);
    
    // 로드 시간이 3초 이상이면 경고
    if (loadTime > 3000) {
        console.warn('페이지 로드 시간이 느립니다. 최적화가 필요합니다.');
    }
});

// 에러 처리
window.addEventListener('error', function(e) {
    console.error('페이지에서 오류가 발생했습니다:', e.error);
    showNotification('페이지에서 오류가 발생했습니다.', 'error');
});

// 온라인/오프라인 상태 감지
window.addEventListener('online', function() {
    console.log('인터넷 연결이 복구되었습니다.');
    showNotification('인터넷 연결이 복구되었습니다.', 'success');
});

window.addEventListener('offline', function() {
    console.log('인터넷 연결이 끊어졌습니다.');
    showNotification('인터넷 연결이 끊어졌습니다.', 'warning');
});

// 스크롤 진행률 표시 (선택적 기능)
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'fixed top-0 left-0 w-full h-1 bg-pink-400 z-50 transform origin-left';
    progressBar.style.transform = 'scaleX(0)';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTop / docHeight;
        progressBar.style.transform = `scaleX(${scrollPercent})`;
    });
}

// 스크롤 진행률 표시 활성화 (선택사항)
// createScrollProgress();

// 드라마 카드 랜덤 애니메이션
function addRandomAnimation() {
    document.querySelectorAll('.drama-card').forEach((card, index) => {
        setTimeout(() => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-pulse');
        }, index * 100);
    });
}

// 페이지 로드 후 랜덤 애니메이션 실행
window.addEventListener('load', function() {
    setTimeout(addRandomAnimation, 2000);
});

// 터치 제스처 지원 (모바일)
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // 왼쪽으로 스와이프
            console.log('왼쪽으로 스와이프');
        } else {
            // 오른쪽으로 스와이프
            console.log('오른쪽으로 스와이프');
        }
    }
} 