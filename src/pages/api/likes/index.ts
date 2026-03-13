import type { APIRoute } from 'astro';
import { initDB } from '../../../lib/db';

// 获取当前用户的所有点赞
export const GET: APIRoute = async ({ cookies }) => {
  const session = cookies.get('session');
  if (!session) {
    return new Response(JSON.stringify({ likes: [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let user;
  try {
    user = JSON.parse(session.value);
  } catch {
    return new Response(JSON.stringify({ likes: [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = await initDB();
  const result = db.exec(`
    SELECT article_slug FROM likes WHERE user_id = ?
  `, [user.userId]);

  const likes = result.length > 0 ? result[0].values.map(row => row[0] as string) : [];

  return new Response(JSON.stringify({ likes }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
