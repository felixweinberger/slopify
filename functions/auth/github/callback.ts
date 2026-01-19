interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Missing code parameter', { status: 400 });
  }

  // Exchange code for access token
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenResponse.json() as GitHubTokenResponse;

  if (!tokenData.access_token) {
    return new Response('Failed to get access token', { status: 400 });
  }

  // Fetch user info from GitHub
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'User-Agent': 'Slopify',
    },
  });

  const userData = await userResponse.json() as GitHubUser;

  // Upsert user in D1
  await env.DB.prepare(`
    INSERT INTO users (id, username, avatar_url, access_token, created_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      username = excluded.username,
      avatar_url = excluded.avatar_url,
      access_token = excluded.access_token
  `).bind(
    String(userData.id),
    userData.login,
    userData.avatar_url,
    tokenData.access_token,
    Math.floor(Date.now() / 1000)
  ).run();

  // Set session cookie and redirect to home
  const headers = new Headers();
  headers.set('Location', '/');
  headers.set('Set-Cookie', `session=${userData.id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`);

  return new Response(null, { status: 302, headers });
};
