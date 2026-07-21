import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req) {
  const supabase = getClient();
  const body = await req.json();
  const { data, error } = await supabase.from('banners').insert([body]).select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
}

export async function PATCH(req) {
  const supabase = getClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const body = await req.json();

  const { data, error } = await supabase
    .from('banners')
    .update(body)
    .eq('id', id)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
}

export async function DELETE(req) {
  const supabase = getClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  const { error } = await supabase.from('banners').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
