// 입력 관리 클래스
class InputManager {
    constructor() {
        // 키 상태 추적
        this.keys = {};
        this.keysPressed = {};
        this.keysReleased = {};
        
        // 마우스 상태
        this.mouse = {
            x: 0,
            y: 0,
            buttons: {},
            buttonsPressed: {},
            buttonsReleased: {}
        };
        
        // 터치 상태
        this.touches = [];
        this.touchStarted = [];
        this.touchEnded = [];
        
        // 가상 조이스틱 (모바일용)
        this.virtualJoystick = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            direction: new Vector2D(0, 0),
            deadZone: 20,
            maxDistance: 50
        };
        
        // 키 매핑
        this.keyMap = {
            // 이동
            'ArrowUp': 'up',
            'KeyW': 'up',
            'ArrowDown': 'down',
            'KeyS': 'down',
            'ArrowLeft': 'left',
            'KeyA': 'left',
            'ArrowRight': 'right',
            'KeyD': 'right',
            
            // 액션
            'Space': 'shoot',
            'Enter': 'start',
            'KeyR': 'restart',
            'Escape': 'pause',
            'KeyP': 'pause'
        };
        
        // 이벤트 리스너 등록
        this.setupEventListeners();
        
        // 모바일 감지
        this.isMobile = this.detectMobile();
        
        // 가상 컨트롤 생성 (모바일용)
        if (this.isMobile) {
            this.createVirtualControls();
        }
    }
    
    setupEventListeners() {
        // 키보드 이벤트
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // 마우스 이벤트
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // 터치 이벤트
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // 포커스 잃을 때 모든 키 해제
        window.addEventListener('blur', () => this.clearAllKeys());
    }
    
    update() {
        // 이전 프레임의 pressed/released 상태 초기화
        this.keysPressed = {};
        this.keysReleased = {};
        this.mouse.buttonsPressed = {};
        this.mouse.buttonsReleased = {};
        this.touchStarted = [];
        this.touchEnded = [];
    }
    
    // 키보드 이벤트 처리
    handleKeyDown(event) {
        const code = event.code;
        
        console.log('키 눌림:', code); // 디버깅용
        
        // 이미 눌려있는 키가 아닌 경우에만 pressed 이벤트 발생
        if (!this.keys[code]) {
            this.keysPressed[code] = true;
            console.log('키 pressed 이벤트:', code); // 디버깅용
            
            // 스페이스바 즉시 처리 (메뉴에서 게임 시작용)
            if (code === 'Space' && window.game) {
                console.log('현재 게임 상태:', window.game.state);
                if (window.game.state === 'menu') {
                    console.log('스페이스바로 게임 시작 시도');
                    window.game.startGame();
                }
            }
        }
        
        this.keys[code] = true;
        
        // 게임 관련 키는 기본 동작 방지
        if (this.keyMap[code] || code === 'Space') {
            event.preventDefault();
        }
    }
    
    handleKeyUp(event) {
        const code = event.code;
        this.keys[code] = false;
        this.keysReleased[code] = true;
        
        if (this.keyMap[code]) {
            event.preventDefault();
        }
    }
    
    // 마우스 이벤트 처리
    handleMouseDown(event) {
        const button = event.button;
        
        if (!this.mouse.buttons[button]) {
            this.mouse.buttonsPressed[button] = true;
        }
        
        this.mouse.buttons[button] = true;
    }
    
    handleMouseUp(event) {
        const button = event.button;
        this.mouse.buttons[button] = false;
        this.mouse.buttonsReleased[button] = true;
    }
    
    handleMouseMove(event) {
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
    }
    
    // 터치 이벤트 처리
    handleTouchStart(event) {
        event.preventDefault();
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const touchData = {
                id: touch.identifier,
                x: touch.clientX,
                y: touch.clientY,
                startX: touch.clientX,
                startY: touch.clientY
            };
            
            this.touches.push(touchData);
            this.touchStarted.push(touchData);
            
            // 가상 조이스틱 활성화
            if (!this.virtualJoystick.active) {
                this.activateVirtualJoystick(touch.clientX, touch.clientY);
            }
        }
    }
    
    handleTouchMove(event) {
        event.preventDefault();
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const existingTouch = this.touches.find(t => t.id === touch.identifier);
            
            if (existingTouch) {
                existingTouch.x = touch.clientX;
                existingTouch.y = touch.clientY;
                
                // 가상 조이스틱 업데이트
                if (this.virtualJoystick.active) {
                    this.updateVirtualJoystick(touch.clientX, touch.clientY);
                }
            }
        }
    }
    
    handleTouchEnd(event) {
        event.preventDefault();
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const touchIndex = this.touches.findIndex(t => t.id === touch.identifier);
            
            if (touchIndex !== -1) {
                const touchData = this.touches[touchIndex];
                this.touchEnded.push(touchData);
                this.touches.splice(touchIndex, 1);
                
                // 가상 조이스틱 비활성화
                if (this.virtualJoystick.active && this.touches.length === 0) {
                    this.deactivateVirtualJoystick();
                }
            }
        }
    }
    
    // 가상 조이스틱 관리
    activateVirtualJoystick(x, y) {
        this.virtualJoystick.active = true;
        this.virtualJoystick.startX = x;
        this.virtualJoystick.startY = y;
        this.virtualJoystick.currentX = x;
        this.virtualJoystick.currentY = y;
        this.updateVirtualJoystickDirection();
    }
    
    updateVirtualJoystick(x, y) {
        if (!this.virtualJoystick.active) return;
        
        this.virtualJoystick.currentX = x;
        this.virtualJoystick.currentY = y;
        this.updateVirtualJoystickDirection();
    }
    
    updateVirtualJoystickDirection() {
        const dx = this.virtualJoystick.currentX - this.virtualJoystick.startX;
        const dy = this.virtualJoystick.currentY - this.virtualJoystick.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.virtualJoystick.deadZone) {
            this.virtualJoystick.direction.set(0, 0);
        } else {
            const clampedDistance = Math.min(distance, this.virtualJoystick.maxDistance);
            this.virtualJoystick.direction.set(
                (dx / distance) * (clampedDistance / this.virtualJoystick.maxDistance),
                (dy / distance) * (clampedDistance / this.virtualJoystick.maxDistance)
            );
        }
    }
    
    deactivateVirtualJoystick() {
        this.virtualJoystick.active = false;
        this.virtualJoystick.direction.set(0, 0);
    }
    
    // 공개 메서드들
    
    // 키가 현재 눌려있는지 확인
    isKeyDown(key) {
        // 매핑된 키 이름으로 확인
        if (typeof key === 'string' && !key.startsWith('Key') && !key.startsWith('Arrow') && key !== 'Space') {
            const mappedKey = Object.keys(this.keyMap).find(k => this.keyMap[k] === key);
            if (mappedKey) {
                return !!this.keys[mappedKey];
            }
        }
        return !!this.keys[key];
    }
    
    // 키가 이번 프레임에 눌렸는지 확인
    isKeyPressed(key) {
        // 직접 키 코드로 확인
        if (key === 'Space') {
            return !!this.keysPressed['Space'];
        }
        
        // 매핑된 키 이름으로 확인
        if (typeof key === 'string' && !key.startsWith('Key') && !key.startsWith('Arrow')) {
            const mappedKey = Object.keys(this.keyMap).find(k => this.keyMap[k] === key);
            if (mappedKey) {
                return !!this.keysPressed[mappedKey];
            }
        }
        return !!this.keysPressed[key];
    }
    
    // 키가 이번 프레임에 떼어졌는지 확인
    isKeyReleased(key) {
        if (typeof key === 'string' && !key.startsWith('Key') && !key.startsWith('Arrow')) {
            const mappedKey = Object.keys(this.keyMap).find(k => this.keyMap[k] === key);
            if (mappedKey) {
                return !!this.keysReleased[mappedKey];
            }
        }
        return !!this.keysReleased[key];
    }
    
    // 이동 입력 벡터 가져오기
    getMovementVector() {
        const movement = new Vector2D(0, 0);
        
        // 키보드 입력
        if (this.isKeyDown('left')) movement.x -= 1;
        if (this.isKeyDown('right')) movement.x += 1;
        if (this.isKeyDown('up')) movement.y -= 1;
        if (this.isKeyDown('down')) movement.y += 1;
        
        // 가상 조이스틱 입력 (모바일)
        if (this.virtualJoystick.active) {
            movement.x += this.virtualJoystick.direction.x;
            movement.y += this.virtualJoystick.direction.y;
        }
        
        // 정규화 (대각선 이동 시 속도 보정)
        if (movement.magnitude() > 1) {
            movement.normalize();
        }
        
        return movement;
    }
    
    // 발사 입력 확인
    isShootPressed() {
        return this.isKeyPressed('shoot') || this.touchStarted.length > 0;
    }
    
    // 마우스 위치 가져오기
    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }
    
    // 터치 위치들 가져오기
    getTouchPositions() {
        return this.touches.map(touch => ({ x: touch.x, y: touch.y }));
    }
    
    // 모든 키 상태 초기화
    clearAllKeys() {
        this.keys = {};
        this.keysPressed = {};
        this.keysReleased = {};
        this.mouse.buttons = {};
        this.deactivateVirtualJoystick();
    }
    
    // 모바일 기기 감지
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }
    
    // 가상 컨트롤 UI 생성 (모바일용)
    createVirtualControls() {
        // 간단한 터치 영역 표시를 위한 CSS 추가
        const style = document.createElement('style');
        style.textContent = `
            .virtual-controls {
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                height: 100px;
                pointer-events: none;
                z-index: 1000;
            }
            
            .virtual-joystick {
                position: absolute;
                width: 80px;
                height: 80px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                left: 20px;
                bottom: 10px;
                display: none;
            }
            
            .virtual-joystick.active {
                display: block;
            }
            
            .virtual-joystick::after {
                content: '';
                position: absolute;
                width: 30px;
                height: 30px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            
            .touch-info {
                position: absolute;
                top: 10px;
                right: 20px;
                color: rgba(255, 255, 255, 0.7);
                font-size: 12px;
                text-align: right;
            }
        `;
        document.head.appendChild(style);
        
        // 가상 컨트롤 HTML 추가
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'virtual-controls';
        controlsDiv.innerHTML = `
            <div class="virtual-joystick" id="virtualJoystick"></div>
            <div class="touch-info">터치로 이동<br>탭으로 발사</div>
        `;
        document.body.appendChild(controlsDiv);
    }
    
    // 디버그 정보 가져오기
    getDebugInfo() {
        return {
            keysDown: Object.keys(this.keys).filter(key => this.keys[key]),
            mousePosition: this.getMousePosition(),
            touchCount: this.touches.length,
            virtualJoystick: this.virtualJoystick.active ? {
                direction: this.virtualJoystick.direction,
                distance: this.virtualJoystick.direction.magnitude()
            } : null
        };
    }
}