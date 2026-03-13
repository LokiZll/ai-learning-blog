import type { APIRoute } from 'astro';
import { initDB, saveDB } from '../../../lib/db';

// 获取文章点赞数
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');

  if (!slug) {
    return new Response(JSON.stringify({ error: '缺少文章 slug' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = await initDB();
  const result = db.exec(`SELECT COUNT(*) as count FROM likes WHERE article_slug = ?`, [slug]);
  const count = result.length > 0 ? result[0].values[0][0] : 0;

  return new Response(JSON.stringify({ count }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

// 点赞/取消点赞
export const POST: APIRoute = async ({ request, cookies }) => {
  const session = cookies.get('session');
  if (!session) {
    return new Response(JSON.stringify({ error: '请先登录' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let user;
  try {
    user = JSON.parse(session.value);
  } catch {
    return new Response(JSON.stringify({ error: '无效的 session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const body = await request.json();
  const { slug, action } = body; // action: 'like' or 'unlike'

  if (!slug) {
    return new Response(JSON.stringify({ error: '缺少文章 slug' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = await initDB();

  if (action === 'unlike') {
    db.run(`DELETE FROM likes WHERE user_id = ? AND article_slug = ?`, [user.userId, slug]);
  } else {
    db.run(`INSERT OR IGNORE INTO likes (user_id, article_slug) VALUES (?, ?)`, [user.userId, slug]);
  }

  saveDB();

  // 获取点赞数
  const result = db.exec(`SELECT COUNT(*) as count FROM likes WHERE article_slug = ?`, [slug]);
  const count = result.length > 0 ? result[0].values[0][0] : 0;

  // 获取当前用户是否点赞
  const userLike = db.exec(`SELECT id FROM likes WHERE user_id = ? AND article_slug = ?`, [user.userId, slug]);
  const isLiked = userLike.length > 0 && userLike[0].values.length > 0;

  return new Response(JSON.stringify({ success: true, count, isLiked }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
