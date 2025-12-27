export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 简单的路由示例
    if (url.pathname === '/') {
      return new Response('Hello from Cloudflare Worker! 🚀', {
        headers: {
          'content-type': 'text/plain; charset=utf-8',
        },
      });
    }
    
    if (url.pathname === '/api/hello') {
      return Response.json({
        message: 'Hello from API!',
        timestamp: new Date().toISOString(),
      });
    }
    
    return new Response('Not Found', { status: 404 });
  },
};