import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const file = formData.get('usage_file') as File;
    
    if (!email || !file) {
      return new Response(JSON.stringify({
        error: 'Email and usage file are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // For now, just log the request
    // TODO: Implement actual file processing and audit generation
    console.log('Audit request:', {
      email,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    // Mock response
    const auditSummary = {
      status: 'received',
      email,
      fileName: file.name,
      estimatedDelivery: '24 hours',
      message: 'Your usage data has been received. We\'ll analyze your API costs and send a detailed optimization report within 24 hours.'
    };

    return new Response(JSON.stringify(auditSummary), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to process audit request'
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