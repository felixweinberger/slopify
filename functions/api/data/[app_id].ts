// GET /api/data/:app_id - Get all data for an app for current user

function getSessionFromCookie(request: Request): string | null {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;
  const match = cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request, params } = context;
  const appId = params.app_id as string;

  const userId = getSessionFromCookie(request);
  if (!userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const results = await env.DB.prepare(
    'SELECT key, value FROM app_data WHERE user_id = ? AND app_id = ?'
  ).bind(userId, appId).all();

  // Convert to key-value object
  const data: Record<string, unknown> = {};
  for (const row of results.results) {
    try {
      data[row.key as string] = JSON.parse(row.value as string);
    } catch {
      data[row.key as string] = row.value;
    }
  }

  return Response.json({ data });
};
