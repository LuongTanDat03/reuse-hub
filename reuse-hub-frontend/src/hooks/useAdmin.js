import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useAdmin() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, productsRes] = await Promise.all([
        supabase.from('categories').select('id, name'),
        supabase.from('product_types').select('id, name, category_id')
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (productsRes.error) throw productsRes.error;

      setCategories(categoriesRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Category CRUD operations
  const addCategory = async (name) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name }])
        .select();
      
      if (error) throw error;
      
      setCategories(prev => [...prev, ...data]);
      return { success: true, data };
    } catch (err) {
      console.error('Error adding category:', err);
      return { success: false, error: err.message };
    }
  };

  const updateCategory = async (id, name) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      setCategories(prev => prev.map(cat => 
        cat.id === id ? { ...cat, name } : cat
      ));
      return { success: true, data };
    } catch (err) {
      console.error('Error updating category:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteCategory = async (id) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCategories(prev => prev.filter(cat => cat.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting category:', err);
      return { success: false, error: err.message };
    }
  };

  // Product CRUD operations
  const addProduct = async (name, categoryId) => {
    try {
      const { data, error } = await supabase
        .from('product_types')
        .insert([{ name, category_id: categoryId }])
        .select();
      
      if (error) throw error;
      
      setProducts(prev => [...prev, ...data]);
      return { success: true, data };
    } catch (err) {
      console.error('Error adding product:', err);
      return { success: false, error: err.message };
    }
  };

  const updateProduct = async (id, name, categoryId) => {
    try {
      const { data, error } = await supabase
        .from('product_types')
        .update({ name, category_id: categoryId })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      setProducts(prev => prev.map(product => 
        product.id === id ? { ...product, name, category_id: categoryId } : product
      ));
      return { success: true, data };
    } catch (err) {
      console.error('Error updating product:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteProduct = async (id) => {
    try {
      const { error } = await supabase
        .from('product_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProducts(prev => prev.filter(product => product.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting product:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    categories,
    products,
    loading,
    error,
    fetchData,
    // Category operations
    addCategory,
    updateCategory,
    deleteCategory,
    // Product operations
    addProduct,
    updateProduct,
    deleteProduct,
  };
} 