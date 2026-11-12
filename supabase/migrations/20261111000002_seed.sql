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
