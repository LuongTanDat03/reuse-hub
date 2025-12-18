-- Item Service Seed Data
-- Chạy sau khi tables được tạo bởi JPA

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Tạo ENUM types nếu chưa có
DO $$ BEGIN
    CREATE TYPE item_status AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'HIDDEN', 'DELETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
DECLARE
    category_1 TEXT := gen_random_uuid()::text;
    category_2 TEXT := gen_random_uuid()::text;
    category_3 TEXT := gen_random_uuid()::text;
    category_4 TEXT := gen_random_uuid()::text;
    category_5 TEXT := gen_random_uuid()::text;
    category_6 TEXT := gen_random_uuid()::text;
    category_7 TEXT := gen_random_uuid()::text;
    category_8 TEXT := gen_random_uuid()::text;
    item_1 TEXT := gen_random_uuid()::text;
    item_2 TEXT := gen_random_uuid()::text;
    item_3 TEXT := gen_random_uuid()::text;
BEGIN
    -- Categories
    INSERT INTO tbl_category (id, name, slug, created_at, updated_at) VALUES
    (category_1, 'Điện tử', 'dien-tu', NOW(), NOW()),
    (category_2, 'Thời trang', 'thoi-trang', NOW(), NOW()),
(category_3, 'Đồ gia dụng', 'do-gia-dung', NOW(), NOW()),
(category_4, 'Sách & Văn phòng phẩm', 'sach-van-phong-pham', NOW(), NOW()),
(category_5, 'Thể thao', 'the-thao', NOW(), NOW()),
(category_6, 'Xe cộ', 'xe-co', NOW(), NOW()),
(category_7, 'Đồ trẻ em', 'do-tre-em', NOW(), NOW()),
(category_8, 'Nội thất', 'noi-that', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Items (10 sản phẩm, mỗi sản phẩm 5 ảnh)
INSERT INTO tbl_items (id, user_id, title, description, images, address, status, view_count, comment_count, like_count, rating, rating_count, price, is_premium, category_id, location, created_at, updated_at) VALUES

-- Item 1: iPhone 12 (User 1)
('item-001', '7eff7e70-beb2-43d3-9bfc-08f2bcfbfdcf', 'iPhone 12 Pro Max 256GB - Còn mới 95%', 
 'iPhone 12 Pro Max màu Pacific Blue, dung lượng 256GB. Máy còn mới 95%, pin 89%. Fullbox đầy đủ phụ kiện. Không trầy xước, hoạt động hoàn hảo.',
 '["https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800", "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800", "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800", "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800", "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800"]',
 '456 Lê Lợi, Quận 1, TP.HCM', 'AVAILABLE', 150, 12, 25, 4.5, 8, 15000000, false, 'cat-001',
 ST_SetSRID(ST_MakePoint(106.6602, 10.7626), 4326), NOW(), NOW()),

-- Item 2: Laptop Dell (User 1)
('item-002', '7eff7e70-beb2-43d3-9bfc-08f2bcfbfdcf', 'Laptop Dell XPS 15 - Core i7, 16GB RAM', 
 'Dell XPS 15 9500, CPU Intel Core i7-10750H, RAM 16GB, SSD 512GB, màn hình 15.6 inch 4K OLED. Máy đẹp như mới, bảo hành còn 6 tháng.',
 '["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800", "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800", "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"]',
 '456 Lê Lợi, Quận 1, TP.HCM', 'AVAILABLE', 200, 18, 35, 4.8, 12, 25000000, true, 'cat-001',
 ST_SetSRID(ST_MakePoint(106.6602, 10.7626), 4326), NOW(), NOW()),

-- Item 3: Áo khoác (User 2)
('item-003', '7eff7e70-beb2-43d3-9bfc-08f2bcfbfdcf', 'Áo khoác da nam cao cấp - Size L', 
 'Áo khoác da thật 100%, màu đen, size L. Mới mua được 2 tháng, mặc vài lần. Lý do bán: không vừa size.',
 '["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800", "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800", "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800", "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"]',
 '321 Võ Văn Tần, Quận 3, TP.HCM', 'AVAILABLE', 80, 5, 15, 4.2, 5, 2500000, false, 'cat-002',
 ST_SetSRID(ST_MakePoint(106.6880, 10.7769), 4326), NOW(), NOW()),

-- Item 4: Giày Nike (User 2)
('item-004', '7eff7e70-beb2-43d3-9bfc-08f2bcfbfdcf', 'Giày Nike Air Max 270 - Size 42', 
 'Giày Nike Air Max 270 chính hãng, màu trắng đen, size 42. Đã sử dụng 3 tháng, còn đẹp 90%. Có hộp và bill mua hàng.',
 '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800", "https://images.unsplash.com/photo-1491553895911-0055uj8a0e8?w=800", "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800", "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800"]',
 '321 Võ Văn Tần, Quận 3, TP.HCM', 'AVAILABLE', 120, 8, 22, 4.6, 7, 1800000, false, 'cat-002',
 ST_SetSRID(ST_MakePoint(106.6880, 10.7769), 4326), NOW(), NOW()),

-- Item 5: Nồi chiên không dầu (User 3)
('item-005', '7eff7e70-beb2-43d3-9bfc-08f2bcfbfdcf', 'Nồi chiên không dầu Philips 4.1L', 
 'Nồi chiên không dầu Philips HD9200, dung tích 4.1L. Mới mua 6 tháng, ít sử dụng. Còn bảo hành chính hãng.',
 '["https://images.unsplash.com/photo-1585515320310-259814833e62?w=800", "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800", "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800", "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800", "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800"]',
 '654 CMT8, Quận 10, TP.HCM', 'AVAILABLE', 95, 6, 18, 4.4, 6, 1500000, false, 'cat-003',
 ST_SetSRID(ST_MakePoint(106.6503, 10.8012), 4326), NOW(), NOW()),

-- Item 6: Máy hút bụi (User 3)
('item-006', '7eff7e70-beb2-43d3-9bfc-08f2bcfbfdcf', 'Máy hút bụi Dyson V11 - Like new', 
 'Máy hút bụi không dây Dyson V11 Absolute. Mới sử dụng 4 tháng, còn như mới. Đầy đủ phụ kiện và đầu hút.',
 '["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800", "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800", "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800", "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]',
 '654 CMT8, Quận 10, TP.HCM', 'AVAILABLE', 110, 9, 28, 4.7, 9, 8000000, true, 'cat-003',
 ST_SetSRID(ST_MakePoint(106.6503, 10.8012), 4326), NOW(), NOW()),

-- Item 7: Sách lập trình (User 1)
('item-007', '7eff7e70-beb2-43d3-9bfc-08f2bcfbfdcf', 'Combo 5 sách lập trình Java & Spring Boot', 
 'Bộ 5 cuốn sách lập trình: Clean Code, Design Patterns, Spring in Action, Java Concurrency, Effective Java. Sách còn mới 95%.',
 '["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800", "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800", "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800", "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800"]',
 '456 Lê Lợi, Quận 1, TP.HCM', 'AVAILABLE', 65, 4, 12, 4.3, 4, 500000, false, 'cat-004',
 ST_SetSRID(ST_MakePoint(106.6602, 10.7626), 4326), NOW(), NOW()),

-- Item 8: Xe đạp thể thao (User 2)
('item-008', '7eff7e70-beb2-43d3-9bfc-08f2bcfbfdcf', 'Xe đạp thể thao Giant ATX 830 - Size M', 
 'Xe đạp địa hình Giant ATX 830, khung nhôm, 27 tốc độ. Xe còn mới 90%, vừa bảo dưỡng xong. Tặng kèm mũ bảo hiểm.',
 '["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800", "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800", "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800", "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800", "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800"]',
 '321 Võ Văn Tần, Quận 3, TP.HCM', 'AVAILABLE', 180, 15, 40, 4.9, 15, 6500000, true, 'cat-005',
 ST_SetSRID(ST_MakePoint(106.6880, 10.7769), 4326), NOW(), NOW()),

-- Item 9: Đồ chơi trẻ em (User 3)
('item-009', '7eff7e70-beb2-43d3-9bfc-08f2bcfbfdcf', 'Bộ Lego City Police Station 60246', 
 'Bộ Lego City Police Station 60246, 743 mảnh ghép. Mới lắp 1 lần, đầy đủ chi tiết và hướng dẫn. Phù hợp trẻ từ 6 tuổi.',
 '["https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800", "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800", "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800", "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800", "https://images.unsplash.com/photo-1560961911-ba7ef651a56c?w=800"]',
 '654 CMT8, Quận 10, TP.HCM', 'AVAILABLE', 75, 3, 10, 4.1, 3, 1200000, false, 'cat-007',
 ST_SetSRID(ST_MakePoint(106.6503, 10.8012), 4326), NOW(), NOW()),

-- Item 10: Bàn làm việc (User 1)
('item-010', '7eff7e70-beb2-43d3-9bfc-08f2bcfbfdcf', 'Bàn làm việc gỗ tự nhiên 120x60cm', 
 'Bàn làm việc gỗ sồi tự nhiên, kích thước 120x60x75cm. Thiết kế hiện đại, có ngăn kéo. Mới mua 8 tháng, còn rất đẹp.',
 '["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800", "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800", "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800", "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800", "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"]',
 '456 Lê Lợi, Quận 1, TP.HCM', 'AVAILABLE', 90, 7, 20, 4.5, 6, 3500000, false, 'cat-008',
 ST_SetSRID(ST_MakePoint(106.6602, 10.7626), 4326), NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

-- Item Tags
INSERT INTO tbl_item_tags (item_id, tag_name) VALUES
('item-001', 'iphone'), ('item-001', 'apple'), ('item-001', 'điện thoại'), ('item-001', 'smartphone'),
('item-002', 'laptop'), ('item-002', 'dell'), ('item-002', 'xps'), ('item-002', 'máy tính'),
('item-003', 'áo khoác'), ('item-003', 'da'), ('item-003', 'nam'), ('item-003', 'thời trang'),
('item-004', 'giày'), ('item-004', 'nike'), ('item-004', 'thể thao'), ('item-004', 'sneaker'),
('item-005', 'nồi chiên'), ('item-005', 'philips'), ('item-005', 'gia dụng'), ('item-005', 'bếp'),
('item-006', 'máy hút bụi'), ('item-006', 'dyson'), ('item-006', 'không dây'), ('item-006', 'gia dụng'),
('item-007', 'sách'), ('item-007', 'lập trình'), ('item-007', 'java'), ('item-007', 'spring'),
('item-008', 'xe đạp'), ('item-008', 'giant'), ('item-008', 'thể thao'), ('item-008', 'địa hình'),
('item-009', 'lego'), ('item-009', 'đồ chơi'), ('item-009', 'trẻ em'), ('item-009', 'xếp hình'),
('item-010', 'bàn'), ('item-010', 'gỗ'), ('item-010', 'nội thất'), ('item-010', 'văn phòng')
ON CONFLICT DO NOTHING;

END $$;