# ProjetoMensal6Periodo-1Entrega

Sistema simples de controle de estoque com autenticação e controle de acesso por papel de usuário.

## O que é o projeto

Aplicação full-stack onde usuários autenticados podem visualizar o estoque de itens. Existem dois papéis de usuário:

- **master**: pode criar, editar e excluir itens do estoque.
- **comum**: pode apenas visualizar a lista de itens (somente leitura).

Além do estoque, cada usuário logado tem uma página de perfil onde pode consultar seus dados e atualizar o próprio nome e senha (o papel não pode ser alterado pelo próprio usuário).

## Stack utilizada

- **Backend**: Node.js + Express, com acesso direto ao MySQL via biblioteca `mysql2` (sem ORM), para manter o SQL explícito e simples de entender.
- **Frontend**: React + Vite, por ser um setup leve e rápido para uma SPA pequena.
- **Autenticação**: JWT (`jsonwebtoken`) para sessão sem estado no servidor, e `bcryptjs` para hash de senhas.
- **Containerização**: Docker + docker-compose, permitindo subir banco, backend e frontend com um único comando, sem precisar instalar MySQL/Node localmente.

## Como rodar localmente com Docker

Pré-requisito: Docker e Docker Compose instalados.

Na raiz do projeto, execute:

```bash
docker-compose up --build
```

Isso vai subir três serviços:

- **db**: MySQL 8.4, com as tabelas e o usuário master inicial já criados automaticamente no primeiro start (via `backend/src/config/init.sql`).
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
  k8s/              -> manifestos Kubernetes para rodar no Minikube (ver seção "Kubernetes (Minikube)")
  evidencias/        -> lista de prints da demonstração em Kubernetes
  docker-compose.yml
  README.md
```

## Telas da aplicação

- **Login** (`/`): formulário de email e senha. Ao autenticar com sucesso, o token JWT e os dados do usuário são salvos no `localStorage` e o usuário é redirecionado para `/estoque`.
- **Estoque** (`/estoque`): lista os itens em uma tabela simples. Usuários com papel `master` veem também o botão de "Novo item" e as ações de editar/excluir em cada linha, além do formulário de criação/edição. Usuários com papel `comum` veem apenas a tabela em modo leitura.
- **Perfil** (`/perfil`): exibe nome, email e papel do usuário logado, e permite atualizar o próprio nome e trocar a própria senha. O papel do usuário nunca pode ser alterado por essa tela.

Ambas as rotas internas (`/estoque` e `/perfil`) são protegidas pelo componente `RotaProtegida`, que redireciona para a tela de login caso não haja um token salvo no `localStorage`.

## Kubernetes (Minikube)

Além do docker-compose (uso local/EC2), o projeto também pode ser executado em um cluster
Kubernetes local via Minikube, usando os manifestos da pasta [`k8s/`](k8s/). Essa migração não
altera o `docker-compose.yml` nem a pipeline da EC2 (`.github/workflows/ci-cd.yml`) — são dois
modos de execução independentes.

### Pré-requisitos

- [Minikube](https://minikube.sigs.k8s.io/docs/start/) instalado e com um driver configurado (ex.: `docker`).
- `kubectl` instalado (ou use `minikube kubectl --` como alternativa).
- Docker instalado (para construir as imagens).

### 1. Iniciar o cluster

```bash
minikube start
```

### 2. Build das imagens dentro do Minikube

As imagens precisam existir **dentro** do ambiente Docker do Minikube (não no Docker da
máquina host), já que os Deployments usam `imagePullPolicy: Never` — ou seja, o Kubernetes
nunca tenta baixar essas imagens de um registry, só usa o que já está local no node.

Nenhuma das duas precisa de build args: o `frontend/Dockerfile` já usa `/api` como valor padrão
de `VITE_API_URL` (ver comentário no próprio Dockerfile), então basta buildar direto.

```bash
minikube image build -t backend:k8s ./backend
minikube image build -t frontend:k8s ./frontend
minikube image ls | grep -E 'backend|frontend'
```

> **Por que não passar `VITE_API_URL=/api` pela linha de comando**: no Git Bash do Windows
> (MSYS), qualquer argumento que pareça um caminho absoluto Unix é convertido para um caminho
> de arquivo Windows — `/api` virava `C:/Program Files/Git/api`, e esse valor corrompido ficava
> embutido no bundle do React, quebrando toda chamada à API (`Failed to fetch`). Por isso o
> padrão correto já vem do Dockerfile, e não é preciso (nem seguro, no Git Bash) passar
> `--build-arg`/`--build-opt=build-arg=...` para esse valor. Isso também evita o
> [bug conhecido](https://github.com/kubernetes/minikube/issues/12384) de
> `minikube image build --build-opt=build-arg=...` (`flag provided but not defined: -build-arg`).
>
> Se precisar apontar para outra URL (ex.: testar contra um backend externo), use o Docker da
> própria máquina e depois `minikube image load frontend:k8s`:
> ```bash
> docker build --build-arg VITE_API_URL=http://outro-host:3001 -t frontend:k8s ./frontend
> minikube image load frontend:k8s
> ```
> (nesse caso o valor não tem `/` inicial sozinho, então não sofre o problema do MSYS; ainda
> assim, no PowerShell ou fora do Git Bash isso nunca é um problema.)

### 3. Aplicar os manifestos

```bash
kubectl apply -f k8s/
```

Isso cria, nesta ordem (os arquivos são numerados para refletir as dependências):
ConfigMaps (`app-config`, `mysql-initdb-config`, `frontend-nginx-config`), o `Secret`
(`app-secret`), o PVC do MySQL, e os Deployments/Services do MySQL, backend e frontend.

> **Segurança**: `k8s/03-secret.yaml` tem senhas de exemplo em texto puro (`stringData`), só
> para rodar localmente no Minikube. Troque os valores antes de usar em qualquer ambiente real.

Acompanhe até todos os Pods ficarem `Running`/`READY`:

```bash
kubectl get pods -w
```

### 4. Acessar a aplicação pelo navegador

O frontend é o único serviço exposto, via `NodePort` 30080. A forma mais confiável no
Minikube (funciona com qualquer driver, incluindo `docker` no Windows) é:

```bash
minikube service frontend-service
```

Isso abre o navegador automaticamente (ou imprime a URL). Alternativamente, com o driver
`docker` pode ser necessário um túnel (`minikube service frontend-service --url`); com outros
drivers, `http://$(minikube ip):30080` também funciona diretamente.

Login inicial: `admin@estoque.com` / `admin123` (mesmas credenciais do `init.sql`).

### 5. Comandos da demonstração

```bash
# Réplicas, IPs e nodes de cada Pod
kubectl get pods -o wide

# Tipos de Service (frontend = NodePort, backend/mysql = ClusterIP)
kubectl get services

# Réplicas desejadas vs. prontas em cada Deployment
kubectl get deployments
```

Teste de balanceamento — o cabeçalho `X-Pod` (e o campo `"pod"` do JSON) mudam entre
requisições, provando que o tráfego é distribuído entre os 3 Pods do backend. Com o driver
`docker` (padrão no Windows), o NodePort não é acessível direto pelo IP do node, então use a
mesma URL aberta no passo 4 (`minikube service frontend-service --url`) **ou** um
`kubectl port-forward`, que funciona em qualquer driver/SO:

```bash
kubectl port-forward svc/frontend-service 18080:80 &
for i in $(seq 1 10); do curl -s -D - http://127.0.0.1:18080/api/health -o /dev/null | grep -i x-pod; done
```

```powershell
# PowerShell
Start-Job { kubectl port-forward svc/frontend-service 18080:80 }
1..10 | ForEach-Object { (Invoke-WebRequest http://127.0.0.1:18080/api/health).Headers['X-Pod'] }
```

Autocura — apaga um Pod do backend e o Deployment recria automaticamente outro no lugar:

```bash
kubectl delete pod <nome-de-um-pod-backend>
kubectl get pods -o wide -w
```

### Problemas comuns

- **`ErrImageNeverPull` / `ImagePullBackOff`**: a imagem não foi construída dentro do Minikube
  (passo 2) ou o nome/tag não é exatamente `backend:k8s` / `frontend:k8s`. Confirme com
  `minikube image ls`.
- **MySQL em `CrashLoopBackOff` logo no início**: normal nos primeiros segundos enquanto o
  volume é inicializado; espere o `readinessProbe` (`kubectl get pods -w`). Se persistir, veja
  `kubectl logs deployment/mysql-deployment`.
- **Backend não fica `Ready`**: provavelmente ainda está esperando o MySQL subir. Os `Pods` do
  backend reiniciam algumas vezes até o `mysql-service` responder — isso é esperado, não há
  `depends_on` no Kubernetes.
- **Frontend carrega mas as chamadas à API falham (404/502)**: confira se o `ConfigMap`
  `frontend-nginx-config` foi montado (`kubectl exec <pod-frontend> -- cat /etc/nginx/conf.d/default.conf`)
  e se `backend-service` está `Running`.
- **Login dá "Failed to fetch" e o bundle do frontend tem um caminho estranho embutido
  (ex. `C:/Program Files/Git/api`)**: a imagem foi buildada passando `VITE_API_URL=/api` pela
  linha de comando no Git Bash do Windows, que converteu `/api` num caminho de arquivo. Rebuilde
  sem passar esse argumento (`minikube image build -t frontend:k8s ./frontend` — o Dockerfile já
  tem `/api` como padrão), rode `kubectl rollout restart deployment/frontend-deployment` e
  atualize o navegador com Ctrl+F5. Para confirmar o valor embutido no bundle antes mesmo de
  abrir o navegador: `kubectl exec <pod-frontend> -- grep -o '"/api"' /usr/share/nginx/html/assets/*.js`.
- **`http://<minikube ip>:30080` não abre no Windows com driver `docker`**: use
  `minikube service frontend-service`, que cria o túnel necessário automaticamente.
- **Mudou o código e quer atualizar**: rebuilde a imagem (passo 2) e rode
  `kubectl rollout restart deployment/backend-deployment` (ou `frontend-deployment`), já que a
  tag da imagem não muda e o Kubernetes não baixa de novo por conta própria.
