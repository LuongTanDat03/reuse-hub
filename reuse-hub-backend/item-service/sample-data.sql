-- Item Service Sample Data
-- Generated on 2024-12-04

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insert Categories
INSERT INTO tbl_category (id, name, slug, created_at, updated_at) VALUES
(gen_random_uuid(), 'Điện tử', 'dien-tu', NOW(), NOW()),
(gen_random_uuid(), 'Thời trang', 'thoi-trang', NOW(), NOW()),
(gen_random_uuid(), 'Đồ gia dụng', 'do-gia-dung', NOW(), NOW()),
(gen_random_uuid(), 'Sách', 'sach', NOW(), NOW()),
(gen_random_uuid(), 'Thể thao', 'the-thao', NOW(), NOW());

-- Insert Items (5 items with 5 images each)
-- Note: We'll use subqueries to get user_id and category_id dynamically

-- Item 1: iPhone 13 Pro Max
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    (SELECT id FROM tbl_user WHERE username = 'nguyenvana' LIMIT 1),
    'iPhone 13 Pro Max 256GB - Xanh Sierra',
    'iPhone 13 Pro Max 256GB màu xanh Sierra, máy đẹp 99%, pin 95%, fullbox, còn bảo hành 6 tháng. Máy không trầy xước, không vào nước. Giao hàng tận nơi trong nội thành TP.HCM.',
    '["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800", "https://images.unsplash.com/photo-1632633728024-e1fd4bef561a?w=800", "https://images.unsplash.com/photo-1632661674393-c1d5e8e8e8e8?w=800", "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800", "https://images.unsplash.com/photo-1632633728024-e1fd4bef561a?w=800"]'::jsonb,
    '123 Nguyễn Huệ, Quận 1, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.7009, 10.7769), 4326),
    'AVAILABLE',
    125, 8, 15, 4.5, 10, 18500000, false,
    (SELECT id FROM tbl_category WHERE slug = 'dien-tu' LIMIT 1),
    NOW(), NOW();

-- Item 2: Áo khoác denim
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    (SELECT id FROM tbl_user WHERE username = 'tranthib' LIMIT 1),
    'Áo khoác Denim Unisex - Size M',
    'Áo khoác denim chất liệu cao cấp, form rộng unisex, màu xanh nhạt vintage. Mặc 2-3 lần, còn mới 95%. Size M phù hợp 50-65kg. Có thể giao hàng hoặc gặp mặt tại Quận 3.',
    '["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800", "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800", "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800", "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800", "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800"]'::jsonb,
    '456 Võ Văn Tần, Quận 3, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6917, 10.7756), 4326),
    'AVAILABLE',
    89, 5, 12, 4.8, 6, 350000, false,
    (SELECT id FROM tbl_category WHERE slug = 'thoi-trang' LIMIT 1),
    NOW(), NOW();

-- Item 3: Bàn làm việc gỗ
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    (SELECT id FROM tbl_user WHERE username = 'levanc' LIMIT 1),
    'Bàn làm việc gỗ công nghiệp 1m2 x 60cm',
    'Bàn làm việc gỗ công nghiệp cao cấp, màu nâu óc chó, kích thước 120cm x 60cm x 75cm. Bàn còn rất mới, chắc chắn, có 2 ngăn kéo. Phù hợp làm việc, học tập. Cần bán gấp do chuyển nhà.',
    '["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800", "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800", "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800", "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800", "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800"]'::jsonb,
    '789 Lê Văn Sỹ, Quận Phú Nhuận, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6831, 10.7975), 4326),
    'AVAILABLE',
    156, 12, 23, 4.7, 15, 1200000, false,
    (SELECT id FROM tbl_category WHERE slug = 'do-gia-dung' LIMIT 1),
    NOW(), NOW();

-- Item 4: Combo sách lập trình
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    (SELECT id FROM tbl_user WHERE username = 'phamthid' LIMIT 1),
    'Combo 5 cuốn sách lập trình JavaScript, React, Node.js',
    'Bộ 5 cuốn sách lập trình tiếng Anh gồm: JavaScript The Good Parts, Learning React, Node.js Design Patterns, Clean Code, You Don''t Know JS. Sách còn mới 90%, không ghi chú, không rách. Phù hợp cho developer muốn nâng cao kỹ năng.',
    '["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800", "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800", "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800"]'::jsonb,
    '234 Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6953, 10.7891), 4326),
    'AVAILABLE',
    203, 18, 34, 4.9, 22, 850000, false,
    (SELECT id FROM tbl_category WHERE slug = 'sach' LIMIT 1),
    NOW(), NOW();

-- Item 5: Xe đạp thể thao
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    (SELECT id FROM tbl_user WHERE username = 'hoangvane' LIMIT 1),
    'Xe đạp thể thao Giant ATX 26" - Màu đen đỏ',
    'Xe đạp thể thao Giant ATX 26 inch, màu đen đỏ, khung nhôm, 21 tốc độ Shimano. Xe mua 2 năm, bảo dưỡng định kỳ, phanh đĩa, giảm sóc trước. Phù hợp đi phố, tập thể dục. Tặng kèm bình nước và khóa xe.',
    '["https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800", "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800", "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800", "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800", "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800"]'::jsonb,
    '567 Cách Mạng Tháng 8, Quận 10, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6667, 10.7722), 4326),
    'AVAILABLE',
    178, 14, 28, 4.6, 18, 3200000, false,
    (SELECT id FROM tbl_category WHERE slug = 'the-thao' LIMIT 1),
    NOW(), NOW();

-- Insert Tags for Items
-- iPhone tags
INSERT INTO tbl_item_tags (item_id, tag_name)
SELECT id, 'iphone' FROM tbl_items WHERE title LIKE '%iPhone%'
UNION ALL
SELECT id, 'apple' FROM tbl_items WHERE title LIKE '%iPhone%'
UNION ALL
SELECT id, 'smartphone' FROM tbl_items WHERE title LIKE '%iPhone%'
UNION ALL
SELECT id, 'điện thoại' FROM tbl_items WHERE title LIKE '%iPhone%';

-- Áo khoác tags
INSERT INTO tbl_item_tags (item_id, tag_name)
SELECT id, 'thời trang' FROM tbl_items WHERE title LIKE '%Áo khoác%'
UNION ALL
SELECT id, 'áo khoác' FROM tbl_items WHERE title LIKE '%Áo khoác%'
UNION ALL
SELECT id, 'denim' FROM tbl_items WHERE title LIKE '%Denim%'
UNION ALL
SELECT id, 'unisex' FROM tbl_items WHERE title LIKE '%Unisex%';

-- Bàn làm việc tags
INSERT INTO tbl_item_tags (item_id, tag_name)
SELECT id, 'nội thất' FROM tbl_items WHERE title LIKE '%Bàn%'
UNION ALL
SELECT id, 'bàn làm việc' FROM tbl_items WHERE title LIKE '%Bàn%'
UNION ALL
SELECT id, 'gỗ' FROM tbl_items WHERE title LIKE '%gỗ%'
UNION ALL
SELECT id, 'văn phòng' FROM tbl_items WHERE title LIKE '%Bàn%';

-- Sách tags
INSERT INTO tbl_item_tags (item_id, tag_name)
SELECT id, 'sách' FROM tbl_items WHERE title LIKE '%sách%'
UNION ALL
SELECT id, 'lập trình' FROM tbl_items WHERE title LIKE '%lập trình%'
UNION ALL
SELECT id, 'javascript' FROM tbl_items WHERE title LIKE '%JavaScript%'
UNION ALL
SELECT id, 'react' FROM tbl_items WHERE title LIKE '%React%';

-- Xe đạp tags
INSERT INTO tbl_item_tags (item_id, tag_name)
SELECT id, 'xe đạp' FROM tbl_items WHERE title LIKE '%Xe đạp%'
UNION ALL
SELECT id, 'thể thao' FROM tbl_items WHERE title LIKE '%thể thao%'
UNION ALL
SELECT id, 'giant' FROM tbl_items WHERE title LIKE '%Giant%'
UNION ALL
SELECT id, 'xe đạp thể thao' FROM tbl_items WHERE title LIKE '%Xe đạp thể thao%';
