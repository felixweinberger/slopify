export const onRequestGet: PagesFunction = async () => {
  const headers = new Headers();
  headers.set('Location', '/');
  headers.set('Set-Cookie', 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');

  return new Response(null, { status: 302, headers });
};
