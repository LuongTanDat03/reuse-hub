-- ============================================
-- ITEM DATABASE - INITIALIZATION
-- ============================================
\c item;

-- Extended Item Service Sample Data
-- Generated on 2024-12-04
-- Each category has at least 5 items, each item has 5 images

-- Clear existing data
TRUNCATE TABLE tbl_items CASCADE;
TRUNCATE TABLE tbl_category CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insert Categories
INSERT INTO tbl_category (id, name, slug, created_at, updated_at) VALUES
('220179cc-2485-4d23-bbaa-5e53727dc953', 'Điện tử', 'dien-tu', NOW(), NOW()),
('16d4959f-fe55-42b4-a951-5e53bb2e9ed5', 'Thời trang', 'thoi-trang', NOW(), NOW()),
('df85baf2-bc55-4b7b-9be6-97eae52fe8c2', 'Đồ gia dụng', 'do-gia-dung', NOW(), NOW()),
('df85baf2-bc55-4b7b-9be6-97eae52fe8c3', 'Sách', 'sach', NOW(), NOW()),
('DF85BAF2-BC55-4B7B-9BE6-97EAE52FE8C4', 'Thể thao', 'the-thao', NOW(), NOW());

-- ============================================
-- CATEGORY: ĐIỆN TỬ (5 items)
-- ============================================

-- Item 1: iPhone 13 Pro Max
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '4dd3584b-3b0a-41e0-a691-1fbeb4d9fe50',
    'iPhone 13 Pro Max 256GB - Xanh Sierra',
    'iPhone 13 Pro Max 256GB màu xanh Sierra, máy đẹp 99%, pin 95%, fullbox, còn bảo hành 6 tháng. Máy không trầy xước, không vào nước.',
    '["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800", "https://images.unsplash.com/photo-1632633728024-e1fd4bef561a?w=800", "https://images.unsplash.com/photo-1611472173362-3f53dbd65d80?w=800", "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800", "https://images.unsplash.com/photo-1592286927505-2fd0d113f8fe?w=800"]'::jsonb,
    '123 Nguyễn Huệ, Quận 1, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.7009, 10.7769), 4326),
    'AVAILABLE', 125, 8, 15, 4.5, 10, 18500000, false,
    '220179cc-2485-4d23-bbaa-5e53727dc953',
    NOW(), NOW()
);

-- Item 2: MacBook Pro M2
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '01f4495e-a4f1-4af9-9b0c-a1c2a2ebeb5a',
    'MacBook Pro M2 14" 16GB/512GB - Space Gray',
    'MacBook Pro M2 chip, 14 inch, 16GB RAM, 512GB SSD. Máy mới 98%, dùng 3 tháng, còn bảo hành Apple 21 tháng. Fullbox, sạc zin.',
    '["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800", "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800", "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800"]'::jsonb,
    '789 Lê Lợi, Quận 1, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6953, 10.7756), 4326),
    'AVAILABLE', 210, 15, 28, 4.8, 18, 32000000, true,
    '220179cc-2485-4d23-bbaa-5e53727dc953',
    NOW(), NOW()
);

-- Item 3: iPad Air M1
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '4dd3584b-3b0a-41e0-a691-1fbeb4d9fe50',
    'iPad Air M1 64GB WiFi - Màu Tím',
    'iPad Air M1 chip, 64GB, WiFi, màu tím. Máy đẹp 99%, dùng nhẹ nhàng, không trầy xước. Kèm bao da Apple Smart Folio chính hãng.',
    '["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800", "https://images.unsplash.com/photo-1585790050230-5dd28404f1e9?w=800", "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800", "https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=800", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800"]'::jsonb,
    '234 Pasteur, Quận 3, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6917, 10.7756), 4326),
    'AVAILABLE', 95, 6, 11, 4.6, 8, 12500000, false,
    '220179cc-2485-4d23-bbaa-5e53727dc953',
    NOW(), NOW()
);

-- Item 4: AirPods Pro 2
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '01f4495e-a4f1-4af9-9b0c-a1c2a2ebeb5a',
    'AirPods Pro 2 - Chính hãng VN/A',
    'AirPods Pro thế hệ 2, chính hãng VN/A, mới 100%, nguyên seal. Bảo hành 12 tháng Apple Việt Nam. Giao hàng toàn quốc.',
    '["https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800", "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800", "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800", "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800", "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800"]'::jsonb,
    '567 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.7009, 10.8031), 4326),
    'AVAILABLE', 180, 12, 22, 4.9, 15, 5800000, false,
    '220179cc-2485-4d23-bbaa-5e53727dc953',
    NOW(), NOW()
);

-- Item 5: Samsung Galaxy S23 Ultra
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '4dd3584b-3b0a-41e0-a691-1fbeb4d9fe50',
    'Samsung Galaxy S23 Ultra 256GB - Phantom Black',
    'Samsung S23 Ultra 256GB màu đen, máy đẹp 98%, pin 100%, fullbox. Kèm ốp lưng và dán cường lực. Bảo hành 10 tháng.',
    '["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800", "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800", "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800", "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800"]'::jsonb,
    '890 Cách Mạng Tháng 8, Quận 10, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6667, 10.7756), 4326),
    'AVAILABLE', 145, 9, 18, 4.7, 12, 19500000, false,
    '220179cc-2485-4d23-bbaa-5e53727dc953',
    NOW(), NOW()
);

-- ============================================
-- CATEGORY: THỜI TRANG (5 items)
-- ============================================

-- Item 6: Áo khoác Denim
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '01f4495e-a4f1-4af9-9b0c-a1c2a2ebeb5a',
    'Áo khoác Denim Unisex Oversize - Size M',
    'Áo khoác denim chất liệu cao cấp, form rộng unisex, màu xanh nhạt vintage. Mặc 2-3 lần, còn mới 95%. Size M phù hợp 50-65kg.',
    '["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800", "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800", "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=800", "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800", "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800"]'::jsonb,
    '456 Võ Văn Tần, Quận 3, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6917, 10.7756), 4326),
    'AVAILABLE', 89, 5, 12, 4.8, 6, 350000, false,
    '16d4959f-fe55-42b4-a951-5e53bb2e9ed5',
    NOW(), NOW()
);

-- Item 7: Giày Nike Air Force 1
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '4dd3584b-3b0a-41e0-a691-1fbeb4d9fe50',
    'Giày Nike Air Force 1 Low White - Size 42',
    'Nike Air Force 1 Low màu trắng full, size 42, rep 1:1 cao cấp. Đi 5-6 lần, còn rất mới, đế chưa mòn. Kèm box và giấy gói.',
    '["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800", "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800", "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800", "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800", "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800"]'::jsonb,
    '123 Trần Hưng Đạo, Quận 5, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6800, 10.7545), 4326),
    'AVAILABLE', 156, 11, 20, 4.6, 14, 850000, false,
    '16d4959f-fe55-42b4-a951-5e53bb2e9ed5',
    NOW(), NOW()
);

-- Item 8: Váy Maxi Hoa
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '01f4495e-a4f1-4af9-9b0c-a1c2a2ebeb5a',
    'Váy Maxi Hoa Nhí Vintage - Size S',
    'Váy maxi hoa nhí phong cách vintage, chất vải lụa mềm mại, thoáng mát. Size S phù hợp 45-52kg. Mặc 1 lần dự tiệc, còn mới 99%.',
    '["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800", "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800", "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800", "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800", "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"]'::jsonb,
    '789 Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6953, 10.7756), 4326),
    'AVAILABLE', 78, 4, 9, 4.9, 5, 280000, false,
    '16d4959f-fe55-42b4-a951-5e53bb2e9ed5',
    NOW(), NOW()
);

-- Item 9: Túi Xách Da
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '4dd3584b-3b0a-41e0-a691-1fbeb4d9fe50',
    'Túi Xách Da Thật Handmade - Màu Nâu',
    'Túi xách da bò thật 100%, handmade thủ công, màu nâu vintage. Kích thước vừa phải, nhiều ngăn tiện dụng. Dùng 6 tháng, còn đẹp.',
    '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800", "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800", "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"]'::jsonb,
    '234 Hai Bà Trưng, Quận 3, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6917, 10.7756), 4326),
    'AVAILABLE', 112, 7, 14, 4.7, 9, 650000, false,
    '16d4959f-fe55-42b4-a951-5e53bb2e9ed5',
    NOW(), NOW()
);

-- Item 10: Áo Thun Polo
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '01f4495e-a4f1-4af9-9b0c-a1c2a2ebeb5a',
    'Áo Thun Polo Nam Lacoste - Size L',
    'Áo polo Lacoste chính hãng, size L, màu xanh navy. Chất cotton cao cấp, form chuẩn. Mặc 3-4 lần, giặt máy vẫn giữ form tốt.',
    '["https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800", "https://images.unsplash.com/photo-1598032895397-b9c0c8b5e8f7?w=800", "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800", "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800", "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800"]'::jsonb,
    '567 Lý Thường Kiệt, Quận 10, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6667, 10.7756), 4326),
    'AVAILABLE', 92, 6, 10, 4.5, 7, 420000, false,
    '16d4959f-fe55-42b4-a951-5e53bb2e9ed5',
    NOW(), NOW()
);

-- ============================================
-- CATEGORY: ĐỒ GIA DỤNG (5 items)
-- ============================================

-- Item 11: Bàn làm việc gỗ
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '4dd3584b-3b0a-41e0-a691-1fbeb4d9fe50',
    'Bàn Làm Việc Gỗ Sồi 1m2 - Màu Walnut',
    'Bàn làm việc gỗ sồi tự nhiên, kích thước 120x60cm, màu walnut sang trọng. Chân sắt sơn tĩnh điện chắc chắn. Dùng 1 năm, còn đẹp.',
    '["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800", "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800", "https://images.unsplash.com/photo-1595428773637-3b0c7e0e6f8f?w=800", "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800", "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800"]'::jsonb,
    '890 Nguyễn Văn Cừ, Quận 5, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6800, 10.7545), 4326),
    'AVAILABLE', 134, 8, 16, 4.6, 11, 1200000, false,
    'df85baf2-bc55-4b7b-9be6-97eae52fe8c2',
    NOW(), NOW()
);

-- Item 12: Ghế Gaming
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '01f4495e-a4f1-4af9-9b0c-a1c2a2ebeb5a',
    'Ghế Gaming E-Dra Mars EGC203 - Đen Đỏ',
    'Ghế gaming E-Dra Mars, màu đen đỏ, tựa lưng 180 độ, gối tựa đầu và lưng. Dùng 8 tháng, còn mới 90%, không rách da.',
    '["https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800", "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800", "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800", "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800", "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800"]'::jsonb,
    '123 Lê Văn Sỹ, Quận 3, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6917, 10.7756), 4326),
    'AVAILABLE', 167, 10, 19, 4.7, 13, 1800000, false,
    'df85baf2-bc55-4b7b-9be6-97eae52fe8c2',
    NOW(), NOW()
);

-- Item 13: Tủ lạnh mini
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '4dd3584b-3b0a-41e0-a691-1fbeb4d9fe50',
    'Tủ Lạnh Mini 50L - Aqua',
    'Tủ lạnh mini Aqua 50L, tiết kiệm điện, hoạt động êm. Phù hợp phòng trọ, văn phòng. Dùng 1 năm, vẫn mát tốt, không ồn.',
    '["https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800", "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800", "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800", "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800", "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800"]'::jsonb,
    '456 Phan Xích Long, Quận Phú Nhuận, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6833, 10.7969), 4326),
    'AVAILABLE', 98, 5, 11, 4.5, 8, 1500000, false,
    'df85baf2-bc55-4b7b-9be6-97eae52fe8c2',
    NOW(), NOW()
);

-- Item 14: Nồi cơm điện
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '01f4495e-a4f1-4af9-9b0c-a1c2a2ebeb5a',
    'Nồi Cơm Điện Tử Sharp 1.8L',
    'Nồi cơm điện tử Sharp 1.8L, nấu cơm ngon, giữ ấm tốt. Lòng nồi chống dính, dễ vệ sinh. Dùng 6 tháng, còn mới 95%.',
    '["https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800", "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800", "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800", "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800", "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800"]'::jsonb,
    '789 Hoàng Văn Thụ, Quận Tân Bình, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6544, 10.7993), 4326),
    'AVAILABLE', 76, 4, 8, 4.8, 6, 650000, false,
    'df85baf2-bc55-4b7b-9be6-97eae52fe8c2',
    NOW(), NOW()
);

-- Item 15: Máy hút bụi
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '4dd3584b-3b0a-41e0-a691-1fbeb4d9fe50',
    'Máy Hút Bụi Cầm Tay Xiaomi G10',
    'Máy hút bụi cầm tay Xiaomi G10, lực hút mạnh 150W, pin 60 phút. Kèm đầy đủ phụ kiện. Dùng 4 tháng, còn bảo hành 8 tháng.',
    '["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800", "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800", "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800", "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800", "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800"]'::jsonb,
    '234 Cộng Hòa, Quận Tân Bình, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6544, 10.7993), 4326),
    'AVAILABLE', 145, 9, 17, 4.6, 12, 2200000, false,
    'df85baf2-bc55-4b7b-9be6-97eae52fe8c2',
    NOW(), NOW()
);

-- ============================================
-- CATEGORY: SÁCH (5 items)
-- ============================================

-- Item 16: Combo sách lập trình
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '01f4495e-a4f1-4af9-9b0c-a1c2a2ebeb5a',
    'Combo 5 Cuốn Sách Lập Trình Web',
    'Combo 5 cuốn: HTML/CSS, JavaScript, React, Node.js, MongoDB. Sách tiếng Việt, còn mới 98%, không ghi chú. Phù hợp người mới học.',
    '["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800", "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800", "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800"]'::jsonb,
    '567 Nguyễn Đình Chiểu, Quận 3, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6917, 10.7756), 4326),
    'AVAILABLE', 189, 14, 25, 4.9, 18, 850000, false,
    'df85baf2-bc55-4b7b-9be6-97eae52fe8c3',
    NOW(), NOW()
);

-- Item 17: Sách kinh tế
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '4dd3584b-3b0a-41e0-a691-1fbeb4d9fe50',
    'Sách "Nghĩ Giàu Làm Giàu" - Napoleon Hill',
    'Sách "Think and Grow Rich" bản tiếng Việt, bìa cứng, in màu đẹp. Đọc 1 lần, còn mới 99%, không gấp góc.',
    '["https://images.unsplash.com/photo-1589998059171-988d887df646?w=800", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800", "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800", "https://images.unsplash.com/photo-1589998059171-988d887df646?w=800"]'::jsonb,
    '890 Lê Duẩn, Quận 1, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6953, 10.7756), 4326),
    'AVAILABLE', 123, 8, 15, 4.7, 10, 180000, false,
    'df85baf2-bc55-4b7b-9be6-97eae52fe8c3',
    NOW(), NOW()
);

-- Item 18: Truyện Harry Potter
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '01f4495e-a4f1-4af9-9b0c-a1c2a2ebeb5a',
    'Bộ Truyện Harry Potter 7 Tập - Bản Tiếng Việt',
    'Bộ Harry Potter đầy đủ 7 tập, bản tiếng Việt, bìa mềm. Sách còn mới 95%, đọc cẩn thận, không rách hay ố vàng.',
    '["https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=800", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800", "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800", "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=800"]'::jsonb,
    '123 Bùi Viện, Quận 1, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6953, 10.7676), 4326),
    'AVAILABLE', 201, 16, 28, 4.9, 20, 650000, true,
    'df85baf2-bc55-4b7b-9be6-97eae52fe8c3',
    NOW(), NOW()
);

-- Item 19: Sách thiết kế
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '4dd3584b-3b0a-41e0-a691-1fbeb4d9fe50',
    'Sách "Đừng Bao Giờ Đi Ăn Một Mình"',
    'Sách kỹ năng networking và xây dựng mối quan hệ. Bản tiếng Việt, bìa cứng, in đẹp. Đọc 1 lần, còn mới 98%.',
    '["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800", "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800", "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"]'::jsonb,
    '456 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6917, 10.7756), 4326),
    'AVAILABLE', 87, 5, 10, 4.6, 7, 150000, false,
    'df85baf2-bc55-4b7b-9be6-97eae52fe8c3',
    NOW(), NOW()
);

-- Item 20: Manga One Piece
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '01f4495e-a4f1-4af9-9b0c-a1c2a2ebeb5a',
    'Manga One Piece Tập 1-50 - Bản Tiếng Việt',
    'Bộ manga One Piece từ tập 1 đến 50, bản tiếng Việt chính hãng. Sách còn mới 90%, một số tập có dấu hiệu cũ nhẹ.',
    '["https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=800", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800", "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800", "https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=800"]'::jsonb,
    '789 Trần Quang Khải, Quận 1, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6953, 10.7756), 4326),
    'AVAILABLE', 234, 18, 32, 4.8, 22, 1200000, true,
    'df85baf2-bc55-4b7b-9be6-97eae52fe8c3',
    NOW(), NOW()
);

-- ============================================
-- CATEGORY: THỂ THAO (5 items)
-- ============================================

-- Item 21: Xe đạp thể thao
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '4dd3584b-3b0a-41e0-a691-1fbeb4d9fe50',
    'Xe Đạp Thể Thao Giant ATX 26" - Màu Đen Đỏ',
    'Xe đạp Giant ATX 26 inch, màu đen đỏ, phanh đĩa, 21 tốc độ. Bảo dưỡng định kỳ, hoạt động tốt. Dùng 2 năm, còn chắc chắn.',
    '["https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800", "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800", "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800", "https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=800", "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800"]'::jsonb,
    '234 Võ Thị Sáu, Quận 3, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6917, 10.7756), 4326),
    'AVAILABLE', 178, 12, 21, 4.7, 15, 3200000, false,
    'DF85BAF2-BC55-4B7B-9BE6-97EAE52FE8C4',
    NOW(), NOW()
);

-- Item 22: Bóng đá
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '01f4495e-a4f1-4af9-9b0c-a1c2a2ebeb5a',
    'Bóng Đá Adidas Champions League Size 5',
    'Bóng đá Adidas Champions League chính hãng, size 5, da PU cao cấp. Dùng 10 lần, còn mới 90%, không xì hơi.',
    '["https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800", "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800", "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800", "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800", "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800"]'::jsonb,
    '567 Lý Chính Thắng, Quận 3, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6917, 10.7756), 4326),
    'AVAILABLE', 95, 6, 12, 4.6, 9, 450000, false,
    'DF85BAF2-BC55-4B7B-9BE6-97EAE52FE8C4',
    NOW(), NOW()
);

-- Item 23: Vợt cầu lông
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '4dd3584b-3b0a-41e0-a691-1fbeb4d9fe50',
    'Vợt Cầu Lông Yonex Astrox 88D Pro',
    'Vợt cầu lông Yonex Astrox 88D Pro, chính hãng, đã căng cước. Dùng 6 tháng, không móp méo, cán vợt còn mới.',
    '["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800", "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800", "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800", "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800", "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800"]'::jsonb,
    '890 Đinh Tiên Hoàng, Quận 1, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6953, 10.7756), 4326),
    'AVAILABLE', 112, 7, 14, 4.8, 10, 1800000, false,
    'DF85BAF2-BC55-4B7B-9BE6-97EAE52FE8C4',
    NOW(), NOW()
);

-- Item 24: Găng tay boxing
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '01f4495e-a4f1-4af9-9b0c-a1c2a2ebeb5a',
    'Găng Tay Boxing Everlast 12oz - Đỏ',
    'Găng tay boxing Everlast 12oz, màu đỏ, da PU cao cấp, đệm dày bảo vệ tốt. Dùng 4 tháng, còn mới 85%.',
    '["https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800", "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800", "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800"]'::jsonb,
    '123 Trường Sa, Quận 3, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6917, 10.7756), 4326),
    'AVAILABLE', 78, 5, 9, 4.5, 7, 650000, false,
    'DF85BAF2-BC55-4B7B-9BE6-97EAE52FE8C4',
    NOW(), NOW()
);

-- Item 25: Thảm tập yoga
INSERT INTO tbl_items (id, user_id, title, description, images, address, location, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '4dd3584b-3b0a-41e0-a691-1fbeb4d9fe50',
    'Thảm Tập Yoga TPE 8mm - Màu Tím',
    'Thảm yoga TPE 8mm, màu tím, chống trượt tốt, thân thiện môi trường. Kèm túi đựng và dây buộc. Dùng 3 tháng, còn mới 95%.',
    '["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800", "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800", "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800", "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800", "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800"]'::jsonb,
    '456 Nguyễn Trãi, Quận 5, TP.HCM',
    ST_SetSRID(ST_MakePoint(106.6800, 10.7545), 4326),
    'AVAILABLE', 89, 6, 11, 4.7, 8, 280000, false,
    'DF85BAF2-BC55-4B7B-9BE6-97EAE52FE8C4',
    NOW(), NOW()
);

-- Success message
SELECT 'Sample data inserted successfully! Total items: 25 (5 per category)' AS status;