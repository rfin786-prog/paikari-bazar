import { NextResponse } from 'next/server';

const SUPABASE_URL = 'https://xxqtdlwglpggqafecuka.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4cXRkbHdnbHBnZ3FhZmVjdWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDQwODcsImV4cCI6MjA5MjcyMDA4N30.gkqQTxM1n6Jqe-fBrf9RaI1EByJTX7Uv1QvECqzSDDI';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

function clean(obj) {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === '' || v === undefined) continue;
    result[k] = v;
  }
  return result;
}

export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`,
      { headers }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { category, sub_category, ...rest } = body;
    const payload = clean({
      ...rest,
      category_id: category || null,
      sub_category_id: sub_category || null,
    });
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products`,
      { method: 'POST', headers, body: JSON.stringify(payload) }
    );
    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json({ error: text }, { status: res.status });
    }
    return NextResponse.json(JSON.parse(text || '[]'));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const body = await request.json();
    const { id: _id, created_at, category, sub_category, ...rest } = body;
    const updateData = clean({
      ...rest,
      category_id: category || null,
      sub_category_id: sub_category || null,
    });

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
      { method: 'PATCH', headers, body: JSON.stringify(updateData) }
    );
    const text = await res.text();
    return NextResponse.json(JSON.parse(text || '[]'));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
      { method: 'DELETE', headers }
    );
    return NextResponse.json({ success: res.ok });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
