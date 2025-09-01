// app/api/export/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/utils/supabase/server';
import { toCSV } from '@/lib/csv';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const entity = searchParams.get('entity');
  const from = searchParams.get('from') ?? '2000-01-01';
  const to = searchParams.get('to') ?? new Date().toISOString().slice(0, 10);
  const code = (searchParams.get('code') ?? '').trim();

  if (entity !== 'machine-statement') {
    return NextResponse.json({ error: 'entity not supported' }, { status: 400 });
  }

  const supabase = supabaseServer();

  // 1) machines (id->code)
  const { data: machines, error: mErr } = await supabase.from('machines').select('id, code');
  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });
  const codeById = new Map((machines ?? []).map((m: any) => [m.id, m.code]));

  // 2) v_machine_statement_lines por fechas
  const { data: vrows, error: vErr } = await supabase
    .from('v_machine_statement_lines')
    .select('machine_id, date, source, description, debit, credit')
    .gte('date', from)
    .lte('date', to);
  if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 });

  // 3) Filtra por code y arma filas
  const rows = (vrows ?? [])
    .filter((r: any) => codeById.get(r.machine_id) === code)
    .map((r: any) => {
      const debit = Number(r.debit ?? 0);
      const credit = Number(r.credit ?? 0);
      const amount = debit - credit;
      return {
        machine_code: code,
        date: r.date,
        source: r.source ?? '',
        description: r.description ?? '',
        debit: debit.toFixed(2),
        credit: credit.toFixed(2),
        amount: amount.toFixed(2),
      };
    });

  const csv = toCSV(rows);
  const filename = `estado_${code}_${from}_a_${to}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
