import { Redis } from '@upstash/redis';

// แก้ไข: ระบุ URL และ Token ของ Database โดยตรงจาก "กุญแจ" ที่เรามี
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(request, response) {
  try {
    const { id } = request.query;

    if (!id) {
      return response.status(400).send('Link ID is missing.');
    }

    const rawData = await redis.get(`link:${id}`);

    if (!rawData) {
      return response.status(404).send('This link does not exist or has already been used.');
    }

    // แก้ไข: แปลงข้อมูลที่อ่านได้จาก string กลับเป็น object ก่อนใช้งาน
    const linkData = JSON.parse(rawData);
    const { targetUrl, expiresAt } = linkData;

    if (Date.now() > expiresAt) {
      await redis.del(`link:${id}`);
      return response.status(410).send('This link has expired.');
    }

    response.redirect(302, targetUrl);
  } catch (error) {
    console.error(error);
    response.status(500).send('An error occurred while processing the link.');
  }
}
