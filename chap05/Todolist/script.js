// DOM 요소들
const currentDateElement = document.getElementById('currentDate');
const dayOfWeekElement = document.getElementById('dayOfWeek');
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const totalCountElement = document.getElementById('totalCount');
const completedCountElement = document.getElementById('completedCount');

// 한국어 요일 배열
const daysOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

// 한국어 월 배열
const months = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
];

// 할일 데이터 배열
let todos = [];
let nextId = 1;

// 할일 우선순위 옵션
const priorityOptions = [
    { value: 'high', label: '높음', color: 'red', bgColor: 'red-50', textColor: 'red-600' },
    { value: 'medium', label: '보통', color: 'yellow', bgColor: 'yellow-50', textColor: 'yellow-600' },
    { value: 'low', label: '낮음', color: 'green', bgColor: 'green-50', textColor: 'green-600' }
];

// 현재 날짜 표시 함수
function updateCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = months[now.getMonth()];
    const date = now.getDate();
    const dayOfWeek = daysOfWeek[now.getDay()];
    
    currentDateElement.textContent = `${year}년 ${month} ${date}일`;
    dayOfWeekElement.textContent = dayOfWeek;
}

// 할일 통계 업데이트 함수
function updateTodoStats() {
    const totalCount = todos.length;
    const completedCount = todos.filter(todo => todo.completed).length;
    
    totalCountElement.textContent = totalCount;
    completedCountElement.textContent = completedCount;
    
    // 빈 상태 표시/숨김
    if (totalCount === 0) {
        todoList.classList.add('hidden');
        emptyState.classList.remove('hidden');
    } else {
        todoList.classList.remove('hidden');
        emptyState.classList.add('hidden');
    }
}

// 할일 아이템 HTML 생성 함수
function createTodoHTML(todo) {
    const priority = priorityOptions.find(p => p.value === todo.priority);
    const isCompleted = todo.completed ? 'completed' : '';
    const opacity = todo.completed ? 'opacity-70' : '';
    const bgColor = todo.completed ? 'bg-gray-50' : 'bg-white';
    const textColor = todo.completed ? 'text-gray-400' : 'text-gray-700';
    const lineThrough = todo.completed ? 'line-through' : '';
    const checkboxBg = todo.completed ? 'bg-green-400 border-green-400' : 'bg-white border-gray-300';
    const checkboxOpacity = todo.completed ? 'opacity-100' : 'opacity-0';
    const leftBorderColor = todo.completed ? 'from-green-400 to-green-500' : `from-${priority.color}-400 to-${priority.color}-500`;
    
    return `
        <div class="todo-item ${bgColor} rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden ${opacity}" data-id="${todo.id}">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${leftBorderColor} rounded-r-full"></div>
            <div class="flex items-center gap-4">
                <div class="relative">
                    <input type="checkbox" id="todo${todo.id}" class="hidden" ${todo.completed ? 'checked' : ''}>
                    <label for="todo${todo.id}" class="w-6 h-6 border-2 ${checkboxBg} rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-pastel-400">
                        <i class="fas fa-check text-white text-xs ${checkboxOpacity} transition-opacity duration-300"></i>
                    </label>
                </div>
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-1">
                        <div class="text-lg font-medium ${textColor} ${lineThrough}">${todo.text}</div>
                        <span class="px-2 py-1 text-xs font-medium bg-${priority.bgColor} text-${priority.textColor} rounded-lg">${priority.label}</span>
                    </div>
                    <div class="flex items-center gap-4 text-sm text-gray-500">
                        <span>${todo.time}</span>
                        ${todo.category ? `<span class="px-2 py-1 bg-gray-100 rounded-lg">${todo.category}</span>` : ''}
                    </div>
                </div>
                <div class="flex gap-2">
                    <button class="edit-btn w-9 h-9 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition-colors duration-300 flex items-center justify-center" title="편집">
                        <i class="fas fa-edit text-sm"></i>
                    </button>
                    <button class="delete-btn w-9 h-9 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors duration-300 flex items-center justify-center" title="삭제">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 할일 목록 렌더링 함수
function renderTodos() {
    // 우선순위별로 정렬 (높음 > 보통 > 낮음)
    const sortedTodos = [...todos].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    todoList.innerHTML = sortedTodos.map(todo => createTodoHTML(todo)).join('');
    updateTodoStats();
    setupEventListeners();
}

// 할일 추가 함수
function addTodo(text, priority = 'medium', category = '', time = '') {
    if (!text.trim()) return;
    
    const now = new Date();
    const defaultTime = time || `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newTodo = {
        id: nextId++,
        text: text.trim(),
        completed: false,
        priority: priority,
        category: category,
        time: defaultTime,
        createdAt: now.toISOString()
    };
    
    todos.push(newTodo);
    saveTodos();
    renderTodos();
    
    // 성공 메시지 표시
    showNotification('할일이 추가되었습니다!', 'success');
}

// 할일 편집 함수
function editTodo(todoId) {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    // 편집 모달 생성
    const modal = createEditModal(todo);
    document.body.appendChild(modal);
    
    // 모달 표시
    setTimeout(() => {
        modal.classList.remove('opacity-0', 'scale-95');
        modal.classList.add('opacity-100', 'scale-100');
    }, 10);
}

// 편집 모달 생성 함수
function createEditModal(todo) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 opacity-0 scale-95 transition-all duration-300';
    modal.innerHTML = `
        <div class="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 class="text-2xl font-bold text-gray-700 mb-6">할일 편집</h3>
            <form id="editForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">할일 내용</label>
                    <input type="text" id="editText" value="${todo.text}" 
                           class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pastel-400 focus:outline-none focus:ring-4 focus:ring-pastel-100 transition-all duration-300" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
                    <select id="editPriority" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pastel-400 focus:outline-none focus:ring-4 focus:ring-pastel-100 transition-all duration-300">
                        ${priorityOptions.map(option => 
                            `<option value="${option.value}" ${todo.priority === option.value ? 'selected' : ''}>${option.label}</option>`
                        ).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                    <input type="text" id="editCategory" value="${todo.category || ''}" 
                           class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pastel-400 focus:outline-none focus:ring-4 focus:ring-pastel-100 transition-all duration-300" placeholder="카테고리 (선택사항)">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">시간</label>
                    <input type="time" id="editTime" value="${todo.time}" 
                           class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pastel-400 focus:outline-none focus:ring-4 focus:ring-pastel-100 transition-all duration-300">
                </div>
                <div class="flex gap-3 pt-4">
                    <button type="submit" class="flex-1 bg-gradient-to-r from-pastel-400 to-pastel-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300">
                        저장
                    </button>
                    <button type="button" class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300" onclick="closeModal(this)">
                        취소
                    </button>
                </div>
            </form>
        </div>
    `;
    
    // 폼 제출 이벤트
    const form = modal.querySelector('#editForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const updatedTodo = {
            ...todo,
            text: document.getElementById('editText').value.trim(),
            priority: document.getElementById('editPriority').value,
            category: document.getElementById('editCategory').value.trim(),
            time: document.getElementById('editTime').value
        };
        
        if (!updatedTodo.text) {
            showNotification('할일 내용을 입력해주세요.', 'error');
            return;
        }
        
        const index = todos.findIndex(t => t.id === todo.id);
        todos[index] = updatedTodo;
        saveTodos();
        renderTodos();
        closeModal(modal);
        showNotification('할일이 수정되었습니다!', 'success');
    });
    
    return modal;
}

// 모달 닫기 함수
function closeModal(element) {
    const modal = element.closest('.fixed');
    modal.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        modal.remove();
    }, 300);
}

// 할일 삭제 함수
function deleteTodo(todoId) {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    if (confirm(`"${todo.text}" 할일을 삭제하시겠습니까?`)) {
        const todoElement = document.querySelector(`[data-id="${todoId}"]`);
        todoElement.style.animation = 'slideOut 0.3s ease forwards';
        
        setTimeout(() => {
            todos = todos.filter(t => t.id !== todoId);
            saveTodos();
            renderTodos();
            showNotification('할일이 삭제되었습니다.', 'info');
        }, 300);
    }
}

// 할일 완료/미완료 토글 함수
function toggleTodo(todoId) {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    todo.completed = !todo.completed;
    saveTodos();
    renderTodos();
    
    const message = todo.completed ? '할일을 완료했습니다!' : '할일을 미완료로 변경했습니다.';
    showNotification(message, todo.completed ? 'success' : 'info');
}

// 로컬 스토리지 저장 함수
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
    localStorage.setItem('nextId', nextId.toString());
}

// 로컬 스토리지 로드 함수
function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    const savedNextId = localStorage.getItem('nextId');
    
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
    }
    
    if (savedNextId) {
        nextId = parseInt(savedNextId);
    }
}

// 알림 표시 함수
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 알림 표시
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // 알림 자동 제거
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 이벤트 리스너 설정 함수
function setupEventListeners() {
    // 체크박스 이벤트
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.removeEventListener('change', handleCheckboxChange);
        checkbox.addEventListener('change', handleCheckboxChange);
    });
    
    // 편집 버튼 이벤트
    const editBtns = document.querySelectorAll('.edit-btn');
    editBtns.forEach(btn => {
        btn.removeEventListener('click', handleEditClick);
        btn.addEventListener('click', handleEditClick);
    });
    
    // 삭제 버튼 이벤트
    const deleteBtns = document.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
        btn.removeEventListener('click', handleDeleteClick);
        btn.addEventListener('click', handleDeleteClick);
    });
}

// 체크박스 변경 핸들러
function handleCheckboxChange(e) {
    const todoId = parseInt(e.target.closest('.todo-item').dataset.id);
    toggleTodo(todoId);
}

// 편집 버튼 클릭 핸들러
function handleEditClick(e) {
    const todoId = parseInt(e.target.closest('.todo-item').dataset.id);
    editTodo(todoId);
}

// 삭제 버튼 클릭 핸들러
function handleDeleteClick(e) {
    const todoId = parseInt(e.target.closest('.todo-item').dataset.id);
    deleteTodo(todoId);
}

// 입력 필드 이벤트 리스너
function setupInputListeners() {
    // Enter 키로 할일 추가
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim() !== '') {
            addTodo(this.value.trim());
            this.value = '';
        }
    });
    
    // 추가 버튼 클릭
    addBtn.addEventListener('click', function() {
        const todoText = todoInput.value.trim();
        if (todoText !== '') {
            addTodo(todoText);
            todoInput.value = '';
        }
    });
    
    // 입력 필드 포커스 효과
    todoInput.addEventListener('focus', function() {
        this.parentElement.classList.add('scale-105');
    });
    
    todoInput.addEventListener('blur', function() {
        this.parentElement.classList.remove('scale-105');
    });
}

// 키보드 단축키
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter로 할일 추가
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const todoText = todoInput.value.trim();
        if (todoText !== '') {
            addTodo(todoText);
            todoInput.value = '';
        }
    }
    
    // Escape로 입력 필드 초기화
    if (e.key === 'Escape') {
        todoInput.value = '';
        todoInput.blur();
    }
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 로컬 스토리지에서 데이터 로드
    loadTodos();
    
    // 현재 날짜 표시
    updateCurrentDate();
    
    // 할일 목록 렌더링
    renderTodos();
    
    // 이벤트 리스너 설정
    setupInputListeners();
    
    // 입력 필드에 포커스
    todoInput.focus();
    
    // 페이지 로드 애니메이션
    const container = document.querySelector('.max-w-4xl');
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        container.style.transition = 'all 0.6s ease';
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 100);
    
    // 시작 메시지
    if (todos.length === 0) {
        setTimeout(() => {
            showNotification('오늘도 좋은 하루 되세요! 🌟', 'info');
        }, 1000);
    }
});

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-100%);
        }
    }
    
    .todo-item {
        animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style); 