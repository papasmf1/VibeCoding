-- 전자제품 쇼핑몰 - 고객 문의 게시판 테이블 생성 스크립트
-- Supabase SQL 편집기에서 실행하세요

-- 1. 문의 게시판 테이블 생성
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

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON public.inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_author ON public.inquiries(author);

-- 3. RLS (Row Level Security) 설정
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 4. 문의 게시판 정책 (개발 환경용 - 모든 접근 허용)
-- 모든 사용자가 문의를 볼 수 있음 (공개 게시판)
CREATE POLICY "Allow all users to view inquiries" ON public.inquiries
  FOR SELECT USING (true);

-- 모든 사용자가 문의를 작성할 수 있음
CREATE POLICY "Allow all users to insert inquiries" ON public.inquiries
  FOR INSERT WITH CHECK (true);

-- 모든 사용자가 문의를 수정할 수 있음 (개발 환경용)
CREATE POLICY "Allow all users to update inquiries" ON public.inquiries
  FOR UPDATE USING (true);

-- 모든 사용자가 문의를 삭제할 수 있음 (개발 환경용)
CREATE POLICY "Allow all users to delete inquiries" ON public.inquiries
  FOR DELETE USING (true);

-- 5. 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. 트리거 생성
DROP TRIGGER IF EXISTS update_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER update_inquiries_updated_at
    BEFORE UPDATE ON public.inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. 샘플 데이터 삽입 (테스트용)
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

-- 8. 테이블 생성 확인
SELECT 
  table_name, 
  table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'inquiries';
