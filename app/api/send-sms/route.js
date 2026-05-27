export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const number = searchParams.get('number');
  const message = searchParams.get('message');

  const url = `http://bulksmsbd.net/api/smsapi?api_key=Ycylv8KM6loDoPKAFi6x&type=text&number=${number}&senderid=8809617629000&message=${encodeURIComponent(message)}`;

  const res = await fetch(url);
  const text = await res.text();
  return new Response(text);
}
