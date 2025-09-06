import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Mapping từ tên danh mục đến bảng chi tiết
const CATEGORY_TABLE_MAPPING = {
  'Decal': 'decals',
  'Tem/Decal': 'decals',
  'Bao Thư': 'envelopes', 
  'Phiếu Thu - Hóa Đơn': 'invoices_receipts',
  'Catalogue': 'catalogues',
  'Giấy Tiêu Đề': 'letterheads',
  'Card Visit': 'business_cards',
  'Tờ Rơi A4': 'flyers',
  'FORM/ FORMEX/ FRAME': 'forms_formex_frames',
  'STRAP/Name Tag/Dây Móc Khóa': 'straps_name_tags_keychains',
  'SLOGAN MASTER': 'slogan_masters',
  'Banner A4': 'banners_a4',
  'Wobbler': 'wobblers',
  'Các Loại Quạt': 'promotional_fans',
  'KẸP TÓC LÒ XO': 'hair_clips',
  'LY GIẤY 16oz IN TRỰC TIẾP': 'paper_cups_16oz_direct',
  'Ly giấy 9oz - 16oz IN DECAL DÁN': 'paper_cups_decal',
  'CUP HOLDER': 'cup_holders',
  'VÉ VÒNG TAY VẢI': 'fabric_wristbands',
  'TRANH GHÉP': 'puzzles',
  'LÓT CHUỘT/ LÓT LY': 'mousepads_coasters',
  'STANDEE MINI': 'standee_mini',
  'HUY HIỆU/ PIN BUTTON/ MÓC KHÓA GƯƠNG/ GƯƠNG TRÒN/ HH NAM CHÂM': 'badges_pins_keychains_mirrors',
  'SỔ TAY/ NOTEBOOK': 'notebooks',
  'CÁC LOẠI POSTER': 'posters_general',
  'Sticker theo yêu cầu': 'stickers_custom',
  'Bình nước rửa tay dạng thẻ 20ml': 'hand_sanitizer_bottles',
  'Photobook in offset': 'photobooks_offset',
  'Popsocket/ Móc khóa Mica': 'popsockets_mica_keychains',
  'Tập giấy có khoen Note In Tại Kas/ FLASHCARD': 'flashcards_notepads',
  'PHOTOBOOK GHIM GÁY': 'photobooks_stapled',
  'Card/ Pola/ Banner/ Strip/ Bookmark/ Cirlcle Card': 'cards_pola_banner_strip_etc',
  'CARD OFFSET 2 mặt': 'offset_business_cards',
  'Phí In Gấp': 'rush_fee_settings',
  'Cán Màng Hiệu Ứng': 'lamination_effects'
};

export function useCategoryProducts() {
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        const results = {};

        // Lấy một số danh mục chính để hiển thị
        const mainCategories = [
          'Decal',
          'Card Visit', 
          'Catalogue',
          'Bao Thư',
          'Các Loại Quạt',
          'CÁC LOẠI POSTER'
        ];

        // Fetch dữ liệu từng bảng
        for (const category of mainCategories) {
          const tableName = CATEGORY_TABLE_MAPPING[category];
          if (tableName) {
            try {
              const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .limit(10); // Lấy tối đa 10 sản phẩm mỗi danh mục

              if (error) {
                console.warn(`Error fetching from ${tableName}:`, error);
                results[category] = [];
              } else {
                results[category] = data || [];
              }
            } catch (err) {
              console.warn(`Failed to fetch ${tableName}:`, err);
              results[category] = [];
            }
          } else {
            results[category] = [];
          }
        }

        setCategoryProducts(results);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching category products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, []);

  return { categoryProducts, loading, error };
} 