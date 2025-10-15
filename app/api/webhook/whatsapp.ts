import { NextRequest, NextResponse } from 'next/server';

// WhatsApp Cloud API Webhook handler
// Set this endpoint as your webhook URL in the Meta Developer Portal

export async function GET(req: NextRequest) {
  // Verification challenge for webhook setup
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  } else {
    return new Response('Forbidden', { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  // Handle incoming webhook events (messages, status, etc.)
  try {
    const body = await req.json();
    console.log('[WhatsApp Webhook] Event received:', JSON.stringify(body));
    // You can add custom logic here to process messages, delivery status, etc.
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WhatsApp Webhook] Error:', error);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
