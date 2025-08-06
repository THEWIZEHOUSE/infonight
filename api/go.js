import { Redis } from '@upstash/redis';

// เชื่อมต่อกับ Database โดยใช้ "กุญแจ" ที่ Vercel จัดการให้
const redis = Redis.fromEnv();

export default async function handler(request, response) {
  // ดึงรหัสลิงก์จาก URL (เช่น .../api/go?id=xyz)
  const { id } = request.query;

  if (!id) {
    return response.status(400).send('Link ID is missing.');
  }

  // ค้นหาข้อมูลของรหัสนี้ใน "สมุดจด"
  const data = await redis.get(`link:${id}`);

  if (!data) {
    return response.status(404).send('This link does not exist or has already been used.');
  }

  const { targetUrl, expiresAt } = data;

  // ตรวจสอบวันหมดอายุ
  if (Date.now() > expiresAt) {
    // ถ้าหมดอายุแล้ว ให้ลบออกจากสมุดจด และแจ้งผู้ใช้
    await redis.del(`link:${id}`);
    return response.status(410).send('This link has expired.');
  }

  // ถ้าทุกอย่างถูกต้อง ให้ส่งต่อไปยังบ้านของเรา
  response.redirect(302, targetUrl);
}
