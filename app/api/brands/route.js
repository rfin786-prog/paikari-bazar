import { NextResponse } from 'next/server';

const SUPABASE_URL = 'https://xxqtdlwglpggqafecuka.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4cXRkbHdnbHBnZ3FhZmVjdWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDQwODcsImV4cCI6MjA5MjcyMDA4N30.gkqQTxM1n6Jqe-fBrf9RaI1EByJTX7Uv1QvECqzSDDI';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/brands?select=*&order=name.asc`,
      { headers }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
