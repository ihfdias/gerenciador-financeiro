# Gerenciador Financeiro Pessoal

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

Aplicação full-stack completa para gerenciamento de finanças pessoais. Permite que usuários se cadastrem, façam login e controlem suas receitas e despesas de forma segura e individual.

![Demo da Aplicação]()

---

## Links para o Deploy

* **Front-end (Vercel):** [https://gerenciador-financeiro-two.vercel.app]()
* **Back-end (Render):** [https://gerenciador-financeiro-api-sbss.onrender.com]()

---

## Funcionalidades Principais

* **Autenticação de Usuários:** Sistema completo de registro e login.
* **Segurança:** Senhas criptografadas com `bcrypt` e rotas protegidas com `JWT (JSON Web Token)`.
* **Gerenciamento de Transações:** Funcionalidade completa de CRUD (Criar, Ler e Deletar) para receitas e despesas.
* **Privacidade de Dados:** Cada usuário tem acesso apenas às suas próprias transações financeiras.
* **Dashboard Interativo:** Resumo em tempo real de receitas, despesas e saldo total.
* **UX Personalizada:** Saudação com o nome do usuário e formatação de moeda para o padrão brasileiro (R$ 1.234,56).
* **Design Responsivo:** Interface moderna e adaptável a diferentes tamanhos de tela, construída com Tailwind CSS.

---

## Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias e conceitos:

#### **Back-end**
* **Node.js** e **Express.js** para a construção da API RESTful.
* **MongoDB Atlas** como banco de dados NoSQL na nuvem.
* **Mongoose** para modelagem dos dados e interação com o MongoDB.
* **`jsonwebtoken`** para geração e verificação de tokens de autenticação.
* **`bcryptjs`** para hashing seguro de senhas.
* **Arquitetura Modular** com rotas, modelos e middlewares separados.
* **`dotenv`** para gerenciamento de variáveis de ambiente.

#### **Front-end**
* **React.js** com **Vite** para uma experiência de desenvolvimento rápida.
* **React Router (`react-router-dom`)** para navegação e criação de múltiplas páginas.
* **Tailwind CSS** para estilização "utility-first" e criação de um tema de cores personalizado.
* **Axios** para a comunicação com a API do back-end.
* **`jwt-decode`** para extrair informações do token JWT no cliente.
* **`Intl.NumberFormat`** para formatação de moeda com localização.

#### **Ambiente e Deploy**
* **Git & GitHub** para versionamento de código.
* **GitHub Codespaces** como ambiente de desenvolvimento na nuvem.
* **Render** para o deploy do serviço de back-end (Node.js).
* **Vercel** para o deploy do site de front-end (React).

---

## Como Executar o Projeto Localmente

Para rodar este projeto no seu próprio ambiente, siga os passos abaixo.

**Pré-requisitos:**
* Node.js (versão LTS recomendada)
* Git
* Uma conta no MongoDB Atlas

**1. Clone o Repositório:**
```bash
git clone [https://github.com/seu-usuario/gerenciador-financeiro.git](https://github.com/seu-usuario/gerenciador-financeiro.git)
cd gerenciador-financeiro

2. Configure o Back-end:

# Navegue para a pasta do backend
cd backend

# Instale as dependências
npm install

# Crie um arquivo .env e adicione as variáveis necessárias
# (veja o arquivo .env.example abaixo)

3. Configure o Front-end:

# Navegue para a pasta do frontend em outro terminal
cd frontend

# Instale as dependências
npm install

# Crie um arquivo .env e adicione a variável da API
# (veja o arquivo .env.example abaixo)

4. Inicie os Servidores:

No terminal do back-end: npm start

No terminal do front-end: npm run dev

.env.example
Variáveis necessárias no arquivo .env do backend:

MONGODB_URI="sua_string_de_conexao_com_o_mongodb"
JWT_SECRET="seu_segredo_jwt_gerado_aleatoriamente"
Variável necessária no arquivo .env do frontend:

VITE_API_URL="http://localhost:3001"

Autor
Feito por Igor Dias

GitHub: @ihfdias

LinkedIn: https://www.linkedin.com/in/igor-hfdias/