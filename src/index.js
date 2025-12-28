import ui from './ui.html';
import { R2Client } from './r2';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const r2 = new R2Client(env);

    // Serve UI
    if (url.pathname === '/') {
      // Fire-and-forget CORS setup in the background on homepage load
      // This ensures that the bucket is eventually configured without blocking the UI
      ctx.waitUntil(r2.setupCors().catch(console.error));

      // Inject Supabase Config into HTML
      let html = ui;
      html = html.replace('{{SUPABASE_URL}}', env.SUPABASE_URL);
      html = html.replace('{{SUPABASE_ANON_KEY}}', env.SUPABASE_ANON_KEY);

      return new Response(html, {
        headers: {
          'content-type': 'text/html; charset=utf-8',
        },
      });
    }

    // API: Get Upload URL
    if (url.pathname === '/api/upload-url' && request.method === 'POST') {
      try {
        const { filename, fileType } = await request.json();

        // Clean filename and make unique
        const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `${crypto.randomUUID()}-${cleanName}`;

        const uploadUrl = await r2.generateUploadUrl(key, fileType);
        const downloadUrl = await r2.getDownloadUrl(key);

        return Response.json({
          uploadUrl,
          downloadUrl,
          key
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    // API: Setup CORS (Manual helper)
    if (url.pathname === '/api/setup-cors' && request.method === 'POST') {
      try {
        await r2.setupCors();
        return Response.json({ message: 'CORS configured on R2 bucket' });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
