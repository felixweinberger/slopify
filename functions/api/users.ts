function getSessionFromCookie(request: Request): string | null {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;

  const match = cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  // Check if user is logged in
  const userId = getSessionFromCookie(request);
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify the session user exists
  const sessionUser = await env.DB.prepare(
    'SELECT id FROM users WHERE id = ?'
  ).bind(userId).first();

  if (!sessionUser) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all public users
  const result = await env.DB.prepare(
    'SELECT id, username, avatar_url as avatarUrl, display_name as displayName FROM users WHERE is_public = 1 ORDER BY username ASC'
  ).all();

  return Response.json({ users: result.results || [] });
};
