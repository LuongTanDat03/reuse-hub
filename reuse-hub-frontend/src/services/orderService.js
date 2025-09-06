import { supabase } from '../supabaseClient';

/**
 * Order Service - Handles creating orders, users, and addresses
 */

/**
 * Create or get existing user by phone number
 */
export async function createOrGetUser(customerInfo) {
  try {
    const { full_name, phone_number, email } = customerInfo;
    
    // First, try to find existing user by phone number
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phone_number)
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw findError;
    }

    if (existingUser) {
      // Update existing user if email is different or empty
      if (email && (!existingUser.email || existingUser.email !== email)) {
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ 
            email,
            full_name, // Also update name in case it changed
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return updatedUser;
      }
      return existingUser;
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        full_name,
        phone_number,
        email: email || null
      })
      .select()
      .single();

    if (createError) throw createError;
    return newUser;

  } catch (error) {
    console.error('Error creating/getting user:', error);
    throw new Error(`Lỗi xử lý thông tin khách hàng: ${error.message}`);
  }
}

/**
 * Create address for user
 */
export async function createAddress(userId, addressData, addressType = 'shipping') {
  try {
    const { data: address, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        address_line1: addressData.address_line1,
        address_line2: addressData.address_line2 || null,
        city: addressData.city,
        state: addressData.state || null,
        zip_code: addressData.zip_code || null,
        country: addressData.country || 'Vietnam',
        address_type: addressType,
        is_default: true // Set as default for now
      })
      .select()
      .single();

    if (error) throw error;
    return address;

  } catch (error) {
    console.error('Error creating address:', error);
    throw new Error(`Lỗi tạo địa chỉ: ${error.message}`);
  }
}

/**
 * Create order with items
 */
export async function createOrder(orderData) {
  try {
    const {
      customerInfo,
      shippingAddress,
      billingAddress,
      paymentMethod,
      orderNotes,
      items,
      subtotal
    } = orderData;

    // Step 1: Create or get user
    console.log('Creating/getting user...');
    const user = await createOrGetUser(customerInfo);

    // Step 2: Create addresses (optional - we store address directly in order)
    // This is for user's address book for future orders
    try {
      await createAddress(user.id, shippingAddress, 'shipping');
      if (billingAddress && JSON.stringify(billingAddress) !== JSON.stringify(shippingAddress)) {
        await createAddress(user.id, billingAddress, 'billing');
      }
    } catch (addressError) {
      // Don't fail the order if address creation fails
      console.warn('Address creation failed:', addressError);
    }

    // Step 3: Create order
    console.log('Creating order...');
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        total_amount_vnd: subtotal,
        status: 'pending',
        rush_fee_applied: false,
        rush_fee_amount_vnd: 0,
        notes: orderNotes || null,
        
        // Shipping address snapshot
        shipping_address_line1: shippingAddress.address_line1,
        shipping_address_line2: shippingAddress.address_line2 || null,
        shipping_city: shippingAddress.city,
        shipping_state: shippingAddress.state || null,
        shipping_zip_code: shippingAddress.zip_code || null,
        shipping_country: shippingAddress.country || 'Vietnam',
        
        // Billing address snapshot
        billing_address_line1: billingAddress.address_line1,
        billing_address_line2: billingAddress.address_line2 || null,
        billing_city: billingAddress.city,
        billing_state: billingAddress.state || null,
        billing_zip_code: billingAddress.zip_code || null,
        billing_country: billingAddress.country || 'Vietnam'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Step 4: Create order items
    console.log('Creating order items...');
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price_at_order_vnd: item.unitPrice,
      total_item_price_vnd: item.totalPrice,
      product_details_json: {
        product_name: item.product.product_name,
        product_category: item.product.product_category,
        specifications: item.specifications,
        product_description: item.product.description
      }
    }));

    const { data: createdItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) throw itemsError;

    // Return complete order data
    return {
      order: {
        ...order,
        customer: user,
        items: createdItems
      },
      user,
      items: createdItems
    };

  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error(`Lỗi tạo đơn hàng: ${error.message}`);
  }
}

/**
 * Get order by ID with all related data
 */
export async function getOrderById(orderId) {
  try {
    // Get order with customer info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        customer:users(*)
      `)
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    return {
      ...order,
      items
    };

  } catch (error) {
    console.error('Error getting order:', error);
    throw new Error(`Lỗi lấy thông tin đơn hàng: ${error.message}`);
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, status) {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return order;

  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error(`Lỗi cập nhật trạng thái đơn hàng: ${error.message}`);
  }
}

/**
 * Get orders by customer phone number
 */
export async function getOrdersByPhone(phoneNumber) {
  try {
    // First get user by phone
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('phone_number', phoneNumber)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        return []; // No user found, return empty array
      }
      throw userError;
    }

    // Get orders for this user
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          product:products(*)
        )
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;
    return orders;

  } catch (error) {
    console.error('Error getting orders by phone:', error);
    throw new Error(`Lỗi tra cứu đơn hàng: ${error.message}`);
  }
}

/**
 * Generate order tracking code
 */
export function generateOrderCode(orderId) {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const orderIdPadded = orderId.toString().padStart(4, '0');
  
  return `DH${year}${month}${day}${orderIdPadded}`;
}

/**
 * Format address for display
 */
export function formatAddress(order, type = 'shipping') {
  const prefix = type === 'shipping' ? 'shipping_' : 'billing_';
  
  const addressParts = [
    order[`${prefix}address_line1`],
    order[`${prefix}address_line2`],
    order[`${prefix}city`],
    order[`${prefix}state`],
    order[`${prefix}country`]
  ].filter(Boolean);
  
  return addressParts.join(', ');
} 