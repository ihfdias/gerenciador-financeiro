# 💰 Gerenciador Financeiro Pessoal

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

Aplicação full-stack completa para gerenciamento de finanças pessoais. Permite que usuários se cadastrem, façam login e controlem suas receitas e despesas de forma segura, com dados privados para cada conta.

![Demo da Aplicação]()

---

## 🚀 Links para o Deploy

* **Front-end (Vercel):** [https://gerenciador-financeiro-two.vercel.app]()
* **Back-end (Render):** [https://gerenciador-financeiro-api-sbss.onrender.com]()

---

## ✨ Funcionalidades Principais

-   [x] **Autenticação de Usuários:** Sistema completo de registro e login.
-   [x] **Segurança:** Senhas criptografadas com `bcrypt` e rotas protegidas com `JWT`.
-   [x] **CRUD Completo de Transações:** Funcionalidade de Criar, Ler, **Editar** e Deletar transações.
-   [x] **Privacidade de Dados:** Cada usuário tem acesso apenas às suas próprias transações.
-   [x] **Dashboard Interativo:** Resumo em tempo real de receitas, despesas e saldo.
-   [x] **Categorização:** Transações podem ser classificadas em categorias (Salário, Comida, etc.).
-   [x] **Filtros de Data:** Visualização de transações por mês e ano.
-   [x] **UX Melhorada:** Saudação personalizada, indicadores de carregamento (spinners) e formatação de moeda para o padrão brasileiro.
-   [x] **Design Responsivo:** Interface moderna e adaptável a diferentes tamanhos de tela.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando uma stack moderna de JavaScript, com uma estrutura de monorepo gerenciada por **npm Workspaces**.

#### **Back-end**
* **Node.js** e **Express.js** para a API RESTful.
* **MongoDB Atlas** como banco de dados NoSQL.
* **Mongoose** para modelagem dos dados.
* **`jsonwebtoken`** e **`bcryptjs`** para o fluxo de autenticação.
* **Arquitetura Modular** com rotas, modelos e middlewares separados.

#### **Front-end**
* **React** (com **Vite**) para a interface de usuário.
* **React Router** para navegação e rotas protegidas.
* **Tailwind CSS** para estilização "utility-first" e tema customizado.
* **Axios** para a comunicação com a API.

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
    * Crie um arquivo `.env` na pasta `backend` e adicione `MONGODB_URI` и `JWT_SECRET`.
    * Crie um arquivo `.env` na pasta `frontend` e adicione `VITE_API_URL=http://localhost:3001`.

3.  **Instale as Dependências (na raiz do projeto):**
    ```bash
    npm install
    ```

4.  **Inicie a Aplicação (na raiz do projeto):**
    ```bash
    npm run dev
    ```
    Este comando iniciará o back-end e o front-end simultaneamente.

---

## 👨‍💻 Autor

Feito por **Igor Dias**

* **GitHub:** [@ihfdias](https://github.com/ihfdias)
* **LinkedIn:** [Igor Dias]()