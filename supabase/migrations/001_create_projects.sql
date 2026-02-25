-- Tabela de projetos
create table projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now() not null
);

-- Habilitar RLS (Row Level Security)
alter table projects enable row level security;

-- Política: usuário só vê seus próprios projetos
create policy "Usuários podem ver seus próprios projetos"
  on projects for select
  using (auth.uid() = owner_id);

-- Política: usuário só cria projetos para si mesmo
create policy "Usuários podem criar seus próprios projetos"
  on projects for insert
  with check (auth.uid() = owner_id);

-- Política: usuário só edita seus próprios projetos
create policy "Usuários podem editar seus próprios projetos"
  on projects for update
  using (auth.uid() = owner_id);

-- Política: usuário só exclui seus próprios projetos
create policy "Usuários podem excluir seus próprios projetos"
  on projects for delete
  using (auth.uid() = owner_id);
