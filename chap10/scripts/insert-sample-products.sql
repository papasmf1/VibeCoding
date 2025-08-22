-- 전자제품 쇼핑몰 - 샘플 전자제품 데이터 삽입
-- Supabase SQL 편집기에서 실행하세요 (create-products-table.sql 실행 후)

-- 1. 스마트폰 카테고리 상품들
INSERT INTO public.products (name, description, price, original_price, stock_quantity, category_id, brand, model, specifications, images, is_featured) VALUES
(
  '갤럭시 S24 Ultra',
  '삼성 최신 플래그십 스마트폰, S펜 지원, AI 기능 탑재',
  1598000,
  1798000,
  50,
  (SELECT id FROM public.product_categories WHERE name = '스마트폰'),
  'Samsung',
  'Galaxy S24 Ultra',
  '{"display": "6.8인치 QHD+", "ram": "12GB", "storage": "512GB", "camera": "200MP + 12MP + 50MP + 10MP", "battery": "5000mAh"}',
  ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'],
  true
),
(
  'iPhone 15 Pro Max',
  '애플 최신 프리미엄 스마트폰, 티타늄 프레임, A17 Pro 칩',
  1750000,
  1950000,
  45,
  (SELECT id FROM public.product_categories WHERE name = '스마트폰'),
  'Apple',
  'iPhone 15 Pro Max',
  '{"display": "6.7인치 Super Retina XDR", "ram": "8GB", "storage": "256GB", "camera": "48MP + 12MP + 12MP", "battery": "4441mAh"}',
  ARRAY['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'],
  true
),
(
  '갤럭시 Z Fold5',
  '삼성 폴더블 스마트폰, 7.6인치 메인 디스플레이',
  2100000,
  2300000,
  30,
  (SELECT id FROM public.product_categories WHERE name = '스마트폰'),
  'Samsung',
  'Galaxy Z Fold5',
  '{"display": "7.6인치 QXGA+", "ram": "12GB", "storage": "512GB", "camera": "50MP + 12MP + 10MP", "battery": "4400mAh"}',
  ARRAY['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'],
  true
);

-- 2. 노트북 카테고리 상품들
INSERT INTO public.products (name, description, price, original_price, stock_quantity, category_id, brand, model, specifications, images, is_featured) VALUES
(
  'MacBook Pro 16" M3 Pro',
  '애플 M3 Pro 칩 탑재, 16인치 Liquid Retina XDR 디스플레이',
  3500000,
  3800000,
  25,
  (SELECT id FROM public.product_categories WHERE name = '노트북'),
  'Apple',
  'MacBook Pro 16" M3 Pro',
  '{"display": "16인치 Liquid Retina XDR", "processor": "M3 Pro", "ram": "18GB", "storage": "512GB SSD", "gpu": "18-core GPU"}',
  ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400'],
  true
),
(
  '갤럭시북3 Ultra',
  '삼성 최고급 노트북, RTX 4070 그래픽, 16인치 AMOLED',
  2800000,
  3100000,
  20,
  (SELECT id FROM public.product_categories WHERE name = '노트북'),
  'Samsung',
  'Galaxy Book3 Ultra',
  '{"display": "16인치 AMOLED 3K", "processor": "Intel i7-13700H", "ram": "32GB", "storage": "1TB SSD", "gpu": "RTX 4070"}',
  ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'],
  true
),
(
  'LG 그램 17" 2024',
  '초경량 17인치 노트북, 13세대 인텔 프로세서',
  1800000,
  2000000,
  35,
  (SELECT id FROM public.product_categories WHERE name = '노트북'),
  'LG',
  'Gram 17" 2024',
  '{"display": "17인치 WQXGA", "processor": "Intel i5-1340P", "ram": "16GB", "storage": "512GB SSD", "weight": "1.35kg"}',
  ARRAY['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400'],
  false
);

-- 3. 태블릿 카테고리 상품들
INSERT INTO public.products (name, description, price, original_price, stock_quantity, category_id, brand, model, specifications, images, is_featured) VALUES
(
  'iPad Pro 12.9" M2',
  '애플 M2 칩 탑재, 12.9인치 Liquid Retina XDR 디스플레이',
  1800000,
  2000000,
  40,
  (SELECT id FROM public.product_categories WHERE name = '태블릿'),
  'Apple',
  'iPad Pro 12.9" M2',
  '{"display": "12.9인치 Liquid Retina XDR", "processor": "M2", "ram": "8GB", "storage": "256GB", "camera": "12MP + 10MP"}',
  ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400'],
  true
),
(
  '갤럭시 탭 S9 Ultra',
  '삼성 최고급 태블릿, 14.6인치 AMOLED, S펜 포함',
  1500000,
  1700000,
  30,
  (SELECT id FROM public.product_categories WHERE name = '태블릿'),
  'Samsung',
  'Galaxy Tab S9 Ultra',
  '{"display": "14.6인치 AMOLED", "processor": "Snapdragon 8 Gen 2", "ram": "12GB", "storage": "256GB", "camera": "13MP + 8MP"}',
  ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400'],
  true
);

-- 4. 가전제품 카테고리 상품들
INSERT INTO public.products (name, description, price, original_price, stock_quantity, category_id, brand, model, specifications, images, is_featured) VALUES
(
  'LG 올레드 TV 65" C3',
  '65인치 4K OLED TV, AI 프로세서, 게이밍 최적화',
  2800000,
  3200000,
  15,
  (SELECT id FROM public.product_categories WHERE name = '가전제품'),
  'LG',
  'OLED TV 65" C3',
  '{"display": "65인치 4K OLED", "resolution": "3840x2160", "hdr": "HDR10, Dolby Vision", "refresh_rate": "120Hz"}',
  ARRAY['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400'],
  true
),
(
  '삼성 냉장고 비스포크',
  '4도어 프렌치 냉장고, AI 푸드 매니저, 600L',
  1800000,
  2000000,
  20,
  (SELECT id FROM public.product_categories WHERE name = '가전제품'),
  'Samsung',
  'Bespoke 4-Door',
  '{"capacity": "600L", "type": "4도어 프렌치", "features": "AI 푸드 매니저, 터치 스크린", "energy": "1등급"}',
  ARRAY['https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=400'],
  false
);

-- 5. 액세서리 카테고리 상품들
INSERT INTO public.products (name, description, price, original_price, stock_quantity, category_id, brand, model, specifications, images, is_featured) VALUES
(
  'AirPods Pro 2세대',
  '애플 최신 무선 이어폰, 액티브 노이즈 캔슬링',
  350000,
  400000,
  100,
  (SELECT id FROM public.product_categories WHERE name = '액세서리'),
  'Apple',
  'AirPods Pro 2nd Gen',
  '{"type": "무선 이어폰", "noise_cancelling": "액티브", "water_resistant": "IPX4", "battery": "6시간"}',
  ARRAY['https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400'],
  true
),
(
  '갤럭시 워치6 클래식',
  '삼성 스마트워치, 원형 베젤, 건강 모니터링',
  450000,
  500000,
  80,
  (SELECT id FROM public.product_categories WHERE name = '액세서리'),
  'Samsung',
  'Galaxy Watch6 Classic',
  '{"display": "1.5인치 원형", "size": "47mm", "battery": "425mAh", "features": "건강 모니터링, GPS"}',
  ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
  true
),
(
  'Magic Keyboard',
  '애플 매직 키보드, 촉각 엔진, 충전식 배터리',
  150000,
  180000,
  60,
  (SELECT id FROM public.product_categories WHERE name = '액세서리'),
  'Apple',
  'Magic Keyboard',
  '{"type": "무선 키보드", "layout": "한국어", "battery": "충전식", "connectivity": "Bluetooth 5.0"}',
  ARRAY['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'],
  false
);

-- 6. 데이터 확인
SELECT 
  p.name,
  p.price,
  p.stock_quantity,
  pc.name as category,
  p.brand
FROM public.products p
JOIN public.product_categories pc ON p.category_id = pc.id
ORDER BY pc.name, p.price DESC;
