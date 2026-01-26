import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { shippingAddressSchema } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const supabaseAdmin = createAdminClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { shipping_address, cart_items } = body;

    // Validate shipping address
    const validatedAddress = shippingAddressSchema.parse(shipping_address);

    if (!cart_items || cart_items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Get product details from database
    const productIds = cart_items.map((item: any) => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productsError) throw productsError;

    // Create line items for Stripe
    const lineItems = cart_items.map((item: any) => {
      const product = products?.find(p => p.id === item.product_id);
      if (!product) throw new Error(`Product ${item.product_id} not found`);

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
            images: [product.image_url],
          },
          unit_amount: product.price,
        },
        quantity: item.quantity,
      };
    });

    // Calculate total
    const totalAmount = cart_items.reduce((sum: number, item: any) => {
      const product = products?.find(p => p.id === item.product_id);
      return sum + (product!.price * item.quantity);
    }, 0);

    // Create order in database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        email: user.email,
        total_amount: totalAmount,
        status: 'pending',
        shipping_address: validatedAddress,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = cart_items.map((item: any) => {
      const product = products?.find(p => p.id === item.product_id);
      return {
        order_id: order.id,
        product_id: item.product_id,
        product_name: product!.name,
        product_price: product!.price,
        quantity: item.quantity,
      };
    });

    const { error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (orderItemsError) throw orderItemsError;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      customer_email: user.email!,
      metadata: {
        order_id: order.id,
        user_id: user.id,
      },
    });

    // Update order with Stripe session ID
    await supabaseAdmin
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id);

    return NextResponse.json({
      success: true,
      data: {
        session_id: session.id,
        url: session.url,
      },
    });
  } catch (error: any) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
