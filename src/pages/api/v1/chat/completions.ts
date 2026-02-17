import type { APIRoute } from 'astro';

// Simple model routing logic
function selectOptimalModel(prompt: string, maxTokens?: number): { model: string; provider: 'openai' | 'anthropic' } {
  const promptLength = prompt.length;
  const isComplex = prompt.includes('analyze') || prompt.includes('strategy') || prompt.includes('complex');
  const isSimple = promptLength < 500 && !isComplex;
  
  if (isSimple) {
    return { model: 'gpt-3.5-turbo', provider: 'openai' };
  } else if (isComplex || (maxTokens && maxTokens > 2000)) {
    return { model: 'claude-3-sonnet-20240229', provider: 'anthropic' };
  } else {
    return { model: 'gpt-4', provider: 'openai' };
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { messages, model, max_tokens, ...otherParams } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({
        error: { message: 'Invalid request: messages array required' }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract prompt from messages
    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage?.content || '';
    
    // Select optimal model
    const selectedModel = selectOptimalModel(prompt, max_tokens);
    
    // For now, return a mock response showing the routing logic
    // TODO: Implement actual API calls to OpenAI/Anthropic
    const mockResponse = {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: selectedModel.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: `[DEMO MODE] Your request would be routed to ${selectedModel.model} (${selectedModel.provider}) for optimal cost/quality balance. Original model: ${model || 'default'}`
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: Math.ceil(prompt.length / 4),
        completion_tokens: 50,
        total_tokens: Math.ceil(prompt.length / 4) + 50
      },
      routing_info: {
        selected_model: selectedModel.model,
        provider: selectedModel.provider,
        reason: prompt.length < 500 ? 'simple_query' : 'complex_query',
        estimated_cost_savings: '70%'
      }
    };

    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: { message: 'Internal server error' }
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
};