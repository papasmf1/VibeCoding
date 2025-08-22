# 전자제품 쇼핑몰 (Jeonjajepum Shopping Mall)

전통 제품의 온라인 거래 플랫폼으로, 전통 공예가와 소비자를 연결하는 디지털 쇼핑몰입니다.

## 🚀 주요 기능

- **ID/PWD 기반 회원가입 및 로그인**
- **사용자 인증 시스템**
- **Supabase 데이터베이스 연동**
- **반응형 웹 디자인**
- **전통적인 디자인 테마**

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT, bcrypt
- **Deployment**: Vercel (권장)

## 📋 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd jeonjejepum-shopping-mall
```

### 2. 의존성 설치
```bash
npm install
# 또는
yarn install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
SUPABASE_URL=https://xaoqgesgodxopccfkqvj.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🗄️ 데이터베이스 설정

### Supabase 테이블 생성

다음 SQL을 Supabase SQL 편집기에서 실행하세요:

```sql
-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(20) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 세션 테이블
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- 인덱스 생성
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_login_time ON user_sessions(login_time);

-- RLS (Row Level Security) 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 사용자 테이블 정책
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- 세션 테이블 정책
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
```

## 📁 프로젝트 구조

```
jeonjejepum-shopping-mall/
├── components/          # React 컴포넌트
│   └── auth/           # 인증 관련 컴포넌트
│       ├── SignUpForm.tsx
│       └── SignInForm.tsx
├── lib/                 # 유틸리티 및 설정
│   └── supabase.ts     # Supabase 클라이언트
├── pages/               # Next.js 페이지
│   ├── api/            # API 엔드포인트
│   │   └── auth/       # 인증 API
│   │       ├── signup.ts
│   │       └── signin.ts
│   ├── _app.tsx        # 앱 루트 컴포넌트
│   ├── index.tsx       # 메인 페이지
│   └── auth.tsx        # 인증 페이지
├── styles/              # 스타일 파일
│   └── globals.css     # 전역 CSS
├── package.json         # 프로젝트 의존성
├── tailwind.config.js   # Tailwind CSS 설정
├── tsconfig.json        # TypeScript 설정
└── README.md            # 프로젝트 설명서
```

## 🔐 인증 시스템

### 회원가입
- 사용자명 (3-20자)
- 비밀번호 (최소 6자)
- 이메일 (선택사항)
- 비밀번호 해시화 (bcrypt)

### 로그인
- 사용자명/비밀번호 인증
- 세션 관리
- 로그인 기록 저장

## 🎨 디자인 특징

- **전통성과 현대성의 조화**
- **반응형 디자인**
- **접근성 고려**
- **한국어 폰트 최적화**

## 🚀 배포

### Vercel 배포 (권장)
1. Vercel 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포

### 수동 배포
```bash
npm run build
npm run start
```

## 📝 API 문서

### 회원가입
```
POST /api/auth/signup
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "email": "string (optional)"
}
```

### 로그인
```
POST /api/auth/signin
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**전자제품 쇼핑몰** - 전자 제품의 편리함을 현대적으로
