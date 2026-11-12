-- Troca o expediente semanal inteiro de uma vez, em uma única transação,
-- para o painel nunca deixar a agenda sem horários se algo falhar no meio.
-- SECURITY INVOKER: roda com as permissões de quem chama, e o RLS continua valendo.
create function public.replace_business_hours(p_periods jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN';
  end if;

  delete from public.business_hours where true;

  insert into public.business_hours (weekday, opens_at, closes_at)
  select (p ->> 'weekday')::smallint, (p ->> 'opens_at')::time, (p ->> 'closes_at')::time
  from jsonb_array_elements(coalesce(p_periods, '[]'::jsonb)) as p;
end;
$$;

revoke execute on function public.replace_business_hours(jsonb) from public, anon;
grant execute on function public.replace_business_hours(jsonb) to authenticated;
