export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'invalid body' }), { status: 400 });
  }

  const { to, subject, html } = body;
  if (!to || !subject || !html) {
    return new Response(JSON.stringify({ success: false, error: 'missing params' }), { status: 400 });
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Rupanjel <noreply@aarot.shop>',
        to,
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.message || 'ইমেইল পাঠানো যায়নি' }),
        { status: 200 }
      );
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), { status: 200 });
  } catch (e) {
    console.error('Resend fetch error:', e);
    return new Response(JSON.stringify({ success: false, error: 'network error' }), { status: 200 });
  }
}
