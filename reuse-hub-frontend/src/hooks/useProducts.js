import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch all products from public.products table including img_url
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, product_name, product_category, description, img_url')
          .order('product_category', { ascending: true })
          .order('product_name', { ascending: true });

        if (productsError) throw productsError;

        setProducts(productsData || []);

        // Extract unique categories
        const uniqueCategories = [...new Set(productsData?.map(product => product.product_category) || [])];
        setCategories(uniqueCategories.sort());

      } catch (err) {
        setError(err.message);
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, categories, loading, error };
} 