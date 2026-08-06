CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  papel ENUM('master', 'comum') NOT NULL DEFAULT 'comum',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  descricao TEXT,
  quantidade INT NOT NULL DEFAULT 0,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Usuario master inicial (email: admin@estoque.com / senha: admin123)
INSERT INTO usuarios (nome, email, senha, papel)
VALUES ('Administrador', 'admin@estoque.com', '$2a$10$CjD1D4wJqzFvh5CHvFNR3uxokr.AlprO1ZTHusG5pDGflgIqiSfEW', 'master')
ON DUPLICATE KEY UPDATE email = email;
