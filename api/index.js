import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(request, response) {
  // สร้างรหัสเฉพาะตัวสำหรับลิงก์ใหม่
  const uniqueId = Math.random().toString(36).substring(2, 10);

  // คำนวณเวลาหมดอายุ (อีก 2 วันข้างหน้า)
  const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
  const expiresAt = Date.now() + twoDaysInMs;

  // ข้อมูลที่จะบันทึกลง "สมุดจด"
  const linkData = {
    targetUrl: 'https://THEWIZEHOUSE.github.io/TWH.github.io/',
    createdAt: Date.now(),
    expiresAt: expiresAt,
  };

  // บันทึกข้อมูลลงในสมุดจด โดยให้มีอายุ 2 วัน
  await redis.set(`link:${uniqueId}`, JSON.stringify(linkData), {
    ex: 172800, // 172800 วินาที = 2 วัน
  });

  // สร้างลิงก์ที่สมบูรณ์สำหรับให้ผู้ใช้คัดลอก
  const generatedLink = `https://infonight.vercel.app/api/go?id=${uniqueId}`;

  // แสดงผลหน้าเว็บที่มีลิงก์ใหม่ให้ผู้ใช้เห็น
  response.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Link Generated</title>
      <style>
        body { font-family: sans-serif; display: grid; place-content: center; min-height: 100vh; background: #f0f2f5; text-align: center; }
        .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        input { font-size: 1rem; padding: 10px; width: 100%; max-width: 400px; border: 1px solid #ccc; border-radius: 4px; margin-top: 10px; }
      </style>
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
}
