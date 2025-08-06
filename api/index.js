import { Redis } from '@upstash/redis';

// แก้ไข: ระบุ URL และ Token ของ Database โดยตรงจาก "กุญแจ" ที่เรามี
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(request, response) {
  try {
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
    const expiresAt = Date.now() + twoDaysInMs;

    const linkData = {
      targetUrl: 'https://THEWIZEHOUSE.github.io/TWH.github.io/',
      createdAt: Date.now(),
      expiresAt: expiresAt,
    };

    await redis.set(`link:${uniqueId}`, JSON.stringify(linkData), {
      ex: 172800, // 2 days in seconds
    });

    const generatedLink = `https://infonight.vercel.app/api/go?id=${uniqueId}`;

    response.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Link Generated</title>
        <style>body { font-family: sans-serif; display: grid; place-content: center; min-height: 100vh; background: #f0f2f5; text-align: center; } .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); } input { font-size: 1rem; padding: 10px; width: 100%; max-width: 400px; border: 1px solid #ccc; border-radius: 4px; margin-top: 10px; }</style>
      </head>
      <body>
        <div class="container">
          <h1>Your new link is ready!</h1>
          <p>This link will expire in 2 days.</p>
          <input type="text" value="${generatedLink}" readonly onclick="this.select()">
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    response.status(500).send('An error occurred while generating the link.');
  }
}
