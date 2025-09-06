import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Cart action types
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, specifications, quantity, unitPrice } = action.payload;
      
      // Create a unique key for this item based on product and specifications
      const itemKey = `${product.id}_${JSON.stringify(specifications)}`;
      
      // Check if item with same specifications already exists
      const existingItemIndex = state.items.findIndex(item => item.key === itemKey);
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          totalPrice: (updatedItems[existingItemIndex].quantity + quantity) * unitPrice
        };
        
        return {
          ...state,
          items: updatedItems
        };
      } else {
        // Add new item
        const newItem = {
          key: itemKey,
          id: Date.now(), // Temporary ID for UI purposes
          product,
          specifications,
          quantity,
          unitPrice,
          totalPrice: quantity * unitPrice,
          addedAt: new Date().toISOString()
        };
        
        return {
          ...state,
          items: [...state.items, newItem]
        };
      }
    }
    
    case CART_ACTIONS.REMOVE_ITEM: {
      return {
        ...state,
        items: state.items.filter(item => item.key !== action.payload.itemKey)
      };
    }
    
    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { itemKey, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return {
          ...state,
          items: state.items.filter(item => item.key !== itemKey)
        };
      }
      
      const updatedItems = state.items.map(item => {
        if (item.key === itemKey) {
          return {
            ...item,
            quantity,
            totalPrice: quantity * item.unitPrice
          };
        }
        return item;
      });
      
      return {
        ...state,
        items: updatedItems
      };
    }
    
    case CART_ACTIONS.CLEAR_CART: {
      return {
        ...state,
        items: []
      };
    }
    
    case CART_ACTIONS.LOAD_CART: {
      return {
        ...state,
        items: action.payload.items || []
      };
    }
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: []
};

// Create context
const CartContext = createContext();

// Cart provider component
export const CartProvider = ({ children }) => {
  const [cartState, dispatch] = useReducer(cartReducer, initialState);
  
  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('inxin_cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: { items: parsedCart.items }
        });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);
  
  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem('inxin_cart', JSON.stringify(cartState));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartState]);
  
  // Helper function to format price in Vietnamese currency
  const formatPrice = (price) => {
    if (!price || price === 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  // Cart actions
  const addToCart = (product, specifications, quantity, unitPrice) => {
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product, specifications, quantity, unitPrice }
    });
  };
  
  const removeFromCart = (itemKey) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { itemKey }
    });
  };
  
  const updateQuantity = (itemKey, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { itemKey, quantity }
    });
  };
  
  const clearCart = () => {
    dispatch({
      type: CART_ACTIONS.CLEAR_CART
    });
  };
  
  // Calculate totals
  const cartTotals = {
    itemCount: cartState.items.reduce((total, item) => total + item.quantity, 0),
    subtotal: cartState.items.reduce((total, item) => total + item.totalPrice, 0),
    get formattedSubtotal() {
      return formatPrice(this.subtotal);
    }
  };
  
  // Check if item is in cart
  const isInCart = (productId, specifications) => {
    const itemKey = `${productId}_${JSON.stringify(specifications)}`;
    return cartState.items.some(item => item.key === itemKey);
  };
  
  // Get item quantity in cart
  const getItemQuantity = (productId, specifications) => {
    const itemKey = `${productId}_${JSON.stringify(specifications)}`;
    const item = cartState.items.find(item => item.key === itemKey);
    return item ? item.quantity : 0;
  };
  
  const value = {
    // State
    items: cartState.items,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Calculations
    ...cartTotals,
    
    // Utilities
    formatPrice,
    isInCart,
    getItemQuantity
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext; 