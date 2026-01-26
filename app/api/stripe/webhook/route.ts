import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  const supabaseAdmin = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;
        const userId = session.metadata?.user_id;

        if (!orderId) {
          console.error('No order ID in session metadata');
          break;
        }

        // Update order status
        await supabaseAdmin
          .from('orders')
          .update({
            status: 'completed',
            stripe_payment_intent: session.payment_intent as string,
          })
          .eq('id', orderId);

        // Clear user's cart
        if (userId) {
          await supabaseAdmin
            .from('cart_items')
            .delete()
            .eq('user_id', userId);
        }

        console.log(`Order ${orderId} marked as completed`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.error('Payment failed:', paymentIntent.id);
        
        const { data: orders } = await supabaseAdmin
          .from('orders')
          .select('id')
          .eq('stripe_payment_intent', paymentIntent.id);

        if (orders && orders.length > 0) {
          await supabaseAdmin
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', orders[0].id);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
