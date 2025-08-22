// 공통 유틸리티 함수들

// 수학 유틸리티
const MathUtils = {
    // 값을 범위 내로 제한
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    // 선형 보간
    lerp(start, end, t) {
        return start + (end - start) * t;
    },
    
    // 값을 한 범위에서 다른 범위로 매핑
    map(value, fromMin, fromMax, toMin, toMax) {
        return (value - fromMin) * (toMax - toMin) / (fromMax - fromMin) + toMin;
    },
    
    // 랜덤 정수 생성 (min 이상 max 미만)
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },
    
    // 랜덤 실수 생성
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    // 각도를 라디안으로 변환
    toRadians(degrees) {
        return degrees * Math.PI / 180;
    },
    
    // 라디안을 각도로 변환
    toDegrees(radians) {
        return radians * 180 / Math.PI;
    },
    
    // 각도 정규화 (0-360도)
    normalizeAngle(angle) {
        while (angle < 0) angle += 360;
        while (angle >= 360) angle -= 360;
        return angle;
    },
    
    // 두 각도 사이의 최단 거리
    angleDifference(angle1, angle2) {
        let diff = angle2 - angle1;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        return diff;
    },
    
    // 거리 계산
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    // 거리의 제곱 (성능 최적화용)
    distanceSquared(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    }
};

// 충돌 감지 유틸리티
const CollisionUtils = {
    // AABB (Axis-Aligned Bounding Box) 충돌 감지
    checkAABB(rect1, rect2) {
        return !(rect1.x + rect1.width < rect2.x ||
                rect2.x + rect2.width < rect1.x ||
                rect1.y + rect1.height < rect2.y ||
                rect2.y + rect2.height < rect1.y);
    },
    
    // 원형 충돌 감지
    checkCircle(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (circle1.radius + circle2.radius);
    },
    
    // 점과 사각형 충돌 감지
    pointInRect(point, rect) {
        return point.x >= rect.x &&
               point.x <= rect.x + rect.width &&
               point.y >= rect.y &&
               point.y <= rect.y + rect.height;
    },
    
    // 점과 원 충돌 감지
    pointInCircle(point, circle) {
        const dx = point.x - circle.x;
        const dy = point.y - circle.y;
        return (dx * dx + dy * dy) <= (circle.radius * circle.radius);
    },
    
    // 선분과 사각형 충돌 감지
    lineRect(x1, y1, x2, y2, rect) {
        // 선분의 양 끝점이 사각형 안에 있는지 확인
        if (this.pointInRect({x: x1, y: y1}, rect) || 
            this.pointInRect({x: x2, y: y2}, rect)) {
            return true;
        }
        
        // 선분이 사각형의 각 변과 교차하는지 확인
        return this.lineLine(x1, y1, x2, y2, rect.x, rect.y, rect.x + rect.width, rect.y) ||
               this.lineLine(x1, y1, x2, y2, rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + rect.height) ||
               this.lineLine(x1, y1, x2, y2, rect.x + rect.width, rect.y + rect.height, rect.x, rect.y + rect.height) ||
               this.lineLine(x1, y1, x2, y2, rect.x, rect.y + rect.height, rect.x, rect.y);
    },
    
    // 두 선분의 교차 감지
    lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denominator = ((x4 - x3) * (y1 - y2) - (x1 - x2) * (y4 - y3));
        if (denominator === 0) return false;
        
        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;
        
        return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
    }
};

// 화면 경계 유틸리티
const BoundsUtils = {
    // 객체가 화면 밖으로 나갔는지 확인
    isOutOfBounds(obj, canvasWidth, canvasHeight, margin = 0) {
        return obj.x < -margin ||
               obj.x > canvasWidth + margin ||
               obj.y < -margin ||
               obj.y > canvasHeight + margin;
    },
    
    // 객체를 화면 경계 내로 제한
    clampToBounds(obj, canvasWidth, canvasHeight) {
        obj.x = MathUtils.clamp(obj.x, 0, canvasWidth - obj.width);
        obj.y = MathUtils.clamp(obj.y, 0, canvasHeight - obj.height);
    },
    
    // 객체가 화면 경계에 닿았는지 확인
    isTouchingBounds(obj, canvasWidth, canvasHeight) {
        return {
            left: obj.x <= 0,
            right: obj.x + obj.width >= canvasWidth,
            top: obj.y <= 0,
            bottom: obj.y + obj.height >= canvasHeight
        };
    },
    
    // 화면 랩어라운드 (한쪽 끝에서 나가면 반대편에서 나타남)
    wrapAround(obj, canvasWidth, canvasHeight) {
        if (obj.x < -obj.width) obj.x = canvasWidth;
        if (obj.x > canvasWidth) obj.x = -obj.width;
        if (obj.y < -obj.height) obj.y = canvasHeight;
        if (obj.y > canvasHeight) obj.y = -obj.height;
    }
};

// 색상 유틸리티
const ColorUtils = {
    // RGB를 HEX로 변환
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    
    // HEX를 RGB로 변환
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    
    // HSL을 RGB로 변환
    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    },
    
    // 두 색상 사이의 보간
    lerpColor(color1, color2, t) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return color1;
        
        const r = Math.round(MathUtils.lerp(rgb1.r, rgb2.r, t));
        const g = Math.round(MathUtils.lerp(rgb1.g, rgb2.g, t));
        const b = Math.round(MathUtils.lerp(rgb1.b, rgb2.b, t));
        
        return this.rgbToHex(r, g, b);
    },
    
    // 랜덤 색상 생성
    randomColor() {
        return this.rgbToHex(
            MathUtils.randomInt(0, 256),
            MathUtils.randomInt(0, 256),
            MathUtils.randomInt(0, 256)
        );
    }
};

// 배열 유틸리티
const ArrayUtils = {
    // 배열에서 랜덤 요소 선택
    randomElement(array) {
        return array[MathUtils.randomInt(0, array.length)];
    },
    
    // 배열 섞기 (Fisher-Yates 알고리즘)
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    // 배열에서 조건에 맞는 요소들 제거
    removeWhere(array, predicate) {
        for (let i = array.length - 1; i >= 0; i--) {
            if (predicate(array[i])) {
                array.splice(i, 1);
            }
        }
    },
    
    // 배열을 청크로 나누기
    chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
};

// 시간 유틸리티
const TimeUtils = {
    // 밀리초를 시:분:초 형식으로 변환
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        const sec = seconds % 60;
        const min = minutes % 60;
        
        if (hours > 0) {
            return `${hours}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        } else {
            return `${min}:${sec.toString().padStart(2, '0')}`;
        }
    },
    
    // 디바운스 함수 생성
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 스로틀 함수 생성
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// 로컬 스토리지 유틸리티
const StorageUtils = {
    // 데이터 저장
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('저장 실패:', e);
            return false;
        }
    },
    
    // 데이터 로드
    load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('로드 실패:', e);
            return defaultValue;
        }
    },
    
    // 데이터 삭제
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('삭제 실패:', e);
            return false;
        }
    },
    
    // 모든 데이터 삭제
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('전체 삭제 실패:', e);
            return false;
        }
    }
};