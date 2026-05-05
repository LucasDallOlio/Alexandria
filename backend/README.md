# Alexandria API

API RESTful para gerenciamento de uma biblioteca escolar/pública, desenvolvida com **Node.js**, **Express**, **MySQL** e autenticação **JWT**.

> **Projeto educacional** — os alunos devem implementar os testes de integração e unitários. A API já está funcional e pode ser testada via Thunder Client, Insomnia, Bruno ou Postman.

---

## Sumário

1. [Tecnologias](#tecnologias)
2. [Estrutura de Pastas](#estrutura-de-pastas)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Banco de Dados](#banco-de-dados)
5. [Executando o Projeto](#executando-o-projeto)
6. [Documentação da API](#documentação-da-api)
7. [Autenticação JWT](#autenticação-jwt)
8. [Usuários de Teste](#usuários-de-teste)
9. [Endpoints Resumidos](#endpoints-resumidos)
10. [Paginação](#paginação)
11. [Estrutura do Código — Explicação Didática](#estrutura-do-código--explicação-didática)
12. [Guia para Testes](#guia-para-testes)

---

## Tecnologias

| Pacote             | Função                                              |
|--------------------|-----------------------------------------------------|
| `express`          | Framework web para criação das rotas e middlewares  |
| `mysql2`           | Driver MySQL com suporte a Promises                 |
| `jsonwebtoken`     | Geração e verificação de tokens JWT                 |
| `bcryptjs`         | Hash seguro de senhas                               |
| `dotenv`           | Carrega variáveis de ambiente do arquivo `.env`     |
| `helmet`           | Adiciona headers HTTP de segurança                  |
| `cors`             | Habilita Cross-Origin Resource Sharing              |
| `swagger-jsdoc`    | Gera a especificação OpenAPI a partir dos comentários JSDoc |
| `swagger-ui-express` | Serve a interface visual do Swagger               |
| `nodemon` (dev)    | Reinicia o servidor automaticamente ao salvar       |

---

## Estrutura de Pastas

```
backend/
├── server.js                  # Ponto de entrada da aplicação
├── .env.example               # Modelo das variáveis de ambiente
├── package.json
│
├── src/
│   ├── config/
│   │   ├── database.js        # Pool de conexões MySQL
│   │   └── swagger.js         # Configuração do Swagger/OpenAPI
│   │
│   ├── middlewares/
│   │   ├── auth.js            # Verifica o token JWT (autenticação)
│   │   ├── authorize.js       # Verifica o perfil/role (autorização)
│   │   └── errorHandler.js    # Tratamento centralizado de erros
│   │
│   ├── models/
│   │   ├── User.js            # Queries SQL para a tabela users
│   │   ├── Author.js          # Queries SQL para a tabela authors
│   │   ├── Category.js        # Queries SQL para a tabela categories
│   │   ├── Book.js            # Queries SQL para a tabela books
│   │   └── Loan.js            # Queries SQL para a tabela loans
│   │
│   ├── controllers/
│   │   ├── authController.js       # Lógica de registro, login e perfil
│   │   ├── userController.js       # CRUD de usuários
│   │   ├── authorController.js     # CRUD de autores
│   │   ├── categoryController.js   # CRUD de categorias
│   │   ├── bookController.js       # CRUD de livros
│   │   └── loanController.js       # Lógica de empréstimos e devoluções
│   │
│   └── routes/
│       ├── index.js           # Agrega todas as rotas sob /api
│       ├── authRoutes.js      # POST /auth/register, /login | GET /auth/profile
│       ├── userRoutes.js      # CRUD /users (admin)
│       ├── authorRoutes.js    # CRUD /authors
│       ├── categoryRoutes.js  # CRUD /categories
│       ├── bookRoutes.js      # CRUD /books
│       └── loanRoutes.js      # Empréstimos /loans
│
├── migrations/
│   ├── schema.sql             # Cria o banco e todas as tabelas
│   └── seed.sql               # Insere dados iniciais para testes
│
└── docs/
    └── requirements.md        # Documento de requisitos e regras de negócio
```

---

## Configuração do Ambiente

### 1. Clone o repositório e instale as dependências

```bash
cd backend
npm install
```

### 2. Crie o arquivo `.env`

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=alexandria

JWT_SECRET=troque_por_um_segredo_longo_e_aleatorio
JWT_EXPIRES_IN=7d
```

> **Nunca** versione o arquivo `.env`. Ele já está no `.gitignore`.

---

## Banco de Dados

### Criar as tabelas

```bash
mysql -u root -p < migrations/schema.sql
```

### Popular com dados iniciais

```bash
mysql -u root -p alexandria < migrations/seed.sql
```

> O `seed.sql` cria usuários, autores, categorias, livros e empréstimos de exemplo.  
> **Atenção:** os hashes de senha no seed usam a senha `password` (padrão do hash de exemplo). Para usar as senhas `admin123`/`user123`, gere novos hashes com:
> ```bash
> node -e "const b=require('bcryptjs'); console.log(b.hashSync('admin123',10))"
> ```
> e substitua no `seed.sql` antes de executar.

---

## Executando o Projeto

```bash
# Produção
npm start

# Desenvolvimento (com hot-reload)
npm run dev
```

O servidor sobe em `http://localhost:3000`.

---

## Documentação da API

Com o servidor rodando, acesse o **Swagger UI**:

```
http://localhost:3000/api-docs
```

Lá você pode ver todos os endpoints, modelos de request/response e testá-los diretamente no navegador.

Para autenticar no Swagger:
1. Faça login em `POST /auth/login`
2. Copie o `token` da resposta
3. Clique em **Authorize** (canto superior direito)
4. Cole no formato: `Bearer <token>`

---

## Autenticação JWT

### Como funciona

1. O cliente envia `email` e `password` para `POST /api/auth/login`
2. A API valida as credenciais, assina um JWT e retorna o token
3. Nas requisições seguintes, o cliente envia o token no header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. O middleware `auth.js` verifica a assinatura e injeta `req.user` com `{ id, email, role }`
5. O middleware `authorize.js` (quando aplicado) confere se o `role` do usuário tem permissão para a rota

### Payload do Token

```json
{
  "id": 1,
  "email": "admin@alexandria.com",
  "role": "admin",
  "iat": 1714000000,
  "exp": 1714604800
}
```

---

## Usuários de Teste

Após executar o `seed.sql`:

| Nome           | E-mail                   | Senha     | Role  |
|----------------|--------------------------|-----------|-------|
| Administrador  | admin@alexandria.com     | password  | admin |
| Ana Souza      | ana@email.com            | password  | user  |
| Pedro Lima     | pedro@email.com          | password  | user  |

> Lembre-se de gerar hashes corretos se quiser usar senhas diferentes (ver seção Banco de Dados).

---

## Endpoints Resumidos

| Método | Rota                      | Descrição                           | Acesso         |
|--------|---------------------------|-------------------------------------|----------------|
| POST   | `/api/auth/register`      | Registrar usuário                   | Público        |
| POST   | `/api/auth/login`         | Login — retorna JWT                 | Público        |
| GET    | `/api/auth/profile`       | Perfil do usuário logado            | Auth           |
| GET    | `/api/users`              | Listar usuários                     | Admin          |
| GET    | `/api/users/:id`          | Buscar usuário                      | Admin          |
| PUT    | `/api/users/:id`          | Atualizar usuário                   | Admin          |
| DELETE | `/api/users/:id`          | Remover usuário                     | Admin          |
| GET    | `/api/authors`            | Listar autores                      | Auth           |
| GET    | `/api/authors/:id`        | Buscar autor                        | Auth           |
| POST   | `/api/authors`            | Criar autor                         | Admin          |
| PUT    | `/api/authors/:id`        | Atualizar autor                     | Admin          |
| DELETE | `/api/authors/:id`        | Remover autor                       | Admin          |
| GET    | `/api/categories`         | Listar categorias                   | Auth           |
| GET    | `/api/categories/:id`     | Buscar categoria                    | Auth           |
| POST   | `/api/categories`         | Criar categoria                     | Admin          |
| PUT    | `/api/categories/:id`     | Atualizar categoria                 | Admin          |
| DELETE | `/api/categories/:id`     | Remover categoria                   | Admin          |
| GET    | `/api/books`              | Listar livros                       | Auth           |
| GET    | `/api/books/:id`          | Buscar livro                        | Auth           |
| POST   | `/api/books`              | Criar livro                         | Admin          |
| PUT    | `/api/books/:id`          | Atualizar livro                     | Admin          |
| DELETE | `/api/books/:id`          | Remover livro                       | Admin          |
| GET    | `/api/loans`              | Listar empréstimos                  | Admin/User(*)  |
| GET    | `/api/loans/:id`          | Buscar empréstimo                   | Admin/Dono     |
| POST   | `/api/loans`              | Realizar empréstimo                 | Auth           |
| PATCH  | `/api/loans/:id/return`   | Registrar devolução                 | Admin          |
| DELETE | `/api/loans/:id`          | Remover empréstimo                  | Admin          |

(*) Admin vê todos; User vê apenas os próprios.

---

## Paginação

Todas as rotas de listagem aceitam os parâmetros de query:

| Parâmetro | Padrão | Descrição                      |
|-----------|--------|--------------------------------|
| `page`    | `1`    | Número da página               |
| `limit`   | `10`   | Quantidade de itens por página |

**Exemplo:** `GET /api/books?page=2&limit=5`

**Resposta:**
```json
{
  "data": [ ... ],
  "total": 10,
  "page": 2,
  "limit": 5
}
```

---

## Estrutura do Código — Explicação Didática

### `server.js`
Ponto de entrada da aplicação. Configura os middlewares globais (helmet, cors, json parser), monta o Swagger e registra o roteador principal em `/api`. Inicia o servidor na porta definida no `.env`.

### `src/config/database.js`
Cria e exporta um **pool de conexões** MySQL usando `mysql2/promise`. O pool reutiliza conexões abertas em vez de abrir uma nova para cada requisição, o que é mais eficiente. Basta importar e chamar `pool.query(sql, params)` em qualquer model.

### `src/config/swagger.js`
Configura o `swagger-jsdoc` para varrer os comentários JSDoc nos arquivos de rotas (`src/routes/*.js`) e gerar automaticamente a especificação OpenAPI 3.0. Define também o esquema de autenticação `bearerAuth`.

### `src/middlewares/auth.js`
Middleware de **autenticação**. Extrai o token do header `Authorization`, verifica com `jwt.verify()` e injeta o payload decodificado em `req.user`. Se o token estiver ausente ou inválido, responde com 401.

### `src/middlewares/authorize.js`
Middleware de **autorização** (controle de acesso por perfil). Recebe uma lista de roles permitidos e retorna uma função middleware que verifica se `req.user.role` está incluído. Se não estiver, responde com 403. É usado após `authenticate`.

### `src/middlewares/errorHandler.js`
Middleware de **tratamento centralizado de erros**. Deve ser registrado como o último middleware no `server.js`. Recebe erros propagados via `next(err)` em qualquer controller e retorna uma resposta JSON padronizada. Em modo `development`, inclui o stack trace.

### `src/models/*.js`
Cada model é um objeto com métodos `async` que executam queries SQL puras usando `pool.query()`. Não há ORM — isso permite que os alunos vejam e testem o SQL diretamente. Os models seguem o padrão:
- `findAll({ page, limit })` — listagem com paginação
- `findById(id)` — busca por chave primária
- `create(dados)` — INSERT, retorna o `insertId`
- `update(id, fields)` — UPDATE dinâmico
- `remove(id)` — DELETE

### `src/controllers/*.js`
Os controllers recebem `(req, res, next)`, chamam o model adequado, aplicam a lógica de negócio e respondem com JSON. Erros são sempre delegados ao `next(err)` para o `errorHandler` tratar. Nunca fazem acesso direto ao banco.

### `src/routes/*.js`
Cada arquivo de rota define um `express.Router()`, aplica os middlewares de autenticação/autorização e conecta os endpoints aos controllers. Os comentários JSDoc `@swagger` nestas rotas geram a documentação automática.

### `src/routes/index.js`
Agrega todos os roteadores parciais e os monta sob seus prefixos (`/auth`, `/users`, `/books`, etc.). O `server.js` monta este roteador em `/api`.

### `migrations/schema.sql`
Script SQL que cria o banco de dados `alexandria` e todas as tabelas com suas constraints (chaves estrangeiras, unique, etc.). Deve ser executado uma única vez, antes de iniciar o projeto.

### `migrations/seed.sql`
Script SQL com dados iniciais para popular o banco em ambiente de desenvolvimento e testes. Inclui usuários, categorias, autores, livros e empréstimos de exemplo.

### `docs/requirements.md`
Documento de requisitos com a descrição de todas as entidades, regras de negócio, permissões por endpoint e sugestões de cenários para os testes.

---

## Guia para Testes

### Pré-requisitos
- Banco de dados criado e populado (`schema.sql` + `seed.sql`)
- Servidor rodando (`npm run dev`)
- Cliente HTTP instalado (Thunder Client, Insomnia, Bruno ou Postman)

### Fluxo básico de teste manual

**1. Registrar um usuário**
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Teste Aluno",
  "email": "aluno@teste.com",
  "password": "senha123"
}
```

**2. Fazer login e copiar o token**
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@alexandria.com",
  "password": "password"
}
```

**3. Usar o token nas próximas requisições**
```http
GET http://localhost:3000/api/books
Authorization: Bearer <token_aqui>
```

**4. Criar um empréstimo**
```http
POST http://localhost:3000/api/loans
Authorization: Bearer <token_aqui>
Content-Type: application/json

{
  "book_id": 1,
  "due_date": "2026-06-01"
}
```

**5. Registrar devolução (admin)**
```http
PATCH http://localhost:3000/api/loans/1/return
Authorization: Bearer <token_admin_aqui>
```

### Dicas para implementar os testes

- Use **variáveis de ambiente de teste** (banco separado do desenvolvimento)
- Para testes de integração, faça **setup e teardown** do banco antes/após os testes
- Para testes unitários de middlewares, use **mocks** de `req`, `res` e `next`
- Consulte `docs/requirements.md` para a lista completa de cenários sugeridos
