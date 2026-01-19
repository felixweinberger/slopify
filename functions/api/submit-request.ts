import type { Env } from '../types';

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

  // Get user's access token from DB
  const user = await env.DB.prepare(
    'SELECT access_token FROM users WHERE id = ?'
  ).bind(userId).first<{ access_token: string }>();

  if (!user?.access_token) {
    return Response.json({ error: 'No access token found' }, { status: 401 });
  }

  const body = await request.json() as SubmitRequestBody;

  if (!body.title || !body.description || !body.type) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Format issue based on type
  let issueTitle: string;
  let issueBody: string;

  switch (body.type) {
    case 'app':
      issueTitle = `[New App] ${body.title}`;
      issueBody = `## Description\n${body.description}\n\n---\n*Submitted via Slopify*`;
      break;
    case 'feature':
      issueTitle = `[Feature] ${body.title}`;
      issueBody = `## App\n${body.appName || 'Not specified'}\n\n## Description\n${body.description}\n\n---\n*Submitted via Slopify*`;
      break;
    case 'bug':
      issueTitle = `[Bug] ${body.title}`;
      issueBody = `## App\n${body.appName || 'Not specified'}\n\n## Description\n${body.description}\n\n---\n*Submitted via Slopify*`;
      break;
    default:
      return Response.json({ error: 'Invalid type' }, { status: 400 });
  }

  // Create GitHub issue
  const issueResponse = await fetch('https://api.github.com/repos/felixweinberger/slopify/issues', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${user.access_token}`,
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
