-- ARQUIVO GERADO: junta as migrações de supabase/migrations em ordem.
-- Cole tudo no SQL Editor do Supabase e clique em Run (uma única vez).

begin;

-- =====================================================================
-- Studio Natalli Anjos — esquema do banco
-- Tabelas, Row Level Security e funções de agendamento.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Usuários administrativos
-- ---------------------------------------------------------------------
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text,
  created_at timestamptz not null default now()
);

-- Usada pelas políticas de RLS. SECURITY DEFINER para poder ler admin_users
-- sem abrir a tabela para ninguém.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Serviços
-- ---------------------------------------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  category text not null default 'outros',
  description text not null default '',
  price_cents integer check (price_cents is null or price_cents >= 0),
  duration_minutes integer not null check (duration_minutes between 5 and 600),
  image_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger services_updated_at before update on public.services
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Clientes (somente o necessário: nome, WhatsApp e observações internas)
-- ---------------------------------------------------------------------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  -- Só dígitos, com DDI: 55 + DDD + número
  whatsapp text not null unique check (whatsapp ~ '^55[0-9]{10,11}$'),
  -- Consentimento para receber mensagens sobre os agendamentos
  whatsapp_opt_in boolean not null default false,
  whatsapp_opt_in_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger clients_updated_at before update on public.clients
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Horários de funcionamento (várias linhas no mesmo dia = intervalo entre elas)
-- ---------------------------------------------------------------------
create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check (weekday between 0 and 6), -- 0 = domingo
  opens_at time not null,
  closes_at time not null,
  check (closes_at > opens_at)
);
create index business_hours_weekday_idx on public.business_hours (weekday);

-- ---------------------------------------------------------------------
-- Bloqueios de agenda (folgas, feriados, bloqueios específicos)
-- ---------------------------------------------------------------------
create table public.schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'bloqueio' check (kind in ('folga', 'feriado', 'bloqueio')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index schedule_blocks_range_idx on public.schedule_blocks using gist (tstzrange(starts_at, ends_at));

-- ---------------------------------------------------------------------
-- Agendamentos
-- ---------------------------------------------------------------------
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete restrict,
  service_id uuid references public.services (id) on delete set null,
  -- Cópia do nome e do preço no momento do pedido (o serviço pode mudar depois)
  service_name text not null,
  price_cents integer,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'declined', 'cancelled', 'completed', 'no_show', 'expired')),
  -- Enquanto pendente, o horário fica reservado até este instante
  hold_expires_at timestamptz,
  source text not null default 'site' check (source in ('site', 'admin')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  -- Garantia final contra agendamento duplicado: o próprio banco recusa dois
  -- agendamentos ativos que se sobreponham, mesmo com pedidos simultâneos.
  constraint appointments_no_overlap
    exclude using gist (tstzrange(starts_at, ends_at) with &&)
    where (status in ('pending', 'confirmed'))
);
create index appointments_starts_at_idx on public.appointments (starts_at);
create index appointments_client_idx on public.appointments (client_id);
create index appointments_status_idx on public.appointments (status);
create trigger appointments_updated_at before update on public.appointments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Pagamentos (controle financeiro básico — receita só conta quando 'paid')
-- ---------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  method text check (method in ('pix', 'dinheiro', 'credito', 'debito', 'outro')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'refunded')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index payments_appointment_idx on public.payments (appointment_id);

-- ---------------------------------------------------------------------
-- Conteúdo do site
-- ---------------------------------------------------------------------
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  comment text not null,
  photo_url text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'outros',
  image_url text not null,
  before_image_url text,
  caption text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Configurações (chave/valor). is_public = pode ser lida pelo site.
-- ---------------------------------------------------------------------
create table public.settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);
create trigger settings_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Notificações de WhatsApp (estrutura; o envio entra na Etapa 6)
-- ---------------------------------------------------------------------
create table public.notification_templates (
  event text primary key check (event in (
    'request_received', 'confirmed', 'declined', 'rescheduled',
    'reminder_24h', 'reminder_soon', 'cancelled'
  )),
  enabled boolean not null default false,
  body text not null,
  -- Nome do modelo aprovado na WhatsApp Business Platform, quando exigido
  provider_template_name text,
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments (id) on delete cascade,
  event text not null references public.notification_templates (event),
  to_number text not null,
  -- 'skipped' = não enviada (integração desligada ou sem consentimento)
  status text not null default 'queued' check (status in ('queued', 'skipped', 'sent', 'delivered', 'failed')),
  attempts integer not null default 0,
  last_error text,
  provider_message_id text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index notifications_appointment_idx on public.notifications (appointment_id);
create index notifications_status_idx on public.notifications (status);

-- =====================================================================
-- Row Level Security
-- Visitantes (anon) só leem conteúdo público. Dados de clientes e da
-- agenda só são acessíveis por administradoras autenticadas. O site cria
-- pedidos exclusivamente pela função request_appointment().
-- =====================================================================
alter table public.admin_users enable row level security;
alter table public.services enable row level security;
alter table public.clients enable row level security;
alter table public.business_hours enable row level security;
alter table public.schedule_blocks enable row level security;
alter table public.appointments enable row level security;
alter table public.payments enable row level security;
alter table public.testimonials enable row level security;
alter table public.gallery_images enable row level security;
alter table public.settings enable row level security;
alter table public.notification_templates enable row level security;
alter table public.notifications enable row level security;

-- Leitura pública
create policy "public read active services" on public.services
  for select to anon, authenticated using (active or public.is_admin());
create policy "public read business hours" on public.business_hours
  for select to anon, authenticated using (true);
create policy "public read published testimonials" on public.testimonials
  for select to anon, authenticated using (published or public.is_admin());
create policy "public read published gallery" on public.gallery_images
  for select to anon, authenticated using (published or public.is_admin());
create policy "public read public settings" on public.settings
  for select to anon, authenticated using (is_public or public.is_admin());

-- Escrita e dados privados: somente administradoras
create policy "admin read own row" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

create policy "admin write services" on public.services
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin write business hours" on public.business_hours
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin write testimonials" on public.testimonials
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin write gallery" on public.gallery_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin write settings" on public.settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admin all clients" on public.clients
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all schedule blocks" on public.schedule_blocks
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all appointments" on public.appointments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all payments" on public.payments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all notification templates" on public.notification_templates
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all notifications" on public.notifications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Permissões de tabela (o RLS acima decide quais linhas cada papel enxerga)
revoke all on all tables in schema public from anon;
grant select on public.services, public.business_hours, public.testimonials,
  public.gallery_images, public.settings to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- =====================================================================
-- Funções de agendamento
-- =====================================================================

create function public.setting_int(p_key text, p_default integer)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select (value #>> '{}')::integer from public.settings where key = p_key), p_default);
$$;

create function public.setting_text(p_key text, p_default text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select value #>> '{}' from public.settings where key = p_key), p_default);
$$;

-- Horários livres de um serviço em um dia, calculados no servidor a partir de:
-- horários de funcionamento, duração do serviço, antecedência mínima,
-- agendamentos confirmados, pedidos pendentes ainda reservados e bloqueios.
create function public.get_available_slots(p_service_id uuid, p_date date)
returns table (slot_start timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_tz text := public.setting_text('timezone', 'America/Bahia');
  v_step integer := public.setting_int('slot_interval_minutes', 15);
  v_notice integer := public.setting_int('min_notice_minutes', 120);
  v_max_days integer := public.setting_int('max_advance_days', 60);
  v_today date := (now() at time zone v_tz)::date;
  v_duration interval;
begin
  select make_interval(mins => s.duration_minutes) into v_duration
  from public.services s
  where s.id = p_service_id and s.active;

  if v_duration is null or p_date is null or p_date < v_today or p_date > v_today + v_max_days then
    return;
  end if;

  return query
  select g.slot
  from public.business_hours h
  cross join lateral generate_series(
    (p_date + h.opens_at) at time zone v_tz,
    ((p_date + h.closes_at) at time zone v_tz) - v_duration,
    make_interval(mins => v_step)
  ) as g (slot)
  where h.weekday = extract(dow from p_date)::integer
    and g.slot >= now() + make_interval(mins => v_notice)
    and not exists (
      select 1 from public.appointments a
      where a.starts_at < g.slot + v_duration
        and a.ends_at > g.slot
        and (
          a.status = 'confirmed'
          or (a.status = 'pending' and (a.hold_expires_at is null or a.hold_expires_at > now()))
        )
    )
    and not exists (
      select 1 from public.schedule_blocks b
      where b.starts_at < g.slot + v_duration and b.ends_at > g.slot
    )
  order by g.slot;
end;
$$;

-- Cria um pedido de agendamento (status 'pending') a partir do site.
-- Toda a validação acontece aqui, dentro de uma única transação.
create function public.request_appointment(
  p_service_id uuid,
  p_starts_at timestamptz,
  p_name text,
  p_whatsapp text,
  p_whatsapp_opt_in boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tz text := public.setting_text('timezone', 'America/Bahia');
  v_hold integer := public.setting_int('pending_hold_minutes', 120);
  v_name text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
  v_phone text := regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g');
  v_service public.services%rowtype;
  v_client_id uuid;
  v_appointment public.appointments%rowtype;
begin
  if char_length(v_name) < 2 or char_length(v_name) > 80 then
    raise exception 'INVALID_NAME';
  end if;

  if char_length(v_phone) in (10, 11) then
    v_phone := '55' || v_phone;
  end if;
  if v_phone !~ '^55[0-9]{10,11}$' then
    raise exception 'INVALID_WHATSAPP';
  end if;

  if p_starts_at is null then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  select * into v_service from public.services where id = p_service_id and active;
  if not found then
    raise exception 'SERVICE_NOT_FOUND';
  end if;

  -- Um pedido por vez: evita que dois pedidos simultâneos vejam o mesmo horário livre.
  perform pg_advisory_xact_lock(727274001);

  -- Libera os horários de pedidos pendentes cuja reserva temporária venceu.
  update public.appointments
  set status = 'expired'
  where status = 'pending' and hold_expires_at is not null and hold_expires_at <= now();

  -- Freio contra abuso: limite de pedidos vindos do site por hora.
  if (
    select count(*) from public.appointments
    where source = 'site' and created_at > now() - interval '1 hour'
  ) >= public.setting_int('max_site_requests_per_hour', 30) then
    raise exception 'RATE_LIMITED';
  end if;

  if not exists (
    select 1
    from public.get_available_slots(p_service_id, (p_starts_at at time zone v_tz)::date) s
    where s.slot_start = p_starts_at
  ) then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  -- Cliente identificada pelo WhatsApp. Se já existe, o nome cadastrado é mantido
  -- (um pedido anônimo não pode renomear o cadastro de outra pessoa).
  insert into public.clients (name, whatsapp, whatsapp_opt_in, whatsapp_opt_in_at)
  values (v_name, v_phone, coalesce(p_whatsapp_opt_in, false),
          case when coalesce(p_whatsapp_opt_in, false) then now() end)
  on conflict (whatsapp) do update
    set whatsapp_opt_in = public.clients.whatsapp_opt_in or excluded.whatsapp_opt_in,
        whatsapp_opt_in_at = coalesce(public.clients.whatsapp_opt_in_at, excluded.whatsapp_opt_in_at)
  returning id into v_client_id;

  if (
    select count(*) from public.appointments
    where client_id = v_client_id and status = 'pending'
  ) >= public.setting_int('max_pending_per_client', 3) then
    raise exception 'TOO_MANY_PENDING';
  end if;

  begin
    insert into public.appointments (
      client_id, service_id, service_name, price_cents, starts_at, ends_at, status, hold_expires_at, source
    ) values (
      v_client_id, v_service.id, v_service.name, v_service.price_cents, p_starts_at,
      p_starts_at + make_interval(mins => v_service.duration_minutes),
      'pending', now() + make_interval(mins => v_hold), 'site'
    )
    returning * into v_appointment;
  exception when exclusion_violation then
    raise exception 'SLOT_UNAVAILABLE';
  end;

  return jsonb_build_object(
    'id', v_appointment.id,
    'service_name', v_appointment.service_name,
    'starts_at', v_appointment.starts_at,
    'ends_at', v_appointment.ends_at,
    'status', v_appointment.status
  );
end;
$$;

-- Só o que o site precisa fica executável por visitantes.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.get_available_slots(uuid, date) to anon, authenticated;
grant execute on function public.request_appointment(uuid, timestamptz, text, text, boolean) to anon, authenticated;
-- =====================================================================
-- Carga inicial: dados copiados da página pública de agendamento do
-- estúdio (online.maapp.com.br/studionatallianjos) em 11/11/2026.
-- =====================================================================

insert into public.services (category, name, duration_minutes, price_cents, sort_order) values
  ('sobrancelhas', 'Design com henna', 30, 5000, 10),
  ('sobrancelhas', 'Design com tintura', 30, 5000, 20),
  ('sobrancelhas', 'Design simples personalizado', 15, 3500, 30),

  ('epilacao-cera', 'Barba + design', 30, 8000, 110),
  ('epilacao-cera', 'Epilação abdômen + peitoral', 30, 7000, 120),
  ('epilacao-cera', 'Epilação abdômen completo', 30, 6000, 130),
  ('epilacao-cera', 'Epilação abdômen faixa', 15, 2000, 140),
  ('epilacao-cera', 'Epilação axila', 20, 3500, 150),
  ('epilacao-cera', 'Epilação de costas', 30, 6000, 160),
  ('epilacao-cera', 'Epilação de coxas', 30, 4000, 170),
  ('epilacao-cera', 'Epilação de meia perna', 30, 4000, 180),
  ('epilacao-cera', 'Epilação perna completa', 30, 6000, 190),
  ('epilacao-cera', 'Epilação virilha cavada', 25, 4000, 200),
  ('epilacao-cera', 'Epilação virilha completa', 30, 6000, 210),
  ('epilacao-cera', 'Epilação virilha completa + perianal', 30, 6000, 220),
  ('epilacao-cera', 'Epilação virilha simples', 20, 3000, 230),

  ('epilacao-linha', 'Epilação costeletas', 30, 2000, 310),
  ('epilacao-linha', 'Epilação da testa', 30, 1500, 320),
  ('epilacao-linha', 'Epilação de buço', 5, 1500, 330),
  ('epilacao-linha', 'Epilação de rosto + design e henna', 40, 7500, 340),
  ('epilacao-linha', 'Epilação do queixo', 10, 1500, 350),
  ('epilacao-linha', 'Epilação rosto completo', 30, 5500, 360),
  ('epilacao-linha', 'Rosto + design sobrancelha', 40, 6500, 370),

  ('micropigmentacao', 'Micropigmentação fio a fio', 80, 40000, 410),
  ('micropigmentacao', 'Micropigmentação híbrida', 120, 45000, 420),
  ('micropigmentacao', 'Micropigmentação shadow', 140, 45000, 430),
  ('micropigmentacao', 'Retoque anual micro', 60, 25000, 440),
  ('micropigmentacao', 'Retoque mensal micro', 60, 8000, 450);

-- 0 = domingo … 6 = sábado. Segunda e domingo: fechado (sem linhas).
insert into public.business_hours (weekday, opens_at, closes_at) values
  (2, '08:00', '09:30'), (2, '12:00', '18:00'),
  (3, '08:00', '09:30'), (3, '11:00', '18:30'),
  (4, '11:00', '12:30'), (4, '13:00', '17:00'),
  (5, '08:30', '12:30'), (5, '13:30', '20:00'),
  (6, '08:00', '12:00'), (6, '13:00', '15:30');

insert into public.settings (key, value, is_public) values
  ('timezone', '"America/Bahia"', true),
  -- De quanto em quanto tempo o site oferece horários
  ('slot_interval_minutes', '15', true),
  -- Antecedência mínima para pedir um horário pelo site
  ('min_notice_minutes', '120', true),
  -- Até quantos dias à frente o site aceita pedidos
  ('max_advance_days', '60', true),
  -- Por quanto tempo um pedido pendente segura o horário
  ('pending_hold_minutes', '120', false),
  ('max_pending_per_client', '3', false),
  ('max_site_requests_per_hour', '30', false),
  -- Notificações de WhatsApp: desligadas até a integração ser configurada (Etapa 6)
  ('whatsapp_notifications_enabled', 'false', false);

-- Modelos de mensagem (desativados). Variáveis: {{nome}}, {{servico}}, {{data}}, {{hora}}.
insert into public.notification_templates (event, enabled, body) values
  ('request_received', false, 'Olá, {{nome}}! Recebemos o seu pedido de {{servico}} para {{data}} às {{hora}}. Em breve confirmamos com você.'),
  ('confirmed', false, 'Olá, {{nome}}! Seu horário de {{servico}} está confirmado para {{data}} às {{hora}}.'),
  ('declined', false, 'Olá, {{nome}}. Infelizmente não conseguimos atender o seu pedido de {{servico}} em {{data}} às {{hora}}. Fale com a gente para encontrarmos outro horário.'),
  ('rescheduled', false, 'Olá, {{nome}}! Seu horário de {{servico}} foi reagendado para {{data}} às {{hora}}.'),
  ('reminder_24h', false, 'Olá, {{nome}}! Lembrete: amanhã, {{data}} às {{hora}}, você tem {{servico}} no estúdio.'),
  ('reminder_soon', false, 'Olá, {{nome}}! Seu horário de {{servico}} é hoje às {{hora}}. Até já!'),
  ('cancelled', false, 'Olá, {{nome}}. Seu horário de {{servico}} em {{data}} às {{hora}} foi cancelado.');
-- =====================================================================
-- Armazenamento de imagens (fotos de serviços, galeria e depoimentos).
-- Leitura pública pela URL; envio e remoção somente por administradoras.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "media admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "media admin update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "media admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());
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

commit;
