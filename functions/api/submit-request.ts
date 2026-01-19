interface SubmitRequestBody {
  title: string;
  description: string;
  type: 'app' | 'feature' | 'bug';
  appName?: string;
}

interface GitHubIssueResponse {
  html_url: string;
  number: number;
}

function getSessionFromCookie(request: Request): string | null {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;

  const match = cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const userId = getSessionFromCookie(request);
  if (!userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Get username from DB for attribution
  const user = await env.DB.prepare(
    'SELECT username FROM users WHERE id = ?'
  ).bind(userId).first<{ username: string }>();

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 401 });
  }

  const body = await request.json() as SubmitRequestBody;

  if (!body.title || !body.description || !body.type) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Format issue based on type (include submitter attribution)
  let issueTitle: string;
  let issueBody: string;
  const attribution = `\n\n---\n*Submitted by [@${user.username}](https://github.com/${user.username}) via Slopify*`;

  switch (body.type) {
    case 'app':
      issueTitle = `[New App] ${body.title}`;
      issueBody = `## Description\n${body.description}${attribution}`;
      break;
    case 'feature':
      issueTitle = `[Feature] ${body.title}`;
      issueBody = `## App\n${body.appName || 'Not specified'}\n\n## Description\n${body.description}${attribution}`;
      break;
    case 'bug':
      issueTitle = `[Bug] ${body.title}`;
      issueBody = `## App\n${body.appName || 'Not specified'}\n\n## Description\n${body.description}${attribution}`;
      break;
    default:
      return Response.json({ error: 'Invalid type' }, { status: 400 });
  }

  // Create GitHub issue using bot token (scoped to this repo only)
  const issueResponse = await fetch('https://api.github.com/repos/felixweinberger/slopify/issues', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.GITHUB_BOT_TOKEN}`,
      'User-Agent': 'Slopify',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: issueTitle,
      body: issueBody,
    }),
  });

  if (!issueResponse.ok) {
    const error = await issueResponse.text();
    return Response.json({ error: `Failed to create issue: ${error}` }, { status: 500 });
  }

  const issueData = await issueResponse.json() as GitHubIssueResponse;

  return Response.json({
    success: true,
    issueUrl: issueData.html_url,
    issueNumber: issueData.number,
  });
};
