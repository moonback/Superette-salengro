create table if not exists stock_movements (
  id          uuid primary key default gen_random_uuid(),
  barcode     text not null,
  delta       integer not null,
  quantity_after integer not null,
  source      text,
  note        text,
  created_at  bigint not null
);

create index on stock_movements (barcode, created_at desc);

-- RLS : autorise les utilisateurs authentifiés à lire et insérer
alter table stock_movements enable row level security;

drop policy if exists "authenticated_read"  on stock_movements;
drop policy if exists "authenticated_insert" on stock_movements;
drop policy if exists "authenticated_all"    on stock_movements;

create policy "authenticated_all" on stock_movements
  for all
  using  (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
