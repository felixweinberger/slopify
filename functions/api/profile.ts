function getSessionFromCookie(request: Request): string | null {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;
  const match = cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

// GET /api/profile - Get current user's profile
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const userId = getSessionFromCookie(request);
  if (!userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await env.DB.prepare(
    'SELECT id, username, avatar_url, display_name, is_public FROM users WHERE id = ?'
  ).bind(userId).first();

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  return Response.json({
    id: user.id,
    username: user.username,
    avatarUrl: user.avatar_url,
    displayName: user.display_name,
    isPublic: user.is_public === 1,
  });
};

// PUT /api/profile - Update current user's profile
export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const userId = getSessionFromCookie(request);
  if (!userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json() as {
    displayName?: string;
    isPublic?: boolean;
  };

  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (body.displayName !== undefined) {
    updates.push('display_name = ?');
    values.push(body.displayName);
  }

  if (body.isPublic !== undefined) {
    updates.push('is_public = ?');
    values.push(body.isPublic ? 1 : 0);
  }

  if (updates.length === 0) {
    return Response.json({ error: 'No fields to update' }, { status: 400 });
  }

  values.push(userId);

  await env.DB.prepare(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  return Response.json({ success: true });
};
