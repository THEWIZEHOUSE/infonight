// api/redirect.js

// ฟังก์ชันหลักที่จะทำงานเมื่อมีคนเรียกใช้ URL นี้
export default function handler(request, response) {

  // ▼▼▼ สำคัญมาก! แก้ไข URL นี้ให้เป็นที่อยู่ของเว็บวิดีโอของคุณบน GitHub Pages ▼▼▼
  // ตัวอย่าง: https://THEWIZEHOUSE.github.io/video-page/ (ถ้า repo วิดีโอชื่อ video-page)
  const targetUrl = 'https://THEWIZEHOUSE.github.io/your-video-repo/';

  // สร้างรหัสเฉพาะตัวแบบสุ่มขึ้นมาใหม่
  const uniqueId = Math.random().toString(36).substring(2, 15);

  // ประกอบร่าง URL ปลายทางใหม่ให้มีรหัสเฉพาะตัวต่อท้าย
  const destinationUrl = `${targetUrl}#${uniqueId}`;

  // สั่งให้เบราว์เซอร์ของผู้ใช้ "ย้ายที่" (Redirect) ไปยัง URL ใหม่ทันที
  response.redirect(302, destinationUrl);
}
