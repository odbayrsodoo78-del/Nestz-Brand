export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { provider, action, orderID, amount = '10.00' } = JSON.parse(event.body || '{}');

    // QPay Invoice Creation Placeholder (Connect QPAY_USERNAME / QPAY_PASSWORD in Netlify Env)
    if (provider === 'qpay') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: 'QPAY-' + Date.now(),
          amount_usd: amount,
          status: 'CREATED'
        })
      };
    }

    // PayPal REST API Order Creation & Capture
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const base = 'https://api-m.sandbox.paypal.com'; // Switch to https://api-m.paypal.com for Live

    if (!clientId || !clientSecret) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'MOCK-ORDER-' + Date.now(), status: 'COMPLETED' })
      };
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    const { access_token } = await tokenRes.json();

    if (action === 'capture' && orderID) {
      const captureRes = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });
      const captureData = await captureRes.json();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(captureData)
      };
    }

    const orderRes = await fetch(`${base}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            description: 'NestZ Brand Signature Drop',
            amount: { currency_code: 'USD', value: amount }
          }
        ]
      })
    });
    const orderData = await orderRes.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Төлбөрийн сервер дээр алдаа гарлаа.' })
    };
  }
}
