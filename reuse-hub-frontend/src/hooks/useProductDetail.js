import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Mapping product names to their corresponding detail table names
const PRODUCT_TABLE_MAPPING = {
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
  'Kẹp Tóc Lò Xo': 'hair_clips',
  'LY GIẤY 16oz IN TRỰC TIẾP': 'paper_cups_16oz_direct',
  'Ly giấy 9oz - 16oz IN DECAL DÁN': 'paper_cups_decal',
  'CUP HOLDER': 'cup_holders',
  'VÉ VÒNG TAY VẢI': 'fabric_wristbands',
  'TRANH GHÉP': 'puzzles',
  'Tranh Ghép (Puzzle)': 'puzzles',
  'LÓT CHUỘT/ LÓT LY': 'mousepads_coasters',
  'STANDEE MINI': 'standee_mini',
  'Standee Mini': 'standee_mini',
  'HUY HIỆU/ PIN BUTTON/ MÓC KHÓA GƯƠNG/ GƯƠNG TRÒN/ HH NAM CHÂM': 'badges_pins_keychains_mirrors',
  'SỔ TAY/ NOTEBOOK': 'notebooks',
  'CÁC LOẠI POSTER': 'posters_general',
  'Các Loại Poster': 'posters_general',
  'Poster': 'posters_general',
  'POSTER': 'posters_general',
  'Sticker theo yêu cầu': 'stickers_custom',
  'Bình nước rửa tay dạng thẻ 20ml': 'hand_sanitizer_bottles',
  'Photobook in offset': 'photobooks_offset',
  'Popsocket/ Móc khóa Mica': 'popsockets_mica_keychains',
  'Tập giấy có khoen Note In Tại Kas/ FLASHCARD': 'flashcards_notepads',
  'PHOTOBOOK GHIM GÁY': 'photobooks_stapled',
  'Card/ Pola/ Banner/ Strip/ Bookmark/ Cirlcle Card': 'cards_pola_banner_strip_etc',
  'CARD OFFSET 2 mặt': 'offset_business_cards',
  'Phí In Gấp': 'rush_fee_settings',
  'Cán Màng Hiệu Ứng': 'lamination_effects',
  'Quạt Quảng Cáo': 'promotional_fans'
};

// Tables that use range-based pricing (min_quantity, max_quantity)
const RANGE_BASED_PRICING_TABLES = [
  'forms_formex_frames',
  'straps_name_tags_keychains',
  'wobblers',
  'promotional_fans',
  'hair_clips',
  'puzzles',
  'standee_mini',
  'posters_general'
];

/**
 * Hàm để lấy giá sản phẩm từ bảng forms_formex_frames theo khoảng số lượng.
 * @param {string} productType - Loại sản phẩm (e.g., 'FORM/FORMEX/FRAME', 'HASHTAG').
 * @param {string} sizeCategory - Danh mục kích thước (e.g., 'A6 S4', 'A4 MỎNG').
 * @param {number | null} thicknessMm - Độ dày bằng mm (e.g., 5.0, 3.0). Dùng null nếu không có.
 * @param {number} desiredQuantity - Số lượng mà người dùng muốn đặt.
 * @returns {Promise<number | null>} - Giá trên mỗi đơn vị (VND) hoặc null nếu không tìm thấy.
 */
export async function getFormsFramesPrice(productType, sizeCategory, thicknessMm, desiredQuantity) {
  try {
    let query = supabase
      .from('forms_formex_frames')
      .select('price_per_unit_vnd, min_quantity, max_quantity, set_info')
      .eq('product_type', productType)
      .eq('size_category', sizeCategory);

    if (thicknessMm !== null) {
      query = query.eq('thickness_mm', thicknessMm);
    } else {
      query = query.is('thickness_mm', null);
    }

    query = query.lte('min_quantity', desiredQuantity);
    query = query.order('min_quantity', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Lỗi khi truy vấn giá:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      for (const priceTier of data) {
        if (desiredQuantity >= priceTier.min_quantity &&
            (priceTier.max_quantity === null || desiredQuantity <= priceTier.max_quantity)) {
          return priceTier.price_per_unit_vnd;
        }
      }
      return null;
    } else {
      console.warn('Không tìm thấy dữ liệu giá cho các tiêu chí đã cho.');
      return null;
    }

  } catch (error) {
    console.error('Lỗi không xác định khi lấy giá:', error.message);
    return null;
  }
}

/**
 * Hàm để lấy giá sản phẩm từ bảng straps_name_tags_keychains theo khoảng số lượng.
 * @param {string} productType - Loại sản phẩm (e.g., 'Strap', 'Name Tag', 'Dây Móc Khóa').
 * @param {string} dimensionsCm - Kích thước của strap (e.g., '10cm x 2cm', '15cm x 2cm').
 * @param {string} printingMethod - Phương pháp in (e.g., 'IN NHIỆT').
 * @param {number} desiredQuantity - Số lượng mà người dùng muốn đặt.
 * @returns {Promise<number | null>} - Giá trên mỗi đơn vị (VND) hoặc null nếu không tìm thấy.
 */
export async function getStrapPrice(productType, dimensionsCm, printingMethod, desiredQuantity) {
  try {
    let query = supabase
      .from('straps_name_tags_keychains')
      .select('price_per_unit_vnd, min_quantity, max_quantity, test_sample_info')
      .eq('product_type', productType)
      .eq('dimensions_cm', dimensionsCm)
      .eq('printing_method', printingMethod);

    query = query.lte('min_quantity', desiredQuantity);
    query = query.order('min_quantity', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Lỗi khi truy vấn giá strap:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      for (const priceTier of data) {
        if (desiredQuantity >= priceTier.min_quantity &&
            (priceTier.max_quantity === null || desiredQuantity <= priceTier.max_quantity)) {
          return priceTier.price_per_unit_vnd;
        }
      }
      return null;
    } else {
      console.warn('Không tìm thấy dữ liệu giá strap cho các tiêu chí đã cho.');
      return null;
    }

  } catch (error) {
    console.error('Lỗi không xác định khi lấy giá strap:', error.message);
    return null;
  }
}

/**
 * Hàm để lấy giá sản phẩm từ bảng wobblers theo khoảng số lượng.
 * @param {string} baseType - Loại chân (e.g., 'Chân nhựa').
 * @param {string} springMaterial - Vật liệu lò xo (e.g., 'lò xo kim loại (cao 11cm)').
 * @param {string} imageMaterial - Vật liệu hình ảnh (e.g., 'C300 + ép Plastic (Hình cao 15cm)').
 * @param {number} imageHeightCm - Chiều cao hình ảnh tính bằng cm (e.g., 15.0).
 * @param {number} desiredQuantity - Số lượng mà người dùng muốn đặt.
 * @returns {Promise<number | null>} - Giá trên mỗi đơn vị (VND) hoặc null nếu không tìm thấy.
 */
export async function getWobblerPrice(baseType, springMaterial, imageMaterial, imageHeightCm, desiredQuantity) {
  try {
    let query = supabase
      .from('wobblers')
      .select('price_per_unit_vnd, min_quantity, max_quantity, test_sample_info')
      .eq('base_type', baseType)
      .eq('spring_material', springMaterial)
      .eq('image_material', imageMaterial)
      .eq('image_height_cm', imageHeightCm);

    query = query.lte('min_quantity', desiredQuantity);
    query = query.order('min_quantity', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Lỗi khi truy vấn giá Wobbler:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      for (const priceTier of data) {
        if (desiredQuantity >= priceTier.min_quantity &&
            (priceTier.max_quantity === null || desiredQuantity <= priceTier.max_quantity)) {
          return priceTier.price_per_unit_vnd;
        }
      }
      return null;
    } else {
      console.warn('Không tìm thấy dữ liệu giá Wobbler cho các tiêu chí đã cho.');
      return null;
    }

  } catch (error) {
    console.error('Lỗi không xác định khi lấy giá Wobbler:', error.message);
    return null;
  }
}

/**
 * Hàm để lấy giá sản phẩm từ bảng promotional_fans theo khoảng số lượng.
 * @param {string} fanType - Loại quạt (e.g., 'Quạt tròn nhựa 17cm', 'Quạt vuông 17cm').
 * @param {number} desiredQuantity - Số lượng mà người dùng muốn đặt.
 * @param {number} productId - ID của sản phẩm (optional).
 * @returns {Promise<number | null>} - Giá trên mỗi đơn vị (VND) hoặc null nếu không tìm thấy.
 */
export async function getFanPrice(fanType, desiredQuantity, productId = null) {
  try {
    console.log('getFanPrice called with:', { fanType, desiredQuantity, productId });
    
    let query = supabase
      .from('promotional_fans')
      .select('price_per_unit_vnd, min_quantity, max_quantity, fan_type, product_id')
      .eq('fan_type', fanType)
      .lte('min_quantity', desiredQuantity) // desiredQuantity phải >= min_quantity
      .order('min_quantity', { ascending: false }); // Sắp xếp giảm dần để ưu tiên mức giá tốt hơn

    // Nếu có productId, thêm điều kiện lọc theo product_id
    if (productId) {
      query = query.eq('product_id', productId);
    }

    query = query.limit(1); // Chỉ lấy bản ghi đầu tiên (mức giá tốt nhất thỏa mãn)

    const { data, error } = await query;

    if (error) {
      console.error('Lỗi khi truy vấn giá quạt:', error.message);
      return null;
    }

    console.log('getFanPrice query result:', { data, error });

    if (data && data.length > 0) {
      const priceTier = data[0];
      console.log('Found price tier:', priceTier);
      // Kiểm tra lại để đảm bảo desiredQuantity nằm trong khoảng max_quantity
      if (desiredQuantity >= priceTier.min_quantity &&
          (priceTier.max_quantity === null || desiredQuantity <= priceTier.max_quantity)) {
        console.log('Price tier matches quantity range, returning:', priceTier.price_per_unit_vnd);
        return priceTier.price_per_unit_vnd;
      }
      console.log('Price tier found but quantity range does not match');
      return null; // Không tìm thấy khoảng giá phù hợp
    } else {
      console.warn('Không tìm thấy dữ liệu giá quạt cho các tiêu chí đã cho.');
      return null;
    }

  } catch (error) {
    console.error('Lỗi không xác định khi lấy giá quạt:', error.message);
    return null;
  }
}

/**
 * Hàm để lấy giá sản phẩm từ bảng hair_clips theo khoảng số lượng.
 * @param {string} clipType - Loại kẹp (e.g., 'Kẹp tóc lò xo, kẹp đen, hình C300 ép plastic cắt theo hình. Dán vào bảng keo nền').
 * @param {string} imageMaterial - Vật liệu hình ảnh (optional).
 * @param {number} desiredQuantity - Số lượng mà người dùng muốn đặt.
 * @param {number} productId - ID của sản phẩm (optional).
 * @returns {Promise<number | null>} - Giá trên mỗi đơn vị (VND) hoặc null nếu không tìm thấy.
 */
export async function getHairClipPrice(clipType, imageMaterial, desiredQuantity, productId = null) {
  try {
    console.log('getHairClipPrice called with:', { clipType, imageMaterial, desiredQuantity, productId });
    
    let query = supabase
      .from('hair_clips')
      .select('price_per_unit_vnd, min_quantity, max_quantity, clip_type, image_material, product_id')
      .eq('clip_type', clipType)
      .lte('min_quantity', desiredQuantity) // desiredQuantity phải >= min_quantity
      .order('min_quantity', { ascending: false }); // Sắp xếp giảm dần để ưu tiên mức giá tốt hơn

    // Nếu có imageMaterial, thêm điều kiện lọc
    if (imageMaterial) {
      query = query.eq('image_material', imageMaterial);
    }

    // Nếu có productId, thêm điều kiện lọc theo product_id
    if (productId) {
      query = query.eq('product_id', productId);
    }

    query = query.limit(1); // Chỉ lấy bản ghi đầu tiên (mức giá tốt nhất thỏa mãn)

    const { data, error } = await query;

    if (error) {
      console.error('Lỗi khi truy vấn giá kẹp tóc:', error.message);
      return null;
    }

    console.log('getHairClipPrice query result:', { data, error });

    if (data && data.length > 0) {
      const priceTier = data[0];
      console.log('Found price tier:', priceTier);
      // Kiểm tra lại để đảm bảo desiredQuantity nằm trong khoảng max_quantity
      if (desiredQuantity >= priceTier.min_quantity &&
          (priceTier.max_quantity === null || desiredQuantity <= priceTier.max_quantity)) {
        console.log('Price tier matches quantity range, returning:', priceTier.price_per_unit_vnd);
        return priceTier.price_per_unit_vnd;
      }
      console.log('Price tier found but quantity range does not match');
      return null; // Không tìm thấy khoảng giá phù hợp
    } else {
      console.warn('Không tìm thấy dữ liệu giá kẹp tóc cho các tiêu chí đã cho.');
      return null;
    }

  } catch (error) {
    console.error('Lỗi không xác định khi lấy giá kẹp tóc:', error.message);
    return null;
  }
}

/**
 * Hàm để lấy giá sản phẩm từ bảng puzzles theo khoảng số lượng.
 * @param {string} sizeCategory - Danh mục kích thước (e.g., 'A5 14.3x19.8cm', 'A4 19.9x29cm').
 * @param {string} numberOfPieces - Số mảnh (e.g., '80 mảnh', '40 mảnh', '120 mảnh').
 * @param {number} desiredQuantity - Số lượng mà người dùng muốn đặt.
 * @param {number} productId - ID của sản phẩm (optional).
 * @returns {Promise<number | null>} - Giá trên mỗi đơn vị (VND) hoặc null nếu không tìm thấy.
 */
export async function getPuzzlePrice(sizeCategory, numberOfPieces, desiredQuantity, productId = null) {
  try {
    console.log('getPuzzlePrice called with:', { sizeCategory, numberOfPieces, desiredQuantity, productId });
    
    let query = supabase
      .from('puzzles')
      .select('price_per_unit_vnd, min_quantity, max_quantity, size_category, number_of_pieces, product_id')
      .eq('size_category', sizeCategory)
      .lte('min_quantity', desiredQuantity) // desiredQuantity phải >= min_quantity
      .order('min_quantity', { ascending: false }); // Sắp xếp giảm dần để ưu tiên mức giá tốt hơn

    // Nếu có numberOfPieces, thêm điều kiện lọc
    if (numberOfPieces) {
      query = query.eq('number_of_pieces', numberOfPieces);
    }

    // Nếu có productId, thêm điều kiện lọc theo product_id
    if (productId) {
      query = query.eq('product_id', productId);
    }

    query = query.limit(1); // Chỉ lấy bản ghi đầu tiên (mức giá tốt nhất thỏa mãn)

    const { data, error } = await query;

    if (error) {
      console.error('Lỗi khi truy vấn giá tranh ghép:', error.message);
      return null;
    }

    console.log('getPuzzlePrice query result:', { data, error });

    if (data && data.length > 0) {
      const priceTier = data[0];
      console.log('Found price tier:', priceTier);
      // Kiểm tra lại để đảm bảo desiredQuantity nằm trong khoảng max_quantity
      if (desiredQuantity >= priceTier.min_quantity &&
          (priceTier.max_quantity === null || desiredQuantity <= priceTier.max_quantity)) {
        console.log('Price tier matches quantity range, returning:', priceTier.price_per_unit_vnd);
        return priceTier.price_per_unit_vnd;
      }
      console.log('Price tier found but quantity range does not match');
      return null; // Không tìm thấy khoảng giá phù hợp
    } else {
      console.warn('Không tìm thấy dữ liệu giá tranh ghép cho các tiêu chí đã cho.');
      return null;
    }

  } catch (error) {
    console.error('Lỗi không xác định khi lấy giá tranh ghép:', error.message);
    return null;
  }
}

/**
 * Hàm để lấy giá sản phẩm từ bảng standee_mini theo khoảng số lượng.
 * @param {string} dimensionsCm - Kích thước (e.g., '15x30cm', '20x30cm (A4)', '30x42cm (A3)').
 * @param {boolean} includesStand - Có bao gồm chân hay không.
 * @param {number} desiredQuantity - Số lượng mà người dùng muốn đặt.
 * @param {number} productId - ID của sản phẩm (optional).
 * @returns {Promise<number | null>} - Giá trên mỗi đơn vị (VND) hoặc null nếu không tìm thấy.
 */
export async function getStandeeMiniPrice(dimensionsCm, includesStand, desiredQuantity, productId = null) {
  try {
    console.log('getStandeeMiniPrice called with:', { dimensionsCm, includesStand, desiredQuantity, productId });
    
    let query = supabase
      .from('standee_mini')
      .select('price_per_unit_vnd, min_quantity, max_quantity, dimensions_cm, includes_stand, product_id')
      .eq('dimensions_cm', dimensionsCm)
      .eq('includes_stand', includesStand)
      .lte('min_quantity', desiredQuantity) // desiredQuantity phải >= min_quantity
      .order('min_quantity', { ascending: false }); // Sắp xếp giảm dần để ưu tiên mức giá tốt hơn

    // Nếu có productId, thêm điều kiện lọc theo product_id
    if (productId) {
      query = query.eq('product_id', productId);
    }

    query = query.limit(1); // Chỉ lấy bản ghi đầu tiên (mức giá tốt nhất thỏa mãn)

    const { data, error } = await query;

    if (error) {
      console.error('Lỗi khi truy vấn giá standee mini:', error.message);
      return null;
    }

    console.log('getStandeeMiniPrice query result:', { data, error });

    if (data && data.length > 0) {
      const priceTier = data[0];
      console.log('Found price tier:', priceTier);
      // Kiểm tra lại để đảm bảo desiredQuantity nằm trong khoảng max_quantity
      if (desiredQuantity >= priceTier.min_quantity &&
          (priceTier.max_quantity === null || desiredQuantity <= priceTier.max_quantity)) {
        console.log('Price tier matches quantity range, returning:', priceTier.price_per_unit_vnd);
        return priceTier.price_per_unit_vnd;
      }
      console.log('Price tier found but quantity range does not match');
      return null; // Không tìm thấy khoảng giá phù hợp
    } else {
      console.warn('Không tìm thấy dữ liệu giá standee mini cho các tiêu chí đã cho.');
      return null;
    }

  } catch (error) {
    console.error('Lỗi không xác định khi lấy giá standee mini:', error.message);
    return null;
  }
}

/**
 * Hàm để lấy giá sản phẩm từ bảng posters_general theo khoảng số lượng.
 * @param {string} sizeCategory - Kích thước poster (e.g., 'A3', 'A4', 'A5').
 * @param {string} paperType - Loại giấy (e.g., 'C260', 'C300').
 * @param {string} laminationType - Loại cán màng (e.g., 'cán mờ', 'cán bóng', 'không cán màng').
 * @param {number} desiredQuantity - Số lượng mà người dùng muốn đặt.
 * @param {number} productId - ID của sản phẩm (optional).
 * @returns {Promise<number | null>} - Giá trên mỗi đơn vị (VND) hoặc null nếu không tìm thấy.
 */
export async function getPosterPrice(sizeCategory, paperType, laminationType, desiredQuantity, productId = null) {
  try {
    let query = supabase
      .from('posters_general')
      .select('price_per_unit_vnd, min_quantity, max_quantity, size_category, paper_type, lamination_type, product_id')
      .eq('size_category', sizeCategory)
      .eq('paper_type', paperType)
      .lte('min_quantity', desiredQuantity)
      .order('min_quantity', { ascending: false });

    if (laminationType) {
      query = query.eq('lamination_type', laminationType);
    }
    if (productId) {
      query = query.eq('product_id', productId);
    }
    query = query.limit(1);

    const { data, error } = await query;
    if (error) {
      console.error('Lỗi khi truy vấn giá poster:', error.message);
      return null;
    }
    if (data && data.length > 0) {
      const priceTier = data[0];
      if (desiredQuantity >= priceTier.min_quantity &&
          (priceTier.max_quantity === null || desiredQuantity <= priceTier.max_quantity)) {
        return priceTier.price_per_unit_vnd;
      }
      return null;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Lỗi không xác định khi lấy giá poster:', error.message);
    return null;
  }
}

export function useProductDetail(productId) {
  const [product, setProduct] = useState(null);
  const [productDetails, setProductDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRangeBasedPricing, setIsRangeBasedPricing] = useState(false);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        
        // First, fetch the main product info
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (productError) throw productError;
        
        if (!productData) {
          setProduct(null);
          setProductDetails([]);
          return;
        }

        setProduct(productData);



        // Determine which detail table to query based on product name
        const detailTableName = PRODUCT_TABLE_MAPPING[productData.product_name];
        
        if (detailTableName) {
          console.log(`Fetching details from table: ${detailTableName} for product: ${productData.product_name}`);
          
          // Check if this is a range-based pricing table
          const isRangeBased = RANGE_BASED_PRICING_TABLES.includes(detailTableName);
          setIsRangeBasedPricing(isRangeBased);
          
          // Fetch the detailed pricing information
          const { data: detailData, error: detailError } = await supabase
            .from(detailTableName)
            .select('*')
            .eq('product_id', productId);

          if (detailError) {
            console.warn(`Error fetching from ${detailTableName}:`, detailError);
            // Don't throw error here, just set empty details
            setProductDetails([]);
          } else {
            console.log(`Found ${detailData?.length || 0} detail records`);
            setProductDetails(detailData || []);
          }
        } else {
          console.warn(`No detail table mapping found for product: ${productData.product_name}`);
          setProductDetails([]);
          setIsRangeBasedPricing(false);
        }

      } catch (err) {
        setError(err.message);
        console.error("Error fetching product detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId]);

  return { 
    product, 
    productDetails, 
    loading, 
    error, 
    isRangeBasedPricing,
    getFormsFramesPrice, // Export the pricing function
    getStrapPrice, // Export the strap pricing function
    getWobblerPrice, // Export the wobbler pricing function
    getFanPrice, // Export the fan pricing function
    getHairClipPrice, // Export the hair clip pricing function
    getPuzzlePrice, // Export the puzzle pricing function
    getStandeeMiniPrice, // Export the standee mini pricing function
    getPosterPrice // Export the poster pricing function
  };
} 