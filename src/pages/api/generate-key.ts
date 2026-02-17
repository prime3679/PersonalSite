import type { APIRoute } from 'astro';

function generateApiKey(): string {
  const prefix = 'al_';
  const randomPart = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
  return prefix + randomPart;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({
        error: 'Valid email address is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate API key
    const apiKey = generateApiKey();
    
    // For now, just return the key
    // TODO: Store in database and send via email
    console.log('API key generated:', {
      email,
      apiKey,
      timestamp: new Date().toISOString()
    });

    const response = {
      status: 'success',
      message: 'API key generated successfully',
      apiKey: apiKey, // In production, send via email only
      email,
      endpoint: 'https://api.adrianlumley.co/v1/chat/completions',
      freeLimit: '10,000 requests/month',
      documentation: 'https://adrianlumley.co/services#model-router'
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to generate API key'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};