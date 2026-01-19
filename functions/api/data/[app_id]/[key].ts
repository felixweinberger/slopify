// PUT /api/data/:app_id/:key - Save/update a specific key for an app

function getSessionFromCookie(request: Request): string | null {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;
  const match = cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { env, request, params } = context;
  const appId = params.app_id as string;
  const key = params.key as string;

  const userId = getSessionFromCookie(request);
  if (!userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json() as { value: unknown };
  if (body.value === undefined) {
    return Response.json({ error: 'Missing value' }, { status: 400 });
  }

  const valueStr = JSON.stringify(body.value);
  const now = Math.floor(Date.now() / 1000);

  // Upsert the data
  await env.DB.prepare(`
    INSERT INTO app_data (user_id, app_id, key, value, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, app_id, key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at
  `).bind(userId, appId, key, valueStr, now).run();

  return Response.json({ success: true });
};

// Also support GET for single key
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request, params } = context;
  const appId = params.app_id as string;
  const key = params.key as string;

  const userId = getSessionFromCookie(request);
  if (!userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const result = await env.DB.prepare(
    'SELECT value FROM app_data WHERE user_id = ? AND app_id = ? AND key = ?'
  ).bind(userId, appId, key).first();

  if (!result) {
    return Response.json({ value: null });
  }

  try {
    return Response.json({ value: JSON.parse(result.value as string) });
  } catch {
    return Response.json({ value: result.value });
  }
};
