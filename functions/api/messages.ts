function getSessionFromCookie(request: Request): string | null {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;
  const match = cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

interface Message {
  id: number;
  fromUserId: string;
  fromUsername: string;
  fromAvatarUrl: string;
  toUserId: string;
  toUsername: string;
  content: string;
  createdAt: number;
}

// GET /api/messages?with=username - Get conversation with a user
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const userId = getSessionFromCookie(request);
  if (!userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const url = new URL(request.url);
  const withUsername = url.searchParams.get('with');
  const since = url.searchParams.get('since'); // timestamp for polling

  if (!withUsername) {
    return Response.json({ error: 'Missing "with" parameter' }, { status: 400 });
  }

  // Get the other user's ID
  const otherUser = await env.DB.prepare(
    'SELECT id FROM users WHERE username = ?'
  ).bind(withUsername).first<{ id: string }>();

  if (!otherUser) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  // Get messages between these two users
  let query = `
    SELECT
      m.id, m.from_user_id, m.to_user_id, m.content, m.created_at,
      uf.username as from_username, uf.avatar_url as from_avatar_url,
      ut.username as to_username
    FROM messages m
    JOIN users uf ON m.from_user_id = uf.id
    JOIN users ut ON m.to_user_id = ut.id
    WHERE (m.from_user_id = ? AND m.to_user_id = ?)
       OR (m.from_user_id = ? AND m.to_user_id = ?)
  `;

  const params: (string | number)[] = [userId, otherUser.id, otherUser.id, userId];

  if (since) {
    query += ' AND m.created_at > ?';
    params.push(parseInt(since, 10));
  }

  query += ' ORDER BY m.created_at ASC LIMIT 200';

  const result = await env.DB.prepare(query).bind(...params).all();

  const messages: Message[] = (result.results || []).map((row: any) => ({
    id: row.id,
    fromUserId: row.from_user_id,
    fromUsername: row.from_username,
    fromAvatarUrl: row.from_avatar_url,
    toUserId: row.to_user_id,
    toUsername: row.to_username,
    content: row.content,
    createdAt: row.created_at,
  }));

  return Response.json({ messages });
};

// POST /api/messages - Send a message
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const userId = getSessionFromCookie(request);
  if (!userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json() as { to: string; content: string };

  if (!body.to || !body.content) {
    return Response.json({ error: 'Missing "to" or "content"' }, { status: 400 });
  }

  const content = body.content.trim();
  if (!content || content.length > 2000) {
    return Response.json({ error: 'Invalid message content' }, { status: 400 });
  }

  // Get the recipient's ID
  const recipient = await env.DB.prepare(
    'SELECT id FROM users WHERE username = ?'
  ).bind(body.to).first<{ id: string }>();

  if (!recipient) {
    return Response.json({ error: 'Recipient not found' }, { status: 404 });
  }

  if (recipient.id === userId) {
    return Response.json({ error: 'Cannot message yourself' }, { status: 400 });
  }

  const now = Date.now();

  await env.DB.prepare(
    'INSERT INTO messages (from_user_id, to_user_id, content, created_at) VALUES (?, ?, ?, ?)'
  ).bind(userId, recipient.id, content, now).run();

  return Response.json({ success: true, timestamp: now });
};
