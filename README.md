# ProjetoMensal6Periodo-1Entrega

Sistema simples de controle de estoque com autenticação e controle de acesso por papel de usuário.

## O que é o projeto

Aplicação full-stack onde usuários autenticados podem visualizar o estoque de itens. Existem dois papéis de usuário:

- **master**: pode criar, editar e excluir itens do estoque.
- **comum**: pode apenas visualizar a lista de itens (somente leitura).

Além do estoque, cada usuário logado tem uma página de perfil onde pode consultar seus dados e atualizar o próprio nome e senha (o papel não pode ser alterado pelo próprio usuário).

## Stack utilizada

- **Backend**: Node.js + Express, com acesso direto ao PostgreSQL via biblioteca `pg` (sem ORM), para manter o SQL explícito e simples de entender.
- **Frontend**: React + Vite, por ser um setup leve e rápido para uma SPA pequena.
- **Autenticação**: JWT (`jsonwebtoken`) para sessão sem estado no servidor, e `bcryptjs` para hash de senhas.
- **Containerização**: Docker + docker-compose, permitindo subir banco, backend e frontend com um único comando, sem precisar instalar Postgres/Node localmente.

## Como rodar localmente com Docker

Pré-requisito: Docker e Docker Compose instalados.

Na raiz do projeto, execute:

```bash
docker-compose up --build
```

Isso vai subir três serviços:

- **db**: PostgreSQL 16, com as tabelas e o usuário master inicial já criados automaticamente no primeiro start (via `backend/src/config/init.sql`).
- **backend**: API Express, disponível em `http://localhost:3001`.
- **frontend**: interface React (servida via nginx), disponível em `http://localhost:5173`.

Para derrubar os containers:

```bash
docker-compose down
```

Para derrubar e apagar também os dados do banco (volume):

```bash
docker-compose down -v
```

### Credenciais do usuário master inicial

- **Email**: `admin@estoque.com`
- **Senha**: `admin123`

## Estrutura de pastas

```
ProjetoMensal6Periodo-1Entrega/
  backend/
    src/
      config/       -> conexão com o banco (db.js) e script de criação das tabelas (init.sql)
      middleware/    -> middlewares de autenticação (auth.js: autenticar / apenasMaster)
      controllers/   -> regras de negócio (auth, itens, usuario)
      routes/        -> definição das rotas Express
      server.js      -> ponto de entrada da API
    Dockerfile
    package.json
    .env.example
  frontend/
    src/
      services/api.js     -> chamadas HTTP centralizadas ao backend
      pages/               -> telas da aplicação (Login, Estoque, Perfil)
      components/          -> NavBar e RotaProtegida
      App.jsx / main.jsx   -> configuração de rotas e ponto de entrada React
    Dockerfile
    nginx.conf
    package.json
  docker-compose.yml
  README.md
```

## Telas da aplicação

- **Login** (`/`): formulário de email e senha. Ao autenticar com sucesso, o token JWT e os dados do usuário são salvos no `localStorage` e o usuário é redirecionado para `/estoque`.
- **Estoque** (`/estoque`): lista os itens em uma tabela simples. Usuários com papel `master` veem também o botão de "Novo item" e as ações de editar/excluir em cada linha, além do formulário de criação/edição. Usuários com papel `comum` veem apenas a tabela em modo leitura.
- **Perfil** (`/perfil`): exibe nome, email e papel do usuário logado, e permite atualizar o próprio nome e trocar a própria senha. O papel do usuário nunca pode ser alterado por essa tela.

Ambas as rotas internas (`/estoque` e `/perfil`) são protegidas pelo componente `RotaProtegida`, que redireciona para a tela de login caso não haja um token salvo no `localStorage`.
