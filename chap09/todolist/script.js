// To-Do List 애플리케이션
class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.nextId = this.getNextId();
        
        this.initElements();
        this.bindEvents();
        this.render();
        
        console.log('To-Do List 애플리케이션이 시작되었습니다.');
    }
    
    // DOM 요소들 초기화
    initElements() {
        this.todoForm = document.getElementById('addTodoForm');
        this.todoInput = document.getElementById('todoInput');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        
        // 통계 요소들
        this.totalCount = document.getElementById('totalCount');
        this.completedCount = document.getElementById('completedCount');
        this.remainingCount = document.getElementById('remainingCount');
    }
    
    // 이벤트 리스너 바인딩
    bindEvents() {
        this.todoForm.addEventListener('submit', (e) => this.handleAddTodo(e));
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        // 필터 버튼 이벤트
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });
        
        // 할 일 목록 이벤트 (이벤트 위임)
        this.todoList.addEventListener('click', (e) => this.handleTodoClick(e));
    }
    
    // 새 할 일 추가
    handleAddTodo(e) {
        e.preventDefault();
        
        const text = this.todoInput.value.trim();
        if (!text) return;
        
        const newTodo = {
            id: this.nextId++,
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.unshift(newTodo); // 맨 앞에 추가
        this.todoInput.value = '';
        this.saveTodos();
        this.render();
        
        // 입력 포커스 유지
        this.todoInput.focus();
    }
    
    // 할 일 클릭 이벤트 처리
    handleTodoClick(e) {
        const todoItem = e.target.closest('.todo-item');
        if (!todoItem) return;
        
        const todoId = parseInt(todoItem.dataset.id);
        
        if (e.target.closest('.todo-checkbox')) {
            this.toggleTodo(todoId);
        } else if (e.target.closest('.delete-btn')) {
            this.deleteTodo(todoId);
        }
    }
    
    // 할 일 완료 상태 토글
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }
    
    // 할 일 삭제
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
    }
    
    // 완료된 할 일들 모두 삭제
    clearCompleted() {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveTodos();
        this.render();
    }
    
    // 필터 변경 처리
    handleFilterChange(e) {
        const filter = e.target.dataset.filter;
        this.currentFilter = filter;
        
        // 필터 버튼 스타일 업데이트
        this.filterBtns.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.className = 'filter-btn flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 bg-soft-purple text-white shadow-md';
            } else {
                btn.className = 'filter-btn flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 bg-white/70 text-gray-600 hover:bg-pastel-purple/50';
            }
        });
        
        this.render();
    }
    
    // 필터링된 할 일 목록 반환
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }
    
    // 할 일 항목 HTML 생성
    createTodoItemHTML(todo) {
        return `
            <li class="todo-item flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-pastel-purple/20 hover:bg-white/80 hover:border-soft-purple/30 transition-all duration-200 transform hover:scale-[1.02] ${todo.completed ? 'opacity-75' : ''}" data-id="${todo.id}">
                <button class="todo-checkbox w-6 h-6 rounded-lg border-2 border-soft-purple/40 flex items-center justify-center cursor-pointer hover:border-soft-purple transition-all duration-200 ${todo.completed ? 'bg-soft-green border-soft-green' : 'bg-white/80'}">
                    ${todo.completed ? '<span class="text-white text-sm font-bold">✓</span>' : ''}
                </button>
                <span class="todo-text flex-1 text-gray-700 font-medium ${todo.completed ? 'line-through text-gray-400' : ''}">${this.escapeHtml(todo.text)}</span>
                <button class="delete-btn w-8 h-8 bg-gradient-to-r from-red-300 to-pink-300 hover:from-red-400 hover:to-pink-400 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 opacity-80 hover:opacity-100">
                    <span class="text-sm font-bold">×</span>
                </button>
            </li>
        `;
    }
    
    // HTML 이스케이프
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 통계 업데이트
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const remaining = total - completed;
        
        this.totalCount.textContent = total;
        this.completedCount.textContent = completed;
        this.remainingCount.textContent = remaining;
        
        // 완료된 할 일 삭제 버튼 상태 업데이트
        this.clearCompletedBtn.disabled = completed === 0;
    }
    
    // 빈 상태 관리
    updateEmptyState() {
        const filteredTodos = this.getFilteredTodos();
        if (filteredTodos.length === 0) {
            this.emptyState.classList.remove('hidden');
            this.todoList.classList.add('hidden');
        } else {
            this.emptyState.classList.add('hidden');
            this.todoList.classList.remove('hidden');
        }
    }
    
    // 화면 렌더링
    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // 할 일 목록 렌더링
        this.todoList.innerHTML = filteredTodos
            .map(todo => this.createTodoItemHTML(todo))
            .join('');
        
        // 통계 업데이트
        this.updateStats();
        
        // 빈 상태 관리
        this.updateEmptyState();
    }
    
    // 로컬 스토리지에서 할 일 목록 로드
    loadTodos() {
        try {
            const saved = localStorage.getItem('todos');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('할 일 목록을 불러오는데 실패했습니다:', error);
            return [];
        }
    }
    
    // 로컬 스토리지에 할 일 목록 저장
    saveTodos() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('할 일 목록을 저장하는데 실패했습니다:', error);
        }
    }
    
    // 다음 ID 계산
    getNextId() {
        return this.todos.length > 0 
            ? Math.max(...this.todos.map(t => t.id)) + 1 
            : 1;
    }
}

// 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});