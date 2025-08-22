# 📋 Supabase 문의 게시판 설정 가이드

## 🚀 Supabase SQL 편집기에서 실행할 스크립트

### 1️⃣ 문의 게시판 테이블 생성

Supabase 대시보드 → SQL Editor에서 다음 스크립트를 실행하세요:

```sql
-- 고객 문의 게시판 테이블 생성
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answer TEXT,
  answered_at TIMESTAMP WITH TIME ZONE,
  answered_by UUID REFERENCES public.users(id)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON public.inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_author ON public.inquiries(author);

-- RLS (Row Level Security) 설정
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 정책 생성 (개발 환경용 - 모든 접근 허용)
CREATE POLICY "Allow all users to view inquiries" ON public.inquiries
  FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert inquiries" ON public.inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update inquiries" ON public.inquiries
  FOR UPDATE USING (true);

CREATE POLICY "Allow all users to delete inquiries" ON public.inquiries
  FOR DELETE USING (true);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inquiries_updated_at
    BEFORE UPDATE ON public.inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2️⃣ 샘플 데이터 삽입 (선택사항)

```sql
-- 테스트용 샘플 문의 데이터
INSERT INTO public.inquiries (title, content, author, email, status) VALUES
('배송 관련 문의', '주문한 상품의 배송 현황을 확인하고 싶습니다. 언제쯤 받을 수 있을까요?', '김고객', 'customer1@example.com', 'answered'),
('제품 A/S 문의', '구매한 노트북에 문제가 있어서 A/S를 받고 싶습니다. 어떻게 진행하면 될까요?', '이사용', 'user2@example.com', 'pending'),
('환불 요청', '주문 취소하고 환불받고 싶습니다. 절차가 어떻게 되나요?', '박구매', 'buyer3@example.com', 'pending'),
('제품 추천 요청', '게임용 컴퓨터를 구매하려고 하는데 어떤 제품을 추천해주실 수 있나요?', '최게이머', 'gamer4@example.com', 'answered');

-- 샘플 답변 추가
UPDATE public.inquiries 
SET answer = '안녕하세요! 주문하신 상품은 현재 배송 준비 중이며, 내일 오후에 발송 예정입니다. 배송은 1-2일 소요될 예정이니 조금만 기다려주세요. 감사합니다!', 
    answered_at = NOW(),
    status = 'answered'
WHERE title = '배송 관련 문의';

UPDATE public.inquiries 
SET answer = '게임용 컴퓨터로는 RTX 4070 탑재 모델을 추천드립니다. 현재 할인 행사 중이며, 성능 대비 가격이 우수합니다. 자세한 상담은 고객센터로 연락주세요!', 
    answered_at = NOW(),
    status = 'answered'
WHERE title = '제품 추천 요청';
```

### 3️⃣ 테이블 생성 확인

```sql
-- 테이블이 정상적으로 생성되었는지 확인
SELECT 
  table_name, 
  table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'inquiries';

-- 컬럼 구조 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'inquiries' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

## 🎯 설정 완료 후 기능

✅ **문의 작성**: 실제 Supabase DB에 저장  
✅ **문의 목록**: DB에서 실시간 조회  
✅ **답변 시스템**: 관리자 답변 기능  
✅ **상태 관리**: 답변 대기/완료/종료 상태  

## ⚠️ 중요 참고사항

- 현재는 개발 환경용으로 모든 사용자에게 접근 권한을 부여했습니다
- 프로덕션 환경에서는 적절한 인증 시스템과 함께 RLS 정책을 수정해야 합니다
- 관리자 답변 기능은 별도 관리자 페이지에서 구현하는 것을 권장합니다
