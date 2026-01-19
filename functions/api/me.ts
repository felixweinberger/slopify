function getSessionFromCookie(request: Request): string | null {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;

  const match = cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const userId = getSessionFromCookie(request);
  if (!userId) {
    return Response.json({ user: null });
  }

  const result = await env.DB.prepare(
    'SELECT id, username, avatar_url as avatarUrl FROM users WHERE id = ?'
  ).bind(userId).first();

  return Response.json({ user: result || null });
};
