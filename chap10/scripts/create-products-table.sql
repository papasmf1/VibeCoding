-- 전자제품 쇼핑몰 - 전자제품 상품 테이블 생성 스크립트
-- Supabase SQL 편집기에서 실행하세요

-- 1. 상품 카테고리 테이블
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 전자제품 상품 테이블
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES public.product_categories(id),
  brand VARCHAR(100),
  model VARCHAR(100),
  specifications JSONB,
  images TEXT[], -- 이미지 URL 배열
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 장바구니 테이블
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 4. 주문 테이블
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
  shipping_address JSONB,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 주문 상세 테이블
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name VARCHAR(200) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 7. RLS 설정
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 8. 정책 설정
-- 상품 카테고리 - 모든 사용자 읽기 허용
CREATE POLICY "Allow all users to view categories" ON public.product_categories FOR SELECT USING (true);

-- 상품 - 모든 사용자 읽기 허용
CREATE POLICY "Allow all users to view products" ON public.products FOR SELECT USING (true);

-- 장바구니 - 사용자 자신의 장바구니만 접근
CREATE POLICY "Users can view own cart" ON public.cart_items FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own cart" ON public.cart_items FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own cart" ON public.cart_items FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own cart" ON public.cart_items FOR DELETE USING (auth.uid()::text = user_id::text);

-- 주문 - 사용자 자신의 주문만 접근
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 주문 상세 - 사용자 자신의 주문 상세만 접근
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id::text = auth.uid()::text
  )
);

-- 9. 샘플 데이터 삽입
INSERT INTO public.product_categories (name, description) VALUES
('스마트폰', '최신 스마트폰 및 액세서리'),
('노트북', '노트북 및 컴퓨터 관련 제품'),
('태블릿', '태블릿 및 관련 액세서리'),
('가전제품', '생활 가전 및 전자제품'),
('액세서리', '전자제품 액세서리 및 주변기기');

-- 10. 테이블 생성 확인
SELECT 
  table_name, 
  table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('product_categories', 'products', 'cart_items', 'orders', 'order_items');
