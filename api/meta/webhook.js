import crypto from 'node:crypto';

/**
 * Meta / Instagram webhook for FENIX SOCIAL PUBLISHER.
 *
 * Required Vercel environment variables:
 * META_WEBHOOK_VERIFY_TOKEN - random secret shared only with Meta webhook setup
 * META_APP_SECRET           - Instagram/Meta app secret (used to validate POST signatures)
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const mode = req.query?.['hub.mode'];
    const token = req.query?.['hub.verify_token'];
    const challenge = req.query?.['hub.challenge'];
    const expected = process.env.META_WEBHOOK_VERIFY_TOKEN;

    if (!expected) {
      console.error('META_WEBHOOK_VERIFY_TOKEN is not configured');
      return res.status(503).json({ ok: false, error: 'Webhook not configured' });
    }

    if (mode === 'subscribe' && token === expected && challenge) {
      return res.status(200).send(String(challenge));
    }

    return res.status(403).json({ ok: false, error: 'Webhook verification failed' });
  }

  if (req.method === 'POST') {
    const appSecret = process.env.META_APP_SECRET;
    const signature = req.headers['x-hub-signature-256'];

    if (!appSecret) {
      console.error('META_APP_SECRET is not configured');
      return res.status(503).json({ ok: false, error: 'Webhook signature validation not configured' });
    }

    // Vercel parses JSON bodies. Re-serialize consistently for validation where possible.
    // Meta signs the raw body, so prefer req.rawBody if the runtime provides it.
    const raw = req.rawBody
      ? Buffer.from(req.rawBody)
      : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {}));
    const expectedSignature = `sha256=${crypto.createHmac('sha256', appSecret).update(raw).digest('hex')}`;

    const valid = typeof signature === 'string' &&
      signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

    if (!valid) {
      console.warn('Rejected Meta webhook with invalid signature');
      return res.status(401).json({ ok: false, error: 'Invalid signature' });
    }

    // Acknowledge immediately. Event persistence/dispatch can be added here after
    // the webhook subscription is live and real payload shapes are confirmed.
    console.log('Meta webhook event received', {
      object: req.body?.object,
      entries: Array.isArray(req.body?.entry) ? req.body.entry.length : 0,
    });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
