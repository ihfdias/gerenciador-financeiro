# 💰 Gerenciador Financeiro Pessoal

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

Aplicação full-stack para gerenciamento de finanças pessoais com experiência visual moderna, autenticação segura por cookie HttpOnly, proteção CSRF e dashboard com análises mensais.

![Demo da Aplicação]()

---

## 🚀 Links para o Deploy

* **Front-end (Vercel):** [https://gerenciador-financeiro-two.vercel.app]()
* **Back-end (Render):** [https://gerenciador-financeiro-api-sbss.onrender.com]()

---

## ✨ Funcionalidades Principais

-   [x] **Autenticação Segura:** Login e sessão com cookie HttpOnly.
-   [x] **Proteção CSRF:** Rotas sensíveis protegidas contra requisições forjadas.
-   [x] **CRUD Completo de Transações:** Criar, listar, editar e remover transações.
-   [x] **Privacidade por Usuário:** Cada conta acessa apenas os próprios dados.
-   [x] **Dashboard Moderno:** Resumo do mês com saldo, receitas e despesas.
-   [x] **Análise Visual:** Gráfico por categoria com leitura rápida e legenda customizada.
-   [x] **Interface Renovada:** Visual glassmorphism, tipografia refinada e boa experiência mobile.
-   [x] **Deploy Ready:** Estrutura preparada para Vercel + Render + MongoDB Atlas.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando uma stack moderna de JavaScript, com uma estrutura de monorepo gerenciada por **npm Workspaces**.

#### **Back-end**
* **Node.js** e **Express.js** para a API RESTful.
* **MongoDB Atlas** como banco de dados NoSQL.
* **Mongoose** para modelagem dos dados.
* **`jsonwebtoken`**, **`bcryptjs`** e cookies seguros para autenticação.
* **Proteções de segurança** com validação de payload, CORS restrito, rate limit e CSRF.
* **Arquitetura modular** com rotas, modelos, middlewares e utilitários separados.

#### **Front-end**
* **React** (com **Vite**) para a interface de usuário.
* **React Router** para navegação e rotas protegidas.
* **Tailwind CSS** para estilização com tema customizado.
* **Axios** para comunicação com a API.
* **Code-splitting** com lazy loading e otimização de chunks para melhor carregamento.

#### **Ambiente e Deploy**
* **Git & GitHub** para versionamento de código.
* **GitHub Codespaces** como ambiente de desenvolvimento.
* **Render** para o deploy do back-end.
* **Vercel** para o deploy do front-end.

---

## 🔧 Como Executar o Projeto Localmente

1.  **Clone o Repositório:**
    ```bash
    git clone [https://github.com/ihfdias/gerenciador-financeiro.git](https://github.com/ihfdias/gerenciador-financeiro.git)
    cd gerenciador-financeiro
    ```

2.  **Configure as Variáveis de Ambiente:**
    * Copie [backend/.env.example](/home/igor-dias/Área%20de%20Trabalho/gerenciador-financeiro/backend/.env.example) para `backend/.env`.
    * Copie [frontend/.env.example](/home/igor-dias/Área%20de%20Trabalho/gerenciador-financeiro/frontend/.env.example) para `frontend/.env`.
    * Ajuste os valores conforme o ambiente que você vai usar.

3.  **Instale as Dependências (na raiz do projeto):**
    ```bash
    npm install
    ```

4.  **Inicie a Aplicação (na raiz do projeto):**
    ```bash
    npm run dev
    ```
    Este comando iniciará o back-end e o front-end simultaneamente.

5.  **Acesse localmente:**
    - Frontend: `http://localhost:5173`
    - Backend: `http://localhost:3001`

---

## 🔐 Segurança Implementada

- Sessão com cookie `HttpOnly`
- Proteção CSRF para rotas autenticadas de escrita
- Validação de entrada no backend
- Rate limit em rotas sensíveis
- CORS com origens controladas
- Headers básicos de segurança no backend e no frontend
- Senhas com hash usando `bcryptjs`

---

## 🗄️ Recriando o Banco

Se você perdeu o banco antigo do MongoDB Atlas, este projeto pode voltar a funcionar de duas formas.

### Opção 1: MongoDB local

Use esta opção para voltar a desenvolver rapidamente.

1. Instale o MongoDB Community Server na sua máquina.
2. Inicie o serviço local do MongoDB.
3. No arquivo `backend/.env`, mantenha:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/gerenciador-financeiro
   ```
4. Rode o projeto com `npm run dev`.

### Opção 2: Novo cluster no MongoDB Atlas

Use esta opção se você quiser voltar ao ambiente em nuvem.

1. Crie um novo projeto no MongoDB Atlas.
2. Crie um cluster.
3. Em `Database Access`, crie um usuário com senha.
4. Em `Network Access`, libere seu IP atual ou use `0.0.0.0/0` temporariamente apenas para testes.
5. Copie a connection string do Atlas.
6. No arquivo `backend/.env`, substitua `MONGODB_URI` por algo neste formato:
   ```env
   MONGODB_URI=mongodb+srv://USUARIO:SENHA@cluster0.xxxxx.mongodb.net/gerenciador-financeiro?retryWrites=true&w=majority
   ```
7. Se o backend estiver em produção, atualize a variável `MONGODB_URI` também no Render.

### Variáveis mínimas do backend

Exemplo:

```env
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/gerenciador-financeiro
JWT_SECRET=troque-esta-chave-por-uma-chave-forte
NODE_ENV=development
COOKIE_SECURE=false
AUTH_COOKIE_NAME=financeiro_auth
CSRF_COOKIE_NAME=financeiro_csrf
FRONTEND_URL=http://localhost:5173
```

### Recuperação de senha

## ☁️ Deploy em Produção

Este projeto está preparado para rodar com:

- Frontend no **Vercel**
- Backend no **Render**
- Banco no **MongoDB Atlas**

### 1. Backend no Render

Você pode criar o serviço manualmente ou usar o arquivo [render.yaml](/home/igor-dias/Área%20de%20Trabalho/gerenciador-financeiro/render.yaml).

Configuração principal:

- Build Command: `npm install`
- Start Command: `npm run start:backend`
- Health Check Path: `/api/health`

Variáveis obrigatórias no Render:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://USUARIO:SENHA@cluster.mongodb.net/gerenciador-financeiro?retryWrites=true&w=majority
JWT_SECRET=gere-uma-chave-longa-e-forte
FRONTEND_URL=https://SEU-FRONTEND.vercel.app
COOKIE_SECURE=true
AUTH_COOKIE_NAME=financeiro_auth
CSRF_COOKIE_NAME=financeiro_csrf
```

Variáveis opcionais:

```env
CORS_ORIGINS=https://SEU-FRONTEND.vercel.app
```

### 2. Frontend no Vercel

No Vercel, configure o projeto apontando para a pasta `frontend`.

Configuração principal:

- Framework Preset: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

Variável obrigatória no Vercel:

```env
VITE_API_URL=https://SEU-BACKEND.onrender.com
```

### 3. Cookies, CORS e login entre domínios

Como o frontend e o backend ficam em domínios diferentes, estes pontos são importantes:

1. `FRONTEND_URL` no Render deve ser exatamente a URL pública do Vercel.
2. `COOKIE_SECURE=true` deve estar ativo em produção.
3. O frontend já envia requisições com `credentials`, e o backend já responde com CORS preparado para isso.
4. Se trocar o domínio do frontend depois, atualize `FRONTEND_URL` e, se necessário, `CORS_ORIGINS`.

### 4. Checklist antes de publicar

- Rotacione a senha do usuário do MongoDB Atlas.
- Gere um `JWT_SECRET` forte e exclusivo para produção.
- Confirme que seu cluster Atlas aceita conexões do Render.
- Depois do deploy do backend, atualize `VITE_API_URL` no Vercel.
- Depois do deploy do frontend, atualize `FRONTEND_URL` no Render.

### 5. Ordem recomendada

1. Publique o backend no Render.
2. Teste `/api/health`.
3. Publique o frontend no Vercel com `VITE_API_URL`.
4. Atualize `FRONTEND_URL` no Render com a URL final do Vercel.
5. Teste login, logout, criação de transação e analytics.

---

## 👨‍💻 Autor

Feito por **Igor Dias**

* **GitHub:** [@ihfdias](https://github.com/ihfdias)
* **LinkedIn:** [Igor Dias]()
