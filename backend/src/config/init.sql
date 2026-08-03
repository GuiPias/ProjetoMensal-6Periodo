CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  papel VARCHAR(20) NOT NULL DEFAULT 'comum' CHECK (papel IN ('master', 'comum')),
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS itens (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  descricao TEXT,
  quantidade INTEGER NOT NULL DEFAULT 0,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Usuario master inicial (email: admin@estoque.com / senha: admin123)
INSERT INTO usuarios (nome, email, senha, papel)
VALUES ('Administrador', 'admin@estoque.com', '$2a$10$CjD1D4wJqzFvh5CHvFNR3uxokr.AlprO1ZTHusG5pDGflgIqiSfEW', 'master')
ON CONFLICT (email) DO NOTHING;
