/**
 * Cloudflare Worker for Contact Form Submissions
 *
 * Serverless function that handles form submissions without a backend server.
 * Features: Rate limiting, validation, SendGrid email integration, CORS support.
 *
 * Deploy: wrangler deploy
 * Test: wrangler dev
 */

interface ContactSubmission {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

interface Env {
  SENDGRID_API_KEY: string;
  CONTACT_EMAIL: string;
  RATE_LIMIT_KV: KVNamespace;
}

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 3,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

/**
 * Main handler
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    // Only accept POST
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    try {
      // Get client IP for rate limiting
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

      // Check rate limit
      const isRateLimited = await checkRateLimit(ip, env);
      if (isRateLimited) {
        return jsonResponse(
          { error: 'Too many requests. Please try again later.' },
          429,
          { 'Retry-After': '900' } // 15 minutes
        );
      }

      // Parse and validate submission
      const submission = await request.json() as ContactSubmission;
      const validation = validateSubmission(submission);

      if (!validation.valid) {
        return jsonResponse({ error: validation.error }, 400);
      }

      // Send email via SendGrid
      const emailSent = await sendEmail(submission, env);

      if (!emailSent) {
        return jsonResponse(
          { error: 'Failed to send message. Please try again or email directly.' },
          500
        );
      }

      // Increment rate limit counter
      await incrementRateLimit(ip, env);

      // Success response
      return jsonResponse({
        success: true,
        message: 'Message sent successfully! I\'ll get back to you soon.',
      });

    } catch (error) {
      console.error('Error processing contact form:', error);
      return jsonResponse(
        { error: 'An error occurred. Please try again later.' },
        500
      );
    }
  },
};

/**
 * Validate contact form submission
 */
function validateSubmission(submission: ContactSubmission): { valid: boolean; error?: string } {
  if (!submission.name || submission.name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }

  if (submission.name.length > 100) {
    return { valid: false, error: 'Name must be less than 100 characters' };
  }

  if (!submission.email || submission.email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(submission.email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  if (submission.email.length > 255) {
    return { valid: false, error: 'Email must be less than 255 characters' };
  }

  if (submission.subject && submission.subject.length > 200) {
    return { valid: false, error: 'Subject must be less than 200 characters' };
  }

  if (!submission.message || submission.message.trim().length === 0) {
    return { valid: false, error: 'Message is required' };
  }

  if (submission.message.length > 5000) {
    return { valid: false, error: 'Message must be less than 5000 characters' };
  }

  return { valid: true };
}

/**
 * Send email via SendGrid
 */
async function sendEmail(submission: ContactSubmission, env: Env): Promise<boolean> {
  if (!env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY not configured');
    return false;
  }

  const toEmail = env.CONTACT_EMAIL || 'adrian@adrianlumley.com';
  const fromEmail = 'noreply@adrianlumley.com';

  const emailData = {
    personalizations: [
      {
        to: [{ email: toEmail }],
        subject: submission.subject || 'New Contact Form Submission',
      },
    ],
    from: { email: fromEmail, name: 'Adrian Lumley Contact Form' },
    reply_to: { email: submission.email, name: submission.name },
    content: [
      {
        type: 'text/html',
        value: generateEmailHTML(submission),
      },
    ],
  };

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid error:', response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Generate HTML email content
 */
function generateEmailHTML(submission: ContactSubmission): string {
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: 600; color: #495057; margin-bottom: 5px; }
    .value { color: #212529; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0; color: #212529;">New Contact Form Submission</h2>
    </div>

    <div class="content">
      <div class="field">
        <div class="label">From:</div>
        <div class="value">${escapeHtml(submission.name)} &lt;${escapeHtml(submission.email)}&gt;</div>
      </div>

      ${submission.subject ? `
      <div class="field">
        <div class="label">Subject:</div>
        <div class="value">${escapeHtml(submission.subject)}</div>
      </div>
      ` : ''}

      <div class="field">
        <div class="label">Message:</div>
        <div class="value" style="white-space: pre-wrap;">${escapeHtml(submission.message)}</div>
      </div>
    </div>

    <div class="footer">
      <p>This message was sent via your contact form at adrianlumley.com</p>
      <p><small>Submitted at ${new Date().toISOString()}</small></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Check if IP is rate limited
 */
async function checkRateLimit(ip: string, env: Env): Promise<boolean> {
  if (!env.RATE_LIMIT_KV) {
    console.warn('RATE_LIMIT_KV not configured, rate limiting disabled');
    return false;
  }

  const key = `ratelimit:${ip}`;
  const data = await env.RATE_LIMIT_KV.get(key);

  if (!data) {
    return false;
  }

  const { count, timestamp } = JSON.parse(data);
  const now = Date.now();

  // Check if window has expired
  if (now - timestamp > RATE_LIMIT.windowMs) {
    return false;
  }

  // Check if exceeded limit
  return count >= RATE_LIMIT.maxRequests;
}

/**
 * Increment rate limit counter
 */
async function incrementRateLimit(ip: string, env: Env): Promise<void> {
  if (!env.RATE_LIMIT_KV) {
    return;
  }

  const key = `ratelimit:${ip}`;
  const data = await env.RATE_LIMIT_KV.get(key);
  const now = Date.now();

  let count = 1;
  let timestamp = now;

  if (data) {
    const existing = JSON.parse(data);
    // If within window, increment count
    if (now - existing.timestamp <= RATE_LIMIT.windowMs) {
      count = existing.count + 1;
      timestamp = existing.timestamp;
    }
  }

  // Store with TTL of 15 minutes
  await env.RATE_LIMIT_KV.put(
    key,
    JSON.stringify({ count, timestamp }),
    { expirationTtl: Math.ceil(RATE_LIMIT.windowMs / 1000) }
  );
}

/**
 * Handle CORS preflight
 */
function handleCORS(): Response {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Create JSON response with CORS headers
 */
function jsonResponse(
  data: any,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...additionalHeaders,
    },
  });
}
