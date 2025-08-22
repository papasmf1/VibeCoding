// 2D 벡터 클래스
class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    // 벡터 복사
    clone() {
        return new Vector2D(this.x, this.y);
    }
    
    // 벡터 설정
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    
    // 다른 벡터로부터 값 복사
    copy(vector) {
        this.x = vector.x;
        this.y = vector.y;
        return this;
    }
    
    // 벡터 덧셈
    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }
    
    // 벡터 뺄셈
    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }
    
    // 스칼라 곱셈
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    
    // 스칼라 나눗셈
    divide(scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
        }
        return this;
    }
    
    // 벡터 크기 (길이) 계산
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    // 벡터 크기의 제곱 (성능 최적화용)
    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }
    
    // 벡터 정규화 (단위 벡터로 만들기)
    normalize() {
        const mag = this.magnitude();
        if (mag > 0) {
            this.divide(mag);
        }
        return this;
    }
    
    // 정규화된 벡터 반환 (원본 유지)
    normalized() {
        return this.clone().normalize();
    }
    
    // 벡터 크기 설정
    setMagnitude(magnitude) {
        this.normalize();
        this.multiply(magnitude);
        return this;
    }
    
    // 벡터 제한 (최대 크기 설정)
    limit(max) {
        if (this.magnitude() > max) {
            this.setMagnitude(max);
        }
        return this;
    }
    
    // 내적 (dot product)
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }
    
    // 외적 (cross product) - 2D에서는 스칼라 값 반환
    cross(vector) {
        return this.x * vector.y - this.y * vector.x;
    }
    
    // 두 벡터 사이의 거리
    distanceTo(vector) {
        const dx = this.x - vector.x;
        const dy = this.y - vector.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // 두 벡터 사이의 거리의 제곱
    distanceToSquared(vector) {
        const dx = this.x - vector.x;
        const dy = this.y - vector.y;
        return dx * dx + dy * dy;
    }
    
    // 두 벡터 사이의 각도 (라디안)
    angleTo(vector) {
        return Math.atan2(vector.y - this.y, vector.x - this.x);
    }
    
    // 벡터의 각도 (라디안)
    angle() {
        return Math.atan2(this.y, this.x);
    }
    
    // 각도로부터 벡터 설정
    fromAngle(angle, magnitude = 1) {
        this.x = Math.cos(angle) * magnitude;
        this.y = Math.sin(angle) * magnitude;
        return this;
    }
    
    // 벡터 회전
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const newX = this.x * cos - this.y * sin;
        const newY = this.x * sin + this.y * cos;
        this.x = newX;
        this.y = newY;
        return this;
    }
    
    // 벡터 선형 보간
    lerp(vector, t) {
        this.x += (vector.x - this.x) * t;
        this.y += (vector.y - this.y) * t;
        return this;
    }
    
    // 벡터 반사 (법선 벡터 기준)
    reflect(normal) {
        const dot = this.dot(normal);
        this.x -= 2 * dot * normal.x;
        this.y -= 2 * dot * normal.y;
        return this;
    }
    
    // 벡터가 0인지 확인
    isZero() {
        return this.x === 0 && this.y === 0;
    }
    
    // 벡터 비교
    equals(vector, tolerance = 0.0001) {
        return Math.abs(this.x - vector.x) < tolerance &&
               Math.abs(this.y - vector.y) < tolerance;
    }
    
    // 벡터를 문자열로 변환
    toString() {
        return `Vector2D(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }
    
    // 정적 메서드들
    
    // 두 벡터 덧셈 (새 벡터 반환)
    static add(v1, v2) {
        return new Vector2D(v1.x + v2.x, v1.y + v2.y);
    }
    
    // 두 벡터 뺄셈 (새 벡터 반환)
    static subtract(v1, v2) {
        return new Vector2D(v1.x - v2.x, v1.y - v2.y);
    }
    
    // 벡터와 스칼라 곱셈 (새 벡터 반환)
    static multiply(vector, scalar) {
        return new Vector2D(vector.x * scalar, vector.y * scalar);
    }
    
    // 두 벡터 사이의 거리
    static distance(v1, v2) {
        return v1.distanceTo(v2);
    }
    
    // 두 벡터 사이의 각도
    static angle(v1, v2) {
        return v1.angleTo(v2);
    }
    
    // 각도로부터 벡터 생성
    static fromAngle(angle, magnitude = 1) {
        return new Vector2D(
            Math.cos(angle) * magnitude,
            Math.sin(angle) * magnitude
        );
    }
    
    // 랜덤 벡터 생성
    static random(magnitude = 1) {
        const angle = Math.random() * Math.PI * 2;
        return Vector2D.fromAngle(angle, magnitude);
    }
    
    // 선형 보간
    static lerp(v1, v2, t) {
        return new Vector2D(
            v1.x + (v2.x - v1.x) * t,
            v1.y + (v2.y - v1.y) * t
        );
    }
    
    // 상수 벡터들
    static get ZERO() { return new Vector2D(0, 0); }
    static get ONE() { return new Vector2D(1, 1); }
    static get UP() { return new Vector2D(0, -1); }
    static get DOWN() { return new Vector2D(0, 1); }
    static get LEFT() { return new Vector2D(-1, 0); }
    static get RIGHT() { return new Vector2D(1, 0); }
}