export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const number  = searchParams.get('number');
  const message = searchParams.get('message');

  if (!number || !message) {
    return new Response('missing params', { status: 400 });
  }

  const url = `http://bulksmsbd.net/api/smsapi?api_key=${process.env.SMS_API_KEY}&type=text&number=${number}&senderid=8809617629000&message=${encodeURIComponent(message)}`;

  try {
    const res  = await fetch(url);
    const text = await res.text();
    console.log('SMS API raw response:', text); // vercel log-এ দেখা যাবে

    // JSON হলে parse করো
    let code;
    try {
      const json = JSON.parse(text);
      // bulksmsbd JSON format: { response_code: 202, ... } অথবা { error: ... }
      code = json.response_code || json.code || json.error_code || json.status;
    } catch {
      // plain text হলে সরাসরি নাও
      code = parseInt(text.trim());
    }

    return new Response(String(code));
  } catch (e) {
    console.error('SMS fetch error:', e);
    return new Response('1005', { status: 200 });
  }
}
