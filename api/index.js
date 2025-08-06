import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(request, response) {
  // --- ส่วนตรวจสอบ "กุญแจพิเศษ" ---
  // 1. ดึง "กุญแจ" ที่ผู้ใช้อาจจะส่งมาทาง URL (เช่น ...?secret=xxxx)
  const { secret } = request.query;

  // 2. เปรียบเทียบกับ "กุญแจพิเศษ" ของจริงที่เราเก็บไว้ใน Vercel
  if (secret !== process.env.GENERATION_SECRET) {
    // 3. ถ้ากุญแจไม่ถูกต้องหรือไม่ถูกส่งมา ให้ปฏิเสธการเข้าถึง!
    return response.status(403).send('Forbidden: You do not have permission to generate a new link.');
  }

  // --- ถ้ากุญแจถูกต้อง ให้ทำงานสร้างลิงก์ตามปกติ ---
  try {
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
    const expiresAt = Date.now() + twoDaysInMs;

    const linkData = {
      targetUrl: 'https://THEWIZEHOUSE.github.io/TWH.github.io/';
      createdAt: Date.now(),
      expiresAt: expiresAt,
    };

    await redis.set('link:' + uniqueId, JSON.stringify(linkData), {
      ex: 172800,
    });

    const generatedLink = 'https://infonight.vercel.app/api/go?id=' + uniqueId;

    response.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Infonight Link is ready!</title>
          <style>body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: grid; place-content: center; min-height: 100vh; background: #f0f2f5; text-align: center; margin: 20px;} .container { background: white; padding: 30px 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); } .input-group { display: flex; align-items: center; margin-top: 20px; } input { font-size: 1rem; padding: 10px; width: 100%; max-width: 350px; border: 1px solid #ccc; border-radius: 4px; border-top-right-radius: 0; border-bottom-right-radius: 0;} button { font-size: 1rem; padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; border-top-left-radius: 0; border-bottom-left-radius: 0; cursor: pointer; white-space: nowrap; } button:hover { background-color: #0056b3; }</style>
        </head>
        <body>
          <div class="container">
            <h1>Infonight link is ready!</h1>
            <p>This link will expire in 2 days.</p>
            <div class="input-group">
              <input type="text" value="${generatedLink}" id="linkInput" readonly>
              <button onclick="copyLink()" id="copyButton">COPY</button>
            </div>
          </div>
          <script>function copyLink() { const linkInput = document.getElementById("linkInput"); linkInput.select(); linkInput.setSelectionRange(0, 99999); navigator.clipboard.writeText(linkInput.value); const copyButton = document.getElementById("copyButton"); copyButton.textContent = 'COPIED!'; setTimeout(() => { copyButton.textContent = 'COPY'; }, 2000); }</script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    response.status(500).send('An error occurred while generating the link.');
  }
}
